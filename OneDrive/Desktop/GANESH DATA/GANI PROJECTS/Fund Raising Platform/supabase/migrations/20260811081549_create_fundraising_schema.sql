/*
# NayePankh Fundraising Portal - Database Schema

## Overview
Creates the complete database schema for the NayePankh Fundraising Portal,
a full-stack fundraising and donation management platform for NayePankh Foundation.

## New Tables
1. `profiles` - User profiles extending auth.users with referral codes, roles, fundraising goals
2. `campaigns` - Fundraising campaigns with goals, progress tracking, categories
3. `donations` - Donation records linked to campaigns and referrers, with payment tracking
4. `notifications` - User notifications for donations, milestones, and system events
5. `referral_clicks` - Tracking records for referral link visits

## Views
1. `public_profiles` - Public-facing profile data for referral/donation pages (name, code, image, bio)
2. `user_stats` - Aggregated statistics per user (total raised, donation count, clicks)
3. `leaderboard` - Public leaderboard of top fundraisers, ordered by total raised

## Triggers
1. `handle_new_user` - Auto-creates profile with unique referral code on signup
2. `update_campaign_raised` - Updates campaign.raised_amount when donation status changes
3. `update_updated_at` - Auto-updates updated_at timestamps
4. `check_profile_update` - Prevents non-admins from changing role/active status/referral code

## Security (RLS)
- profiles: authenticated SELECT (all), owner/admin UPDATE
- campaigns: public SELECT (active only), admin full CRUD
- donations: owner/admin SELECT, admin UPDATE (edge function handles INSERT via service role)
- notifications: owner SELECT/UPDATE/DELETE, admin INSERT
- referral_clicks: owner/admin SELECT (edge function handles INSERT via service role)
- Views: public SELECT for public_profiles and leaderboard, authenticated SELECT for user_stats
*/

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  referral_code text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio text,
  profile_image text,
  is_active boolean NOT NULL DEFAULT true,
  fundraising_goal bigint NOT NULL DEFAULT 50000,
  show_on_leaderboard boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
CREATE POLICY "profiles_select_authenticated"
ON profiles FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON profiles;
CREATE POLICY "profiles_update_own_or_admin"
ON profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  auth.uid() = id OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Prevent non-admins from changing role, referral_code, or is_active
CREATE OR REPLACE FUNCTION check_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'Referral code cannot be changed';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
      RAISE EXCEPTION 'Only administrators can change user roles';
    END IF;
  END IF;

  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
      RAISE EXCEPTION 'Only administrators can change active status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_check_update ON profiles;
CREATE TRIGGER profiles_check_update
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION check_profile_update();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_code text;
  referral_code text;
  random_suffix text;
  clean_name text;
BEGIN
  clean_name := COALESCE(NEW.raw_user_meta_data->>'name', 'USER');
  base_code := UPPER(REGEXP_REPLACE(SUBSTRING(clean_name FROM 1 FOR 4), '[^A-Za-z0-9]', '', 'g'));
  WHILE LENGTH(COALESCE(base_code, '')) < 4 LOOP
    base_code := COALESCE(base_code, '') || 'X';
  END LOOP;

  random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::text || NEW.id::text) FROM 1 FOR 4));
  referral_code := 'NPF-' || base_code || '-' || random_suffix;

  WHILE EXISTS (SELECT 1 FROM profiles WHERE referral_code = referral_code) LOOP
    random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::text || NEW.id::text || CLOCK_TIMESTAMP()::text) FROM 1 FOR 4));
    referral_code := 'NPF-' || base_code || '-' || random_suffix;
  END LOOP;

  INSERT INTO profiles (id, name, email, referral_code, role)
  VALUES (NEW.id, clean_name, NEW.email, referral_code, 'user');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- CAMPAIGNS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  short_description text NOT NULL,
  goal_amount bigint NOT NULL CHECK (goal_amount > 0),
  raised_amount bigint NOT NULL DEFAULT 0,
  image text,
  category text NOT NULL,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Anyone can view active campaigns
DROP POLICY IF EXISTS "campaigns_select_public" ON campaigns;
CREATE POLICY "campaigns_select_public"
ON campaigns FOR SELECT
TO anon, authenticated USING (status = 'active');

-- Admins can view all campaigns
DROP POLICY IF EXISTS "campaigns_select_admin" ON campaigns;
CREATE POLICY "campaigns_select_admin"
ON campaigns FOR SELECT
TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Admin can create campaigns
DROP POLICY IF EXISTS "campaigns_insert_admin" ON campaigns;
CREATE POLICY "campaigns_insert_admin"
ON campaigns FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Admin can update campaigns
DROP POLICY IF EXISTS "campaigns_update_admin" ON campaigns;
CREATE POLICY "campaigns_update_admin"
ON campaigns FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admin can delete campaigns
DROP POLICY IF EXISTS "campaigns_delete_admin" ON campaigns;
CREATE POLICY "campaigns_delete_admin"
ON campaigns FOR DELETE
TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP TRIGGER IF EXISTS campaigns_updated_at ON campaigns;
CREATE TRIGGER campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);

-- ============================================================
-- DONATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL UNIQUE DEFAULT ('TXN' || UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 12))),
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  donor_phone text,
  amount bigint NOT NULL CHECK (amount > 0),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  referrer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code text,
  payment_gateway text NOT NULL DEFAULT 'mock',
  payment_id text,
  order_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  is_anonymous boolean NOT NULL DEFAULT false,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Referrer can see own donations, admin can see all
DROP POLICY IF EXISTS "donations_select_own_admin" ON donations;
CREATE POLICY "donations_select_own_admin"
ON donations FOR SELECT
TO authenticated USING (
  auth.uid() = referrer_id OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Admin can update donations (for refunds, status changes)
DROP POLICY IF EXISTS "donations_update_admin" ON donations;
CREATE POLICY "donations_update_admin"
ON donations FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admin can delete donations
DROP POLICY IF EXISTS "donations_delete_admin" ON donations;
CREATE POLICY "donations_delete_admin"
ON donations FOR DELETE
TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP TRIGGER IF EXISTS donations_updated_at ON donations;
CREATE TRIGGER donations_updated_at
BEFORE UPDATE ON donations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update campaign raised_amount when donation status changes
CREATE OR REPLACE FUNCTION update_campaign_raised()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'success' AND NEW.campaign_id IS NOT NULL THEN
    UPDATE campaigns SET raised_amount = raised_amount + NEW.amount WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'success' AND OLD.status <> 'success' AND NEW.campaign_id IS NOT NULL THEN
      UPDATE campaigns SET raised_amount = raised_amount + NEW.amount WHERE id = NEW.campaign_id;
    ELSIF OLD.status = 'success' AND NEW.status <> 'success' AND OLD.campaign_id IS NOT NULL THEN
      UPDATE campaigns SET raised_amount = GREATEST(raised_amount - OLD.amount, 0) WHERE id = OLD.campaign_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS donations_after_insert_update ON donations;
CREATE TRIGGER donations_after_insert_update
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW EXECUTE FUNCTION update_campaign_raised();

CREATE INDEX IF NOT EXISTS idx_donations_referrer ON donations(referrer_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_referral_code ON donations(referral_code);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('donation', 'goal', 'system', 'info')),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own"
ON notifications FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- Admin can insert notifications (for system announcements)
DROP POLICY IF EXISTS "notifications_insert_admin" ON notifications;
CREATE POLICY "notifications_insert_admin"
ON notifications FOR INSERT
TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================================
-- REFERRAL_CLICKS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS referral_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referral_clicks_select_own_admin" ON referral_clicks;
CREATE POLICY "referral_clicks_select_own_admin"
ON referral_clicks FOR SELECT
TO authenticated USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_user ON referral_clicks(user_id);

-- ============================================================
-- VIEWS
-- ============================================================

-- Public profiles (for referral/donation pages - only non-sensitive columns)
CREATE OR REPLACE VIEW public_profiles AS
SELECT id, name, referral_code, profile_image, bio
FROM profiles;

GRANT SELECT ON public_profiles TO anon, authenticated;

-- User stats (aggregated, for dashboard and admin)
CREATE OR REPLACE VIEW user_stats AS
SELECT
  p.id, p.name, p.email, p.phone, p.referral_code, p.role, p.bio, p.profile_image,
  p.is_active, p.fundraising_goal, p.show_on_leaderboard, p.created_at,
  COALESCE((SELECT SUM(amount) FROM donations WHERE referrer_id = p.id AND status = 'success'), 0) as total_raised,
  COALESCE((SELECT COUNT(*) FROM donations WHERE referrer_id = p.id AND status = 'success'), 0) as donation_count,
  COALESCE((SELECT COUNT(*) FROM referral_clicks WHERE user_id = p.id), 0) as total_clicks
FROM profiles p;

GRANT SELECT ON user_stats TO authenticated;

-- Leaderboard (public, top fundraisers)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id, p.name, p.referral_code, p.profile_image,
  COALESCE((SELECT SUM(amount) FROM donations WHERE referrer_id = p.id AND status = 'success'), 0) as total_raised,
  COALESCE((SELECT COUNT(*) FROM donations WHERE referrer_id = p.id AND status = 'success'), 0) as donation_count
FROM profiles p
WHERE p.show_on_leaderboard = true AND p.is_active = true
ORDER BY total_raised DESC;

GRANT SELECT ON leaderboard TO anon, authenticated;