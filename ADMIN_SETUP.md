# Admin Dashboard Setup Guide

## Overview
This guide will help you set up the admin dashboard for ViralLink, allowing you to manage users, view subscriptions, and track earnings.

## Prerequisites
- Supabase account with access to your project
- Admin credentials (email and password)

## Step 1: Run SQL Migration

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/hclqrvjrjhyukxxfatdw
2. Navigate to **SQL Editor** in the left sidebar
3. Open the file: `f:\ViralLink\supabase\setup_admin.sql`
4. Copy the entire SQL script
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

This will create:
- `earnings` table for tracking payments
- `is_admin` column in `profiles` table
- `admin_users_view` for user management
- `get_admin_stats()` function for dashboard statistics
- Row Level Security (RLS) policies

## Step 2: Create Admin User in Supabase Auth

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your admin email: `admin@virallink.com` (or your preferred email)
4. Enter a secure password
5. Click **Create user**

## Step 3: Mark User as Admin

After creating the user, you need to mark them as admin in the database:

1. Go to **SQL Editor** in Supabase
2. Run this query (replace the email with your admin email):

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@virallink.com'
);
```

3. Verify the update:

```sql
SELECT u.email, p.is_admin 
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.is_admin = true;
```

## Step 4: Configure Environment Variables

### For Local Development

Your `.env` file already has the admin credentials:

```env
VITE_ADMIN_EMAIL=admin@virallink.com
VITE_ADMIN_PASSWORD=ViralLink2026!Admin
```

**Important**: Change the password to match the one you set in Supabase Auth (Step 2).

### For Hostinger Deployment

1. Log in to your Hostinger control panel
2. Navigate to your website's settings
3. Find **Environment Variables** or **Configuration**
4. Add these variables:
   - `VITE_ADMIN_EMAIL` = `admin@virallink.com`
   - `VITE_ADMIN_PASSWORD` = `your-secure-password`
5. Save the changes
6. Rebuild and redeploy your application

## Step 5: Test Admin Login

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Enter your admin credentials:
   - Email: `admin@virallink.com`
   - Password: (the one you set in Supabase)

4. You should be automatically redirected to the Admin Dashboard

5. Verify you can see:
   - User statistics
   - User list with subscription tiers
   - Earnings data (if any)

## Admin Dashboard Features

### Statistics Cards
- **Total Users**: Count of all registered users
- **Premium Users**: Users with premium subscriptions
- **Total Earnings**: All-time revenue
- **This Month**: Current month's earnings
- **Videos Created**: Total videos generated
- **Free Users**: Users on free tier

### User Management
- View all users with email, subscription tier, credits
- See total videos generated per user
- Track total spent per user
- Search users by email
- Filter by subscription tier (All/Free/Premium)

### Earnings Tracking
- View recent transactions
- See payment amounts, dates, and methods
- Track transaction IDs
- Filter by subscription tier

## Security Notes

> [!WARNING]
> **Keep Admin Credentials Secure**
> - Never commit `.env` files to version control
> - Use strong, unique passwords
> - Change default credentials immediately
> - Consider implementing 2FA in the future

> [!IMPORTANT]
> **Row Level Security**
> - Only users with `is_admin = true` can access admin data
> - RLS policies prevent unauthorized access to earnings table
> - Regular users cannot see admin views or functions

## Troubleshooting

### "Admin dashboard not showing"
- Verify `is_admin = true` in profiles table
- Check environment variables are set correctly
- Ensure credentials match exactly (case-sensitive)

### "Cannot access earnings data"
- Verify RLS policies were created (Step 1)
- Check admin flag is set in database
- Review browser console for errors

### "SQL migration failed"
- Check if tables already exist
- Verify you have necessary permissions
- Try running individual statements

## Adding More Admins

To add additional admin users:

1. Create user in Supabase Auth (Step 2)
2. Mark as admin in database (Step 3)
3. They can use the same login page with their credentials

## Next Steps

- Set up automated earnings tracking from payment webhooks
- Add user management features (suspend, delete, modify)
- Implement analytics and reporting
- Add export functionality for user data
- Set up email notifications for admin alerts
