-- ViralLink Admin Dashboard Setup
-- Run this script in your Supabase SQL Editor

-- 1. Create earnings table to track subscription payments
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  subscription_tier TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add is_admin column to profiles table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 3. Create admin view for user management
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  p.subscription_tier,
  p.credits,
  p.is_admin,
  p.created_at as profile_created_at,
  (SELECT COUNT(*) FROM usage_logs WHERE user_id = u.id) as total_videos_generated,
  (SELECT SUM(amount) FROM earnings WHERE user_id = u.id) as total_spent
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. Create function to get admin statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'premium_users', (SELECT COUNT(*) FROM profiles WHERE subscription_tier = 'premium'),
    'free_users', (SELECT COUNT(*) FROM profiles WHERE subscription_tier = 'free'),
    'total_earnings', (SELECT COALESCE(SUM(amount), 0) FROM earnings),
    'earnings_this_month', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM earnings 
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
    ),
    'total_videos_generated', (SELECT COUNT(*) FROM usage_logs)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Set up Row Level Security (RLS) policies

-- Enable RLS on earnings table
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

-- Admin can view all earnings
CREATE POLICY "Admins can view all earnings"
  ON earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Admin can insert earnings
CREATE POLICY "Admins can insert earnings"
  ON earnings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- 6. Grant necessary permissions
GRANT SELECT ON admin_users_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;

-- 7. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_earnings_user_id ON earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_created_at ON earnings(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- 8. Insert admin user (REPLACE WITH YOUR ACTUAL ADMIN EMAIL)
-- Note: You need to create the user in Supabase Auth first, then run this
-- UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@virallink.com');

COMMENT ON TABLE earnings IS 'Tracks all subscription payments and earnings';
COMMENT ON VIEW admin_users_view IS 'Admin view of all users with their profiles and statistics';
COMMENT ON FUNCTION get_admin_stats() IS 'Returns aggregated statistics for admin dashboard';
