
import React, { useState, useEffect } from 'react';
import { supabase, UserProfile as UserProfileType } from '../services/supabaseClient';
import Pricing from './Pricing';
import { Shield, Zap, TrendingUp, CreditCard, ArrowLeft, MoreHorizontal, Clock, Battery } from 'lucide-react';

interface Props {
    session: any;
    onBack: () => void;
}

const UserProfile: React.FC<Props> = ({ session, onBack }) => {
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPricing, setShowPricing] = useState(false);

    const fetchProfile = async () => {
        if (!session?.user?.id) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [session]);

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'premium': return 'indigo';
            case 'agency': return 'red';
            case 'growth': return 'purple';
            case 'starter': return 'emerald';
            default: return 'slate';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-32 px-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-32 px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Your Profile</h1>
                        <p className="text-slate-500 font-medium text-sm">Manage your plan and usage</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plan Card */}
                    <div className="glass-card p-8 rounded-[2rem] border-white/5 space-y-6 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-4 opacity-50 bg-${getTierColor(profile?.subscription_tier || 'free')}-500/10 rounded-bl-[2rem]`}>
                            <Shield className={`w-8 h-8 text-${getTierColor(profile?.subscription_tier || 'free')}-400`} />
                        </div>

                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Plan</span>
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                                {profile?.subscription_tier === 'premium' ? 'Pro Access' :
                                    profile?.subscription_tier === 'free' ? 'Starter' : profile?.subscription_tier}
                            </h2>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => setShowPricing(true)}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                                <Zap className="w-4 h-4" /> Upgrade Plan
                            </button>
                        </div>
                    </div>

                    {/* Credits Card */}
                    <div className="glass-card p-8 rounded-[2rem] border-white/5 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-50 bg-emerald-500/10 rounded-bl-[2rem]">
                            <Battery className="w-8 h-8 text-emerald-400" />
                        </div>

                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Available Credits</span>
                            <h2 className="text-4xl font-black text-white tracking-tighter">
                                {profile?.credits || 0}
                            </h2>
                        </div>
                        <p className="text-slate-400 text-xs font-medium">
                            100 credits = 10s of video generation.
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={() => setShowPricing(true)}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                                <CreditCard className="w-4 h-4" /> Buy Credits
                            </button>
                        </div>
                    </div>
                </div>

                {/* Upgrade Prompt */}
                {!profile?.subscription_tier || profile.subscription_tier === 'free' ? (
                    <div className="p-8 rounded-[2rem] bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 flex items-center justify-between">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Unlock Professional Features</h3>
                            <p className="text-slate-400 text-sm max-w-md">Get higher limits, faster limits, and premium templates by upgrading to a Pro plan.</p>
                        </div>
                        <button
                            onClick={() => setShowPricing(true)}
                            className="px-8 py-3 bg-white text-slate-900 font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all text-xs"
                        >
                            View Plans
                        </button>
                    </div>
                ) : null}
            </div>

            {showPricing && (
                <Pricing
                    onClose={() => setShowPricing(false)}
                    userProfile={profile}
                    onPaymentSuccess={() => {
                        fetchProfile();
                        // Pricing modal typically closes itself via onClose after success logic, 
                        // but we ensure refetch happens.
                    }}
                />
            )}
        </div>
    );
};

export default UserProfile;
