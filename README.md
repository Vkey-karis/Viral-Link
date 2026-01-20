
# ViralLink AI | Affiliate Video Synthesis Engine

ViralLink AI is an industrial-grade production suite designed for high-ticket affiliate marketers. It automates the entire funnel from product discovery and intelligence extraction to cinematic video production.

## 🚀 Core Features
- **Global Intelligence Scraper**: Supports 40+ marketplaces.
- **AI Strategy Architect**: Generates viral hooks and scripts using Gemini 3.
- **Veo Cinematic Engine**: Produces high-retention 9:16 vertical video assets.

## 💳 PayPal & Database Implementation Guide

### 1. Database Schema
Run this in your Supabase SQL Editor to prepare your backend:

```sql
-- Main user profile table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and tracking table
CREATE TABLE usage_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own logs" ON usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2. Supabase Edge Functions
Deploy these functions for secure PayPal handling:

1.  **Deploy the Webhook**: Use the code in `supabase/functions/paypal-webhook/index.ts`.
2.  **Deploy Order Creator**: Use the code in `supabase/functions/create-paypal-order/index.ts`.
3.  **Set Secrets**: Run these commands in your CLI:
    ```bash
    supabase secrets set PAYPAL_CLIENT_ID=your_client_id
    supabase secrets set PAYPAL_SECRET_KEY=your_secret_key
    ```

### 3. Register Webhook in PayPal
*   Get your function URL: `https://[PROJECT_ID].supabase.co/functions/v1/paypal-webhook`
*   In PayPal Dashboard, add this URL to your App's webhooks.
*   Select the event: `PAYMENT.CAPTURE.COMPLETED`.

---
*Built for the next generation of affiliate revenue.*
