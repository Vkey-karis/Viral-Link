
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

/**
 * DATABASE CONFIGURATION
 * Project: hclqrvjrjhyukxxfatdw
 */

const PROJECT_ID = 'hclqrvjrjhyukxxfatdw';
const DEFAULT_URL = `https://${PROJECT_ID}.supabase.co`;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Initializes the Supabase client safely.
 */
const initializeSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase Configuration Error: Credentials missing.");

    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signInWithPassword: async () => ({ data: {}, error: new Error("Supabase credentials not configured.") }),
        signInWithOAuth: async () => ({ data: {}, error: new Error("Supabase credentials not configured.") }),
        signUp: async () => ({ data: {}, error: new Error("Supabase credentials not configured.") }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      functions: {
        invoke: async () => ({ data: null, error: new Error("Supabase Functions not configured") })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error("Supabase not configured") }),
            limit: () => ({ data: [], error: null })
          }),
          order: () => ({ data: [], error: null })
        }),
        insert: async () => ({ data: null, error: new Error("Supabase not configured") }),
        update: async () => ({ data: null, error: new Error("Supabase not configured") }),
      })
    } as any;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to initialize Supabase client instance:", err);
    return {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
      },
      functions: { invoke: async () => ({ data: null, error: err }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }) })
    } as any;
  }
};

export const supabase = initializeSupabase();

export type SubscriptionTier = 'free' | 'premium';

export interface UserProfile {
  id: string;
  email: string;
  subscription_tier: SubscriptionTier;
  credits: number;
}
