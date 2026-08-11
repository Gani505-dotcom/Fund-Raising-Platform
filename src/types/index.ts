export type UserRole = "user" | "admin";

export type CampaignStatus = "active" | "paused" | "completed";

export type DonationStatus = "pending" | "success" | "failed" | "refunded";

export type NotificationType = "donation" | "goal" | "system" | "info";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  referral_code: string;
  role: UserRole;
  bio: string | null;
  profile_image: string | null;
  is_active: boolean;
  fundraising_goal: number;
  show_on_leaderboard: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  referral_code: string;
  role: UserRole;
  bio: string | null;
  profile_image: string | null;
  is_active: boolean;
  fundraising_goal: number;
  show_on_leaderboard: boolean;
  created_at: string;
  total_raised: number;
  donation_count: number;
  total_clicks: number;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  goal_amount: number;
  raised_amount: number;
  image: string | null;
  category: string;
  start_date: string | null;
  end_date: string | null;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  transaction_id: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string | null;
  amount: number;
  campaign_id: string | null;
  referrer_id: string | null;
  referral_code: string | null;
  payment_gateway: string;
  payment_id: string | null;
  order_id: string | null;
  status: DonationStatus;
  is_anonymous: boolean;
  message: string | null;
  created_at: string;
  updated_at: string;
  campaigns?: Campaign | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface ReferralClick {
  id: string;
  referral_code: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  referral_code: string;
  profile_image: string | null;
  total_raised: number;
  donation_count: number;
}

export interface PublicProfile {
  id: string;
  name: string;
  referral_code: string;
  profile_image: string | null;
  bio: string | null;
}

export interface CreateOrderResponse {
  orderId: string;
  donationId: string;
  transactionId: string;
  amount: number;
  paymentGateway: string;
  mockMode: boolean;
}

export interface VerifyPaymentResponse {
  success: boolean;
  transactionId: string;
  paymentId: string | null;
  amount: number;
  donorName: string;
}
