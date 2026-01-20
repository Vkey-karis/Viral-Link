
import { supabase } from './supabaseClient';

/**
 * Initiates a PayPal Checkout session by calling a Supabase Edge Function.
 * This returns an approval URL that the user can open in a new tab.
 */
export const createPayPalOrder = async (userId: string, amount: number) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-paypal-order', {
      body: { userId, amount }
    });

    if (error) {
      console.error("Supabase Function Error:", error);
      throw new Error(error.message || "Payment service temporarily unavailable.");
    }
    
    if (!data?.approvalUrl) {
      throw new Error("Invalid response from payment service.");
    }

    return data.approvalUrl;
  } catch (err: any) {
    console.error("createPayPalOrder exception:", err);
    throw err;
  }
};

/**
 * Manually checks if the user's subscription has been updated.
 */
export const checkUserSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data.subscription_tier === 'premium';
};

/**
 * Updates the user's tier in the database (typically called by Webhook).
 */
export const upgradeUserToPremium = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: 'premium' })
    .eq('id', userId);
  
  if (error) throw error;
};
