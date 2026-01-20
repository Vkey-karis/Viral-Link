
import React, { useState, useEffect, useRef } from 'react';
import { Check, Rocket, CreditCard, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Lock, Shield, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { UserProfile } from '../services/supabaseClient';
import { createPayPalOrder, checkUserSubscription } from '../services/paymentService';

interface Props {
  onClose: () => void;
  userProfile: UserProfile | null;
  onPaymentSuccess: () => void;
}

const Pricing: React.FC<Props> = ({ onClose, userProfile, onPaymentSuccess }) => {
  const [isRedirecting, setIsRedirecting] = useState<null | 'paypal' | 'card'>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const PRICE_USD = 29.00;

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

  const handleStartCheckout = async (mode: 'paypal' | 'card') => {
    if (!userProfile?.id) return;
    setIsRedirecting(mode);
    setError(null);

    try {
      const approvalUrl = await createPayPalOrder(userProfile.id, PRICE_USD);
      window.open(approvalUrl, '_blank');
      setCheckoutStarted(true);
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setError("Failed to connect to payment gateway. Please try again or contact support.");
    } finally {
      setIsRedirecting(null);
    }
  };

  const handleVerifyPayment = async () => {
    if (!userProfile?.id) return;
    setIsVerifying(true);
    try {
      const isPremium = await checkUserSubscription(userProfile.id);
      if (isPremium) {
        handleSuccessfulUpgrade();
      } else {
        setError("Payment not detected yet. Please ensure you completed the transaction in the other tab.");
      }
    } catch (err) {
      setError("Error verifying status. Please try again.");
    } finally {
      setIsVerifying(false);
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
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Pro Activated</h2>
            <p className="text-slate-400 font-medium tracking-tight">Payment verified. Your production engine is now unlocked.</p>
          </div>
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl my-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-[4rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
          
          <div className="bg-indigo-600 p-12 lg:p-16 space-y-12 relative overflow-hidden hidden sm:block">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                <Rocket className="w-3 h-3" /> Professional Tier
              </div>
              <h3 className="text-5xl font-black text-white italic uppercase leading-none tracking-tighter">
                VIRALLINK <br /> <span className="opacity-60">PRO STUDIO</span>
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">${PRICE_USD}</span>
                <span className="text-xl font-bold text-white/50">/ month</span>
              </div>
            </div>
            
            <ul className="space-y-6 relative z-10">
              {[
                { title: 'Unlimited Rendering', desc: 'No scene limits. Generate content 24/7.' },
                { title: 'Commercial Rights', desc: 'No ViralLink watermark. Pure professional output.' },
                { title: 'Veo HD Export', desc: 'Highest resolution cinematic vertical video.' }
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-indigo-600 stroke-[4px]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black text-white uppercase tracking-tight leading-none">{f.title}</p>
                    <p className="text-white/60 text-xs font-medium">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 p-10 lg:p-16 space-y-10 flex flex-col justify-between min-h-[600px]">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Secure Checkout</h4>
                 <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SSL Encrypted</span>
                 </div>
              </div>

              {!checkoutStarted ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Upgrade Now</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      Choose your preferred payment method. Securely processed by PayPal.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-red-400 text-xs font-bold">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Primary Path: Card Payment */}
                    <button 
                      onClick={() => handleStartCheckout('card')}
                      disabled={!!isRedirecting}
                      className="w-full py-6 bg-slate-950 text-white font-black uppercase tracking-[0.3em] rounded-[2rem] hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-1 shadow-2xl border border-white/5 relative group"
                    >
                      {isRedirecting === 'card' ? (
                        <div className="flex items-center gap-3">
                           <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                           <span className="text-xs">Secure Card Link...</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <CreditCard className="w-6 h-6" />
                            <span>Credit / Debit Card</span>
                          </div>
                          <div className="flex gap-2 opacity-40 mt-1 grayscale scale-75">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-2" alt="Visa" />
                             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-3" alt="Mastercard" />
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/American_Express_logo_%282018%29.svg" className="h-2" alt="Amex" />
                          </div>
                        </>
                      )}
                    </button>

                    <div className="relative py-2">
                       <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                       <div className="relative flex justify-center"><span className="bg-slate-900 px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Or use your account</span></div>
                    </div>

                    {/* Secondary Path: PayPal Wallet */}
                    <button 
                      onClick={() => handleStartCheckout('paypal')}
                      disabled={!!isRedirecting}
                      className="w-full py-5 bg-[#ffc439] hover:bg-[#f4bb34] text-[#003087] font-black uppercase tracking-[0.3em] rounded-[2rem] transition-all flex items-center justify-center gap-4 shadow-xl"
                    >
                      {isRedirecting === 'paypal' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
                          <span className="text-xs">Checkout</span>
                        </div>
                      )}
                    </button>
                    
                    <div className="flex items-center gap-3 p-5 bg-white/5 rounded-3xl border border-white/5">
                      <Lock className="w-5 h-5 text-emerald-400" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">No Account Required</p>
                        <p className="text-[9px] text-slate-500 font-medium italic">Guest checkout is fully enabled for card payments.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Waiting for Signal</h3>
                    <div className="flex items-center gap-3 text-indigo-400 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing with Gateway...</p>
                    </div>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      Please complete the payment in the other tab. This studio will unlock automatically.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={handleVerifyPayment}
                      disabled={isVerifying}
                      className="w-full py-6 bg-emerald-600 text-white font-black uppercase tracking-[0.3em] rounded-[2rem] hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 shadow-xl shadow-emerald-600/20"
                    >
                      {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                      {isVerifying ? 'Verifying...' : 'Refresh Status'}
                    </button>
                  </div>

                  {error && (
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-slate-400 text-xs font-medium leading-relaxed">{error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6 pt-10 border-t border-white/5">
              <button 
                onClick={onClose} 
                className="w-full py-4 text-slate-500 hover:text-white transition-colors uppercase text-[9px] font-black tracking-[0.4em] group"
              >
                <ArrowLeft className="w-3 h-3 inline-block mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
