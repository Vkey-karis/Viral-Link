import { supabase } from './supabaseClient';

/**
 * Admin Service
 * Handles admin-specific operations like user management and analytics
 */

export interface AdminStats {
    total_users: number;
    premium_users: number;
    free_users: number;
    total_earnings: number;
    earnings_this_month: number;
    total_videos_generated: number;
}

export interface UserWithProfile {
    id: string;
    email: string;
    user_created_at: string;
    subscription_tier: 'free' | 'premium';
    credits: number;
    is_admin: boolean;
    total_videos_generated: number;
    total_spent: number;
}

export interface EarningsRecord {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    subscription_tier: string;
    payment_method: string;
    transaction_id: string;
    created_at: string;
}

/**
 * Check if the current logged-in user is an admin
 */
export const isAdmin = async (): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Check against environment variables
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        if (user.email === adminEmail) {
            return true;
        }

        // Also check database flag
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        return profile?.is_admin || false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async (): Promise<AdminStats | null> => {
    try {
        const { data, error } = await supabase.rpc('get_admin_stats');

        if (error) {
            console.error('Error fetching admin stats:', error);
            return null;
        }

        return data as AdminStats;
    } catch (error) {
        console.error('Error in getAdminStats:', error);
        return null;
    }
};

/**
 * Get all users with their profiles
 */
export const getAllUsers = async (): Promise<UserWithProfile[]> => {
    try {
        const { data, error } = await supabase
            .from('admin_users_view')
            .select('*')
            .order('user_created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }

        return (data || []) as UserWithProfile[];
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        return [];
    }
};

/**
 * Get all earnings records
 */
export const getAllEarnings = async (): Promise<EarningsRecord[]> => {
    try {
        const { data, error } = await supabase
            .from('earnings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching earnings:', error);
            return [];
        }

        return (data || []) as EarningsRecord[];
    } catch (error) {
        console.error('Error in getAllEarnings:', error);
        return [];
    }
};

/**
 * Get earnings for a specific time period
 */
export const getEarningsByPeriod = async (
    startDate: Date,
    endDate: Date
): Promise<EarningsRecord[]> => {
    try {
        const { data, error } = await supabase
            .from('earnings')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching earnings by period:', error);
            return [];
        }

        return (data || []) as EarningsRecord[];
    } catch (error) {
        console.error('Error in getEarningsByPeriod:', error);
        return [];
    }
};

/**
 * Update user's admin status
 */
export const updateUserAdminStatus = async (
    userId: string,
    isAdmin: boolean
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ is_admin: isAdmin })
            .eq('id', userId);

        if (error) {
            console.error('Error updating admin status:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in updateUserAdminStatus:', error);
        return false;
    }
};

/**
 * Record a new earning
 */
export const recordEarning = async (
    userId: string,
    amount: number,
    subscriptionTier: string,
    paymentMethod: string,
    transactionId?: string
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('earnings')
            .insert({
                user_id: userId,
                amount,
                subscription_tier: subscriptionTier,
                payment_method: paymentMethod,
                transaction_id: transactionId,
                currency: 'USD'
            });

        if (error) {
            console.error('Error recording earning:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in recordEarning:', error);
        return false;
    }
};
