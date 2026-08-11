/*
# Fix new-user profile creation

1. Purpose
- Repairs the automatic profile creation that runs when a new Supabase Auth user signs up.
- The previous referral-code loop used the same name for the local variable and database column, which could make the condition ambiguous or always match itself and prevent signup.

2. Modified database objects
- `handle_new_user()` now uses clearly named local variables for the generated referral code.
- The referral-code uniqueness check explicitly compares the generated value against `profiles.referral_code`.
- The function uses a fixed `public` search path for predictable, secure object resolution.

3. Data safety
- No tables, columns, or existing user data are deleted or changed.
- Existing profiles remain untouched.
- The repair applies only to future signups and to any signup retry that invokes the trigger.

4. Security
- The trigger remains `SECURITY DEFINER` so Supabase Auth can create the matching public profile.
- The function search path is fixed to `public` to reduce search-path manipulation risk.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_code text;
  v_referral_code text;
  v_random_suffix text;
  v_clean_name text;
BEGIN
  v_clean_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 'USER');
  v_base_code := UPPER(REGEXP_REPLACE(SUBSTRING(v_clean_name FROM 1 FOR 4), '[^A-Za-z0-9]', '', 'g'));

  WHILE LENGTH(COALESCE(v_base_code, '')) < 4 LOOP
    v_base_code := COALESCE(v_base_code, '') || 'X';
  END LOOP;

  LOOP
    v_random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::text || NEW.id::text || CLOCK_TIMESTAMP()::text) FROM 1 FOR 4));
    v_referral_code := 'NPF-' || v_base_code || '-' || v_random_suffix;

    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM public.profiles AS existing_profile
      WHERE existing_profile.referral_code = v_referral_code
    );
  END LOOP;

  INSERT INTO public.profiles (id, name, email, referral_code, role)
  VALUES (NEW.id, v_clean_name, NEW.email, v_referral_code, 'user');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();