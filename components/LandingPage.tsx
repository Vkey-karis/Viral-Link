
import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  Rocket,
  PlayCircle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  MessageSquareQuote,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Activity,
  MousePointer2,
  Search,
  Layout,
  Smartphone,
  Layers,
  Cpu,
  Trophy,
  Heart,
  Users,
  Star,
  BookOpen,
  Target,
  Flame,
  Lightbulb,
  Link as LinkIcon,
  PenTool
} from 'lucide-react';

interface Props {
  onStart: (mode: 'link' | 'search' | 'manual') => void;
  onViewSEO: () => void;
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className={`text-xl font-bold transition-all ${isOpen ? 'text-indigo-400' : 'text-slate-300 group-hover:text-white'}`}>{question}</span>
        <div className={`p-2 rounded-lg bg-white/5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      {isOpen && (
        <div className="mt-4 text-slate-400 leading-relaxed text-base animate-fade-in pr-12">
          {answer}
        </div>
      )}
    </div>
  );
};

const StepCard = ({ number, title, desc, icon: Icon }: { number: string, title: string, desc: string, icon: any }) => (
  <div className="relative p-10 glass-card rounded-[3rem] border-white/5 flex flex-col items-center text-center space-y-6 group hover:border-indigo-500/30 transition-all duration-700 hover:bg-white/[0.02]">
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-900 border border-white/10 rounded-full font-black text-indigo-400 italic shadow-2xl text-[10px] uppercase tracking-[0.2em]">
      Phase {number}
    </div>
    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-indigo-500/20 shadow-xl shadow-indigo-600/10">
      <Icon className="w-10 h-10" />
    </div>
    <div className="space-y-3">
      <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

const LandingPage: React.FC<Props> = ({ onStart, onViewSEO }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const teaserGuides = [
    {
      title: "TikTok Shop: The 3-Second Rule",
      desc: "How to exploit the TikTok algorithm for millions of organic views using pattern interrupts.",
      icon: <TrendingUp className="w-6 h-6 text-pink-500" />,
      tag: "Viral Growth"
    },
    {
      title: "The High-Ticket Blueprint",
      desc: "Why selling $20 items is a trap. Switch to $200+ commissions with AI precision.",
      icon: <Target className="w-6 h-6 text-orange-500" />,
      tag: "Elite Sales"
    },
    {
      title: "Psychological Ad Scripts",
      desc: "Turn passive scrollers into active buyers with our 'Wake Up Call' script template.",
      icon: <Flame className="w-6 h-6 text-purple-500" />,
      tag: "Conversion"
    }
  ];

  return (
    <div className="relative overflow-x-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* Floating Sub-Nav */}
      <nav className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-fit px-8 py-4 glass-card rounded-full border-white/10 hidden md:flex items-center gap-8 transition-all duration-700 ${scrolled ? 'translate-y-0 opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.5)]' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Top</button>
        <button onClick={() => document.getElementById('steps')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">How it works</button>
        <button onClick={() => document.getElementById('blueprints')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Blueprints</button>
        <div className="w-px h-4 bg-white/10"></div>
        <button onClick={onStart} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
          <Zap className="w-3 h-3 fill-current" /> Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 z-10 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col items-center text-center space-y-12">

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass-card border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl relative group cursor-help">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
              <Users className="w-3 h-3 text-indigo-500" /> Joined by 5,000+ Creators Today
            </div>

            {/* Main Headline */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-[8rem] font-black tracking-tighter leading-[0.85] uppercase italic text-white drop-shadow-2xl">
                THE FASTEST WAY TO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400 text-glow">
                  CREATE AFFILIATE VIDEOS
                </span>
                <br />
                <span className="text-indigo-400">THAT CONVERT</span>
              </h1>
              <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-2xl font-medium leading-relaxed">
                From idea → post in <strong className="text-white">under 2 minutes</strong>. Paste any product link and get affiliate-ready videos with scripts, hooks, and CTAs designed to convert, not just look good.
              </p>
            </div>

            {/* Mode Selection Cards */}
            <div className="w-full max-w-6xl space-y-6 md:space-y-8">
              <div className="text-center space-y-3 md:space-y-4">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tight px-4">
                  Choose Your <span className="text-indigo-500">Extraction Method</span>
                </h3>
                <p className="text-slate-500 text-sm md:text-base lg:text-lg font-medium max-w-2xl mx-auto px-4">
                  Select how you want to discover and analyze products for viral content creation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4">
                {/* Direct Link Card */}
                <button
                  onClick={() => onStart('link')}
                  className="group relative p-10 glass-card rounded-[3rem] border-white/5 hover:border-indigo-500/50 transition-all duration-500 text-left space-y-6 hover:scale-[1.02] hover:bg-white/[0.02]"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative space-y-6">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <LinkIcon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">Direct Link</h4>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        Have a specific product URL? Paste it and we'll instantly extract all marketing intelligence from Amazon, Jumia, Selar, and more.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Extraction <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Global Scan Card */}
                <button
                  onClick={() => onStart('search')}
                  className="group relative p-10 glass-card rounded-[3rem] border-white/5 hover:border-purple-500/50 transition-all duration-500 text-left space-y-6 hover:scale-[1.02] hover:bg-white/[0.02]"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative space-y-6">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">Global Scan</h4>
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-400 uppercase tracking-wider">Hot</span>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        Discover trending, high-search-volume products across 40+ marketplaces. Let AI find viral opportunities for you.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Discover Products <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Custom Card */}
                <button
                  onClick={() => onStart('manual')}
                  className="group relative p-10 glass-card rounded-[3rem] border-white/5 hover:border-pink-500/50 transition-all duration-500 text-left space-y-6 hover:scale-[1.02] hover:bg-white/[0.02]"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative space-y-6">
                    <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <PenTool className="w-8 h-8 text-pink-400" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-2xl font-black text-white uppercase italic tracking-tight">Custom</h4>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        Building your own product or service? Manually input details and generate custom viral content tailored to your needs.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-pink-400 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Create Custom <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Affiliate-Ready Videos</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Replace 3 Tools With One</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Designed To Convert</div>
              </div>
            </div>

            {/* Global Reach */}
            <div className="pt-16 space-y-6">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Optimized For Every Major Store</span>
              <div className="flex flex-wrap justify-center items-center gap-12">
                {[
                  { name: 'AMAZON', color: '#ff9900' },
                  { name: 'JUMIA', color: '#f68b1e' },
                  { name: 'SELAR', color: '#6366f1' },
                  { name: 'GUMROAD', color: '#ff90e8' },
                  { name: 'KONGA', color: '#ed017f' }
                ].map((m) => (
                  <div key={m.name} className="group relative grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
                    <span className="text-xl font-black italic tracking-tighter opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: m.color }}>{m.name}</span>
                    <div className="absolute -bottom-2 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-500" style={{ backgroundColor: m.color }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Roadmap */}
      <section id="steps" className="py-32 px-6 relative z-10 bg-slate-950/20">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              The Path to Virality
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">NO EDITING. <span className="text-indigo-500">JUST POSTING.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent z-0"></div>

            <StepCard
              number="01"
              title="INPUT LINK"
              icon={Layers}
              desc="Drop your affiliate link. We'll instantly extract the price, features, and pain points."
            />
            <StepCard
              number="02"
              title="PICK THE VIBE"
              icon={Cpu}
              desc="Select your strategy. From 'Wake Up Call' to 'Unboxing', we build the script for you."
            />
            <StepCard
              number="03"
              title="GO VIRAL"
              icon={Smartphone}
              desc="Download your high-impact 9:16 video and share it directly to TikTok, Reels, or Shorts."
            />
          </div>
        </div>
      </section>

      {/* Strategy Blueprints Teaser */}
      <section id="blueprints" className="py-40 px-6 relative z-10 border-y border-white/5 bg-indigo-500/[0.02]">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                Strategy Library
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">THE TOOLS FOR <br /><span className="text-indigo-500">DOMINATION.</span></h2>
              <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-xl">
                We don't just give you a video editor; we give you the blueprints to win. Our library of expert guides shows you how to turn every click into a customer.
              </p>
              <button onClick={onViewSEO} className="group flex items-center gap-3 text-white font-black uppercase text-sm tracking-widest hover:text-indigo-400 transition-colors">
                Explore Strategy Blueprints <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {teaserGuides.map((guide, i) => (
                <div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-indigo-500/30 transition-all flex items-start gap-6 group">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                    {guide.icon}
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{guide.tag}</span>
                    <h4 className="text-xl font-bold text-white tracking-tight">{guide.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{guide.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How Affiliates Use It */}
      <section id="features" className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  💰 Earnings Potential
                </div>
                <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">TURN LINKS INTO <br /> <span className="text-emerald-500">COMMISSIONS.</span></h3>
                <p className="text-slate-400 text-xl font-medium leading-relaxed">Whether you're an affiliate pro or just starting your journey, ViralLink removes the friction from content creation so you can focus on what matters: <strong className="text-white">converting viewers into buyers</strong>.</p>
              </div>
              <div className="space-y-6">
                {[
                  { title: "⚡ Speed Advantage", text: "From idea → post in under 2 minutes. Post 10x more than competitors." },
                  { title: "🎯 Built To Convert", text: "Psychology-backed scripts with hooks and CTAs that force scrollers to stop." },
                  { title: "🔄 Replace 3 Tools", text: "Script writing + video editing + formatting = one platform." }
                ].map((feat, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="shrink-0 w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-all">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-white tracking-tight">{feat.title}</h4>
                      <p className="text-slate-500 text-sm">{feat.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-[4rem]"></div>
              <div className="relative glass-card rounded-[3rem] border-white/10 overflow-hidden shadow-2xl p-12 space-y-8">
                <div className="text-center space-y-4">
                  <TrendingUp className="w-16 h-16 text-emerald-500 mx-auto" />
                  <h4 className="text-3xl font-black text-white uppercase italic">How Affiliates Use It</h4>
                </div>
                <div className="space-y-6">
                  {[
                    { step: "1", title: "Find Winning Product", desc: "Browse Amazon, TikTok Shop, or any marketplace" },
                    { step: "2", title: "Paste Link", desc: "ViralLink extracts features, price, and pain points" },
                    { step: "3", title: "Generate Video", desc: "AI creates script, hook, CTA, and renders video" },
                    { step: "4", title: "Post & Earn", desc: "Share to TikTok, Reels, Shorts with your affiliate link" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="shrink-0 w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <span className="text-emerald-400 font-black text-sm">{item.step}</span>
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-white font-bold text-sm">{item.title}</h5>
                        <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto glass-card rounded-[5rem] p-24 text-center space-y-12 border border-white/10 relative overflow-hidden group shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-7xl md:text-11xl font-black text-white italic leading-[0.75] tracking-tighter uppercase">
              YOUR VIRAL <br />
              <span className="text-indigo-500">ERA BEGINS.</span>
            </h2>
            <p className="text-slate-500 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              Join the thousands of smart marketers turning simple links into engaging stories and real revenue.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <button onClick={onStart} className="w-full sm:w-auto px-20 py-8 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[2.5rem] hover:bg-slate-200 transition-all shadow-2xl hover:scale-105 flex items-center justify-center gap-4">
              Launch Dashboard <ArrowRight className="w-7 h-7" />
            </button>
            <button onClick={onViewSEO} className="w-full sm:w-auto px-12 py-8 bg-transparent border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-[2.5rem] hover:bg-white/5 transition-all">
              Read Guides
            </button>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center relative z-10 border-t border-white/5 mt-20">
        <div className="flex justify-center gap-8 mb-10 opacity-40">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Privacy</span>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Security</span>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Terms</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-700">ViralLink AI • Empowering Global Creators</p>
      </footer>
    </div>
  );
};

export default LandingPage;
