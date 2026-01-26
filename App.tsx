
import React, { useState, useEffect } from 'react';
import { ProductData, AdCopyPackage, VideoScript, AppStep, GeneratedAsset, SavedProject } from './types';
import LandingPage from './components/LandingPage';
import SEOContent from './components/SEOContent';
import LinkAnalyzer from './components/LinkAnalyzer';
import StrategyBoard from './components/StrategyBoard';
import VideoCreator from './components/VideoCreator';
import ExportPack from './components/ExportPack';
import ProjectHistory from './components/ProjectHistory';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './services/supabaseClient';
import { Sparkles, History, Layout, Activity, User, LogOut, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.LANDING);
  const [selectedMode, setSelectedMode] = useState<'link' | 'search' | 'manual'>('link');
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [adCopy, setAdCopy] = useState<AdCopyPackage | null>(null);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleProductExtracted = (data: ProductData) => {
    setProductData(data);
    setStep(AppStep.STRATEGY);
  };

  const handleStrategyComplete = (generatedScript: VideoScript, generatedCopy: AdCopyPackage) => {
    setScript(generatedScript);
    setAdCopy(generatedCopy);
    setStep(AppStep.VIDEO);
  };

  const handleVideoComplete = (generatedAssets: GeneratedAsset[]) => {
    setAssets(generatedAssets);
    setStep(AppStep.EXPORT);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setStep(AppStep.LANDING);
  };

  const handleAuthComplete = (adminStatus?: boolean) => {
    if (adminStatus) {
      setIsAdmin(true);
      setStep(7); // Admin dashboard step
    } else {
      setIsAdmin(false);
      setStep(AppStep.INPUT);
    }
  };

  const handleRedoVideo = () => {
    setAssets([]);
    setStep(AppStep.VIDEO);
  };

  const handleReset = () => {
    setStep(AppStep.INPUT);
    setProductData(null);
    setAdCopy(null);
    setScript(null);
    setAssets([]);
  };

  const isNavVisible = step !== AppStep.LANDING && step !== AppStep.SEO_GUIDES;

  return (
    <div className="min-h-screen text-white selection:bg-indigo-500 selection:text-white relative">

      {/* Universal Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${step === AppStep.LANDING ? 'py-8' : 'py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setStep(AppStep.LANDING)}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-black text-2xl tracking-tighter uppercase italic">Viral<span className="text-indigo-400">Link</span></h1>
          </div>

          <div className="flex items-center gap-4">
            {session && (
              <>
                {isAdmin && (
                  <button onClick={() => setStep(7)} className="px-5 py-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Admin
                  </button>
                )}
                <button onClick={() => setStep(AppStep.SEO_GUIDES)} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hidden md:flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Guides
                </button>
                <button onClick={() => setStep(AppStep.HISTORY)} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hidden md:flex items-center gap-2">
                  <History className="w-4 h-4" /> History
                </button>
                <button onClick={handleSignOut} className="p-2.5 bg-slate-900 border border-white/10 text-slate-500 hover:text-red-400 rounded-xl transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`relative z-10 ${step === AppStep.LANDING || step === AppStep.SEO_GUIDES ? 'pt-0' : 'pt-32 pb-20'}`}>
        {!session && step !== AppStep.LANDING && step !== AppStep.SEO_GUIDES ? (
          <Auth onAuthComplete={handleAuthComplete} />
        ) : (
          <>
            {step === AppStep.LANDING && <LandingPage onStart={(mode) => { setSelectedMode(mode); setStep(AppStep.INPUT); }} onViewSEO={() => setStep(AppStep.SEO_GUIDES)} />}
            {step === AppStep.SEO_GUIDES && <div className="pt-32"><SEOContent onBack={() => setStep(AppStep.LANDING)} /></div>}
            {step === AppStep.INPUT && <div className="animate-fade-in px-6"><LinkAnalyzer initialMode={selectedMode} onComplete={handleProductExtracted} onBack={() => setStep(AppStep.LANDING)} /></div>}
            {step === AppStep.STRATEGY && productData && <div className="animate-fade-in px-6"><StrategyBoard productData={productData} onNext={handleStrategyComplete} onBack={() => setStep(AppStep.INPUT)} /></div>}
            {step === AppStep.VIDEO && script && productData && <div className="animate-fade-in px-6"><VideoCreator script={script} productData={productData} onComplete={handleVideoComplete} onBack={() => setStep(AppStep.STRATEGY)} /></div>}
            {step === AppStep.EXPORT && productData && adCopy && script && assets.length > 0 && (
              <div className="animate-fade-in px-6"><ExportPack product={productData} copy={adCopy} script={script} assets={assets} onReset={handleReset} onRedo={handleRedoVideo} /></div>
            )}
            {step === AppStep.HISTORY && (
              <div className="animate-fade-in px-6">
                <ProjectHistory onLoadProject={(p) => { setProductData(p.productData); setAdCopy(p.adCopy); setScript(p.script); setStep(AppStep.STRATEGY); }} onBack={() => setStep(AppStep.LANDING)} />
              </div>
            )}
            {step === 7 && isAdmin && (
              <div className="animate-fade-in">
                <AdminDashboard onBack={() => setStep(AppStep.LANDING)} />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/5 py-20 px-6 mt-20 bg-slate-950/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-[10px] font-mono text-slate-700">
          <span>SUPABASE CLOUD • GEMINI 3 PRO • VEO 3.1</span>
          <span>© 2026 VIRALLINK AI. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
