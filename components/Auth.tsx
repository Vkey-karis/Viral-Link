
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { LogIn, UserPlus, Loader2, Sparkles, ShieldCheck, AlertCircle, ExternalLink, CheckCircle2, Info, Github } from 'lucide-react';

interface Props {
  onAuthComplete: (isAdmin?: boolean) => void;
}

const Auth: React.FC<Props> = ({ onAuthComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [is403, setIs403] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIs403(false);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check if this is an admin login
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        console.log('Admin Detection Debug:');
        console.log('Entered Email:', email);
        console.log('Admin Email from env:', adminEmail);
        console.log('Passwords match:', password === adminPassword);
        console.log('Emails match:', email === adminEmail);

        const isAdminUser = email === adminEmail && password === adminPassword;
        console.log('Is Admin User:', isAdminUser);

        onAuthComplete(isAdminUser);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
        onAuthComplete(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    setIs403(false);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(`${provider} Auth Error:`, err);
      setError(err.message);
      if (err.status === 403 || err.message?.includes('403') || err.message?.includes('disallowed_useragent')) {
        setIs403(true);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md space-y-8 glass-card p-10 rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600/10 rounded-2xl mb-2">
            <Sparkles className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            {isLogin ? 'Access Terminal' : 'Create Profile'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">Initialize your ViralLink production environment.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs font-bold leading-relaxed">
                {is403 ? "OAuth 403: Access Disallowed" : error}
              </p>
            </div>

            {is403 && (
              <div className="pt-4 border-t border-red-500/10 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Info className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Fix Checklist</span>
                </div>

                <ul className="space-y-3">
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-tight">
                      <strong>OAuth Provider:</strong> Ensure GitHub or Google is enabled in your Supabase Auth settings.
                    </p>
                  </li>
                  <li className="flex gap-2 items-start">
                    <CheckCircle2 className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-tight">
                      <strong>Callback URL:</strong> Verify the redirect matches <code className="text-indigo-300">https://hclqrvjrjhyukxxfatdw.supabase.co/auth/v1/callback</code>
                    </p>
                  </li>
                </ul>

                <a
                  href="https://supabase.com/dashboard/project/hclqrvjrjhyukxxfatdw/auth/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Configure Providers <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 ring-1 ring-black/5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="tracking-tight">Sign in with Google</span>
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={loading}
            className="w-full py-4 bg-[#181717] hover:bg-[#2c2c2c] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 border border-white/5"
          >
            <Github className="w-5 h-5" />
            <span className="tracking-tight">Sign in with GitHub</span>
          </button>
        </div>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5"></span>
          </div>
          <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.5em] text-slate-600 bg-transparent px-2">
            <span className="bg-[#020617] px-4">OR USE EMAIL</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold focus:border-indigo-500 focus:outline-none transition-all"
              placeholder="operator@nexus.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl text-white font-bold focus:border-indigo-500 focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? <><LogIn className="w-5 h-5" /> Initialize</> : <><UserPlus className="w-5 h-5" /> Register</>}
          </button>
        </form>

        <div className="text-center pt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
          >
            {isLogin ? "Need a new profile? Create one" : "Already have access? Log in"}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-6 opacity-30">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="text-[8px] font-black uppercase tracking-widest">Supabase Secure Node</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
