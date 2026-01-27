import React, { useState, useEffect, useRef } from 'react';
import { Check, Rocket, CreditCard, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Shield, Zap, Video, FileText, Search, Smartphone, Target, Layers, MessageSquareQuote } from 'lucide-react';
import { UserProfile } from '../services/supabaseClient';
import { createPayPalOrder, checkUserSubscription } from '../services/paymentService';

interface Props {
  onClose: () => void;
  userProfile: UserProfile | null;
  onPaymentSuccess: () => void;
}

const Pricing: React.FC<Props> = ({ onClose, userProfile, onPaymentSuccess }) => {
  const [processingTier, setProcessingTier] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  useEffect(() => {
    if (checkoutStarted && !isSuccess && userProfile?.id) {
      pollingInterval.current = setInterval(async () => {
        try {
          const isPremium = await checkUserSubscription(userProfile.id);
          if (isPremium) {
            handleSuccessfulUpgrade();
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 4000);
    }
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [checkoutStarted, isSuccess, userProfile?.id]);

  const handleSuccessfulUpgrade = () => {
    if (pollingInterval.current) clearInterval(pollingInterval.current);
    setIsSuccess(true);
    setTimeout(() => {
      onPaymentSuccess();
      onClose();
    }, 2500);
  };

  const handleStartCheckout = async (amount: number) => {
    if (!userProfile?.id) return;
    setProcessingTier(amount);
    setError(null);

    try {
      const approvalUrl = await createPayPalOrder(userProfile.id, amount);
      window.open(approvalUrl, '_blank');
      setCheckoutStarted(true);
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setError("Failed to connect to payment gateway. Please try again.");
    } finally {
      setProcessingTier(null);
    }
  };

  const handleVerifyPayment = async () => {
    if (!userProfile?.id) return;
    try {
      const isPremium = await checkUserSubscription(userProfile.id);
      if (isPremium) {
        handleSuccessfulUpgrade();
      } else {
        setError("Payment not detected yet. Please ensure you completed the transaction.");
      }
    } catch (err) {
      setError("Error verifying status. Please try again.");
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-slate-950/98 backdrop-blur-3xl animate-fade-in text-center">
        <div className="space-y-8 max-w-sm">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/30 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Activated</h2>
            <p className="text-slate-400 font-medium tracking-tight">Your account has been successfully upgraded.</p>
          </div>
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (checkoutStarted) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-slate-950/95 backdrop-blur-xl animate-fade-in">
        <div className="max-w-md w-full bg-slate-900 p-10 rounded-[3rem] border border-white/10 text-center space-y-8 shadow-2xl">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <CreditCard className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Completing Purchase...</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Please complete the secure payment in the new tab we opened. Once done, we'll automatically unlock your features.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleVerifyPayment}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20"
            >
              I've Paid
            </button>
            <button
              onClick={() => setCheckoutStarted(false)}
              className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tiers = [
    {
      name: '🟢 Starter',
      price: 60,
      credits: 500,
      seconds: 50,
      desc: 'Best for testing offers',
      features: [
        { name: 'Script + Hook + CTA', icon: FileText },
        { name: 'Auto-format for TikTok, Reels & Shorts', icon: Smartphone },
        { name: 'Affiliate-ready videos', icon: CheckCircle2 },
        { name: 'Credits never expire', icon: Shield },
      ],
      notIncluded: [],
      cta: 'Start Testing',
      popular: false,
      color: 'emerald',
      action: () => handleStartCheckout(60)
    },
    {
      name: '🔵 Pro',
      price: 180,
      credits: 1500,
      seconds: 150,
      desc: 'Ideal for consistent affiliate posting',
      features: [
        { name: 'Everything in Starter', icon: Check },
        { name: 'Designed to convert, not just look good', icon: Target },
        { name: 'From idea → post in under 2 minutes', icon: Zap },
        { name: 'Replace 3 tools with one', icon: Layers },
      ],
      notIncluded: [],
      cta: 'Go Pro',
      popular: true,
      color: 'indigo',
      action: () => handleStartCheckout(180)
    },
    {
      name: '🟣 Growth',
      price: 360,
      credits: 3000,
      seconds: 300,
      desc: 'Scale winning offers',
      features: [
        { name: 'Everything in Pro', icon: Check },
        { name: 'Bulk content creation', icon: Video },
        { name: 'Advanced conversion scripts', icon: MessageSquareQuote },
        { name: 'Priority support', icon: Shield },
      ],
      notIncluded: [],
      cta: 'Scale Up',
      popular: false,
      color: 'purple',
      action: () => handleStartCheckout(360)
    },
    {
      name: '🔴 Agency',
      price: 720,
      credits: 6000,
      seconds: 600,
      desc: 'Bulk creation + priority queue',
      features: [
        { name: 'Everything in Growth', icon: Check },
        { name: 'Team collaboration', icon: Rocket },
        { name: 'Priority rendering queue', icon: Zap },
        { name: 'Dedicated account manager', icon: Shield },
      ],
      notIncluded: [],
      cta: 'Dominate',
      popular: false,
      color: 'red',
      action: () => handleStartCheckout(720)
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto py-8">
      <div className="w-full max-w-7xl my-4 md:my-10 relative">
        <button
          onClick={onClose}
          className="absolute -top-8 md:-top-12 left-0 text-white/50 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return
        </button>

        <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white italic uppercase tracking-tighter px-2">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Credit Bundle</span>
          </h2>
          <p className="text-sm md:text-lg font-medium max-w-2xl mx-auto text-slate-400 px-2">
            💳 <strong className="text-white">100 credits = 10 seconds</strong> of affiliate-ready video. Credits never expire.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-[10px] md:text-xs font-bold text-slate-500 px-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Script + Hook + CTA
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Auto-formatted for TikTok, Reels & Shorts
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Designed to convert
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 md:px-4 lg:px-0">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative bg-slate-900/50 backdrop-blur-md border ${tier.popular ? 'border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.2)]' : 'border-white/10'} rounded-[2.5rem] p-6 flex flex-col hover:border-white/20 transition-all duration-300 group overflow-hidden`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-bl-2xl">
                  Most Popular
                </div>
              )}

              <div className="space-y-2 mb-8 relative z-10">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{tier.name}</h3>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tighter">{tier.credits}</span>
                    <span className="text-sm font-bold text-slate-400">credits</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-indigo-400 tracking-tight">${tier.price}</span>
                    <span className="text-xs font-medium text-slate-500">({tier.seconds} seconds of video)</span>
                  </div>
                </div>
                <p className="text-slate-400 text-[10px] font-medium leading-tight h-8">{tier.desc}</p>
              </div>

              <div className="space-y-4 flex-1 relative z-10">
                <ul className="space-y-3">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <f.icon className={`w-3.5 h-3.5 ${tier.color === 'indigo' ? 'text-indigo-400' : tier.color === 'emerald' ? 'text-emerald-400' : tier.color === 'amber' ? 'text-amber-400' : 'text-slate-400'} shrink-0 mt-0.5`} />
                      <span className="text-xs font-bold text-slate-300 leading-tight">{f.name}</span>
                    </li>
                  ))}
                  {tier.notIncluded.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 opacity-40">
                      <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                        <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 leading-tight line-through decoration-slate-600">{f.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 relative z-10">
                <button
                  onClick={tier.action}
                  disabled={!!processingTier}
                  className={`w-full py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.02] ${tier.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                    : tier.color === 'emerald'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
                      : tier.color === 'amber'
                        ? 'bg-amber-600 text-black hover:bg-amber-500 shadow-amber-600/20'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  {processingTier === tier.price ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      {tier.cta} {tier.price > 0 && <CreditCard className="w-3 h-3 opacity-50" />}
                    </span>
                  )}
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Payment Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
