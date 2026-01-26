
import React, { useEffect, useState } from 'react';
import { ProductData, AdCopyPackage, VideoScript, VideoTemplate } from '../types';
import { generateViralCopy, generateVideoScript } from '../services/geminiService';
import {
  Copy,
  RefreshCw,
  CheckCircle2,
  Clapperboard,
  FileText,
  Loader2,
  Mic2,
  LayoutTemplate,
  PackageOpen,
  ListOrdered,
  Sparkles,
  Scale,
  AlertTriangle,
  Stethoscope,
  XOctagon,
  Zap,
  Clock,
  ShieldCheck,
  Hash,
  ArrowRight,
  ChevronRightCircle
} from 'lucide-react';

interface Props {
  productData: ProductData;
  onNext: (script: VideoScript, copy: AdCopyPackage) => void;
  onBack: () => void;
}

const StrategyBoard: React.FC<Props> = ({ productData, onNext, onBack }) => {
  const [adCopy, setAdCopy] = useState<AdCopyPackage | null>(null);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [duration, setDuration] = useState<'15s' | '30s' | '40s'>('30s');
  const [selectedVoice, setSelectedVoice] = useState<string>('Puck');
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate>('WAKE_UP_CALL');
  const [selectedHookIndex, setSelectedHookIndex] = useState<number>(0);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHook, setCopiedHook] = useState<number | null>(null);

  const [loadingCopy, setLoadingCopy] = useState(true);
  const [loadingScript, setLoadingScript] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initCopy = async () => {
    setLoadingCopy(true);
    setError(null);
    try {
      const copy = await generateViralCopy(productData);
      setAdCopy(copy);
    } catch (e) {
      console.error("Copy Gen Failed", e);
      setError("Failed to generate marketing strategy. Please try again.");
    } finally {
      setLoadingCopy(false);
    }
  };

  useEffect(() => {
    initCopy();
  }, []);

  useEffect(() => {
    const initScript = async () => {
      setLoadingScript(true);
      try {
        const videoScript = await generateVideoScript(productData, duration, selectedTemplate);
        setScript(videoScript);
      } catch (e) {
        console.error("Script Gen Failed", e);
      } finally {
        setLoadingScript(false);
      }
    };
    if (adCopy) { // Only generate script if copy logic succeeded (or run parallel but handling independent errors)
      initScript();
    }
  }, [duration, selectedTemplate, productData, adCopy]);

  const handleRetry = () => {
    initCopy();
  };

  const handleProceed = () => {
    if (script && adCopy) {
      const finalScript = {
        ...script,
        voiceName: selectedVoice,
        template: selectedTemplate,
        duration: duration
      };
      onNext(finalScript, adCopy);
    }
  };

  const copyScriptToClipboard = async () => {
    if (!script) return;

    const scriptText = script.scenes.map((scene, idx) =>
      `Scene ${idx + 1}:\n` +
      `Visual: ${scene.visual}\n` +
      `Audio: ${scene.audio}\n` +
      `Overlay: ${scene.overlayText}\n` +
      `Transition: ${scene.transition}\n`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(scriptText);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  const copyHookToClipboard = async (hook: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hook);
      setCopiedHook(index);
      setTimeout(() => setCopiedHook(null), 2000);
    } catch (err) {
      console.error('Failed to copy hook:', err);
    }
  };

  const voices = [
    { id: 'Puck', label: 'Energetic Male', icon: '⚡️' },
    { id: 'Charon', label: 'Authoritative Male', icon: '🎙️' },
    { id: 'Fenrir', label: 'Deep Male', icon: '🦁' },
    { id: 'Kore', label: 'Balanced Female', icon: '✨' },
    { id: 'Zephyr', label: 'Calm Female', icon: '🍃' },
  ];

  const templates: { id: VideoTemplate, label: string, icon: React.ReactNode, desc: string }[] = [
    { id: 'WAKE_UP_CALL', label: 'Wake Up Call', icon: <AlertTriangle className="w-4 h-4" />, desc: 'Aggressive hard truth hook.' },
    { id: 'MEDICAL_CONTRAST', label: 'Expert Truth', icon: <Stethoscope className="w-4 h-4" />, desc: 'Scientific or Expert comparison.' },
    { id: 'STOP_LYING', label: 'Stop Lying', icon: <XOctagon className="w-4 h-4" />, desc: 'Call out the viewer immediately.' },
    { id: 'PROBLEM_SOLVER', label: 'Problem Solver', icon: <Zap className="w-4 h-4" />, desc: 'Efficiency-based solution.' },
    { id: 'VIRAL_HOOK', label: 'Viral Hook', icon: <Sparkles className="w-4 h-4" />, desc: 'High-retention standard ad.' },
    { id: 'BEFORE_AFTER', label: 'Before/After', icon: <Scale className="w-4 h-4" />, desc: 'Visual proof and change.' },
    { id: 'UNBOXING', label: 'Unboxing', icon: <PackageOpen className="w-4 h-4" />, desc: 'Close-up tactile reveal.' },
    { id: 'TOP_LIST', label: 'Top 5 List', icon: <ListOrdered className="w-4 h-4" />, desc: 'Informative listicle style.' },
  ];

  if (loadingCopy && !adCopy) {
    return (
      <div key="loading" className="flex flex-col items-center justify-center h-[500px] space-y-8 animate-pulse">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-black text-white italic uppercase">Synthesizing Strategy</h3>
          <p className="text-slate-500 font-medium">Developing high-retention copy and hooks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div key="error" className="flex flex-col items-center justify-center h-[500px] space-y-6 animate-in fade-in">
        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-white uppercase italic">Strategy Generation Failed</h3>
          <p className="text-slate-400 max-w-md mx-auto">{error}</p>
        </div>
        <button
          onClick={handleRetry}
          className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Retry Analysis
        </button>
      </div>
    );
  }

  if (!adCopy) return null;

  return (
    <div key="content" className="w-full max-w-7xl mx-auto space-y-12 pb-20 px-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <ChevronRightCircle className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-black uppercase tracking-widest">Back to Extraction</span>
      </button>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Strategy Protocol Active</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
            CAMPAIGN <span className="text-slate-600">ARCHITECTURE</span>
          </h1>
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/5 shadow-xl">
          {(['15s', '30s', '40s'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              disabled={loadingScript}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${duration === d
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-white'
                }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Left Column: Intelligence Pack */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase italic">Viral Ad Pack</h2>
          </div>

          <div className="glass-card rounded-[2.5rem] p-1 border-white/5">
            <div className="bg-slate-950/40 rounded-[2.4rem] p-8 space-y-8">

              {/* Hooks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">High-Impact Hooks</h3>
                  <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black text-slate-500">OPTIMIZED</span>
                </div>
                <div className="space-y-3">
                  {(adCopy?.hooks || []).map((hook, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedHookIndex(i)}
                      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${selectedHookIndex === i
                          ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.15)]'
                          : 'bg-slate-900/60 border-white/5 hover:border-indigo-500/30'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedHookIndex === i
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-slate-600 group-hover:border-indigo-500/50'
                            }`}>
                            {selectedHookIndex === i && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm font-bold leading-relaxed flex-1 ${selectedHookIndex === i ? 'text-white' : 'text-slate-200'
                            }`}>"{hook}"</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyHookToClipboard(hook, i);
                          }}
                          className={`p-2 rounded-lg transition-all ${copiedHook === i
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                          title="Copy hook"
                        >
                          {copiedHook === i ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <span className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full transition-opacity ${selectedHookIndex === i ? 'bg-indigo-500 opacity-100' : 'bg-indigo-500 opacity-0 group-hover:opacity-100'
                        }`}></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Direct Response Copy</h3>
                <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 text-slate-300 text-sm leading-loose italic">
                  {adCopy.shortCopy}
                </div>
              </div>

              {/* Footer Data */}
              <div className="pt-6 border-t border-white/5 flex flex-wrap gap-3">
                {(adCopy?.hashtags || []).map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-white/5">
                    <Hash className="w-2.5 h-2.5" /> {tag.replace('#', '')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Strategy */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-400">
              <Clapperboard className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white uppercase italic">Production Engine</h2>
          </div>

          {/* Config Controls */}
          <div className="space-y-4">
            <div className="p-1 glass-card rounded-[2.5rem] border-white/5">
              <div className="bg-slate-950/40 p-8 rounded-[2.4rem] space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Select Blueprint</h3>
                  <LayoutTemplate className="w-4 h-4 text-slate-600" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      disabled={loadingScript}
                      className={`p-4 rounded-2xl border text-left transition-all ${selectedTemplate === t.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.15)]'
                        : 'bg-slate-900/60 border-white/5 text-slate-500 hover:bg-slate-800'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={selectedTemplate === t.id ? 'text-indigo-400' : 'text-slate-600'}>{t.icon}</span>
                        <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
                      </div>
                      <p className="text-[9px] opacity-60 leading-relaxed line-clamp-1">{t.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Vocal Persona</h3>
                  <div className="flex flex-wrap gap-2">
                    {voices.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVoice(v.id)}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all flex items-center gap-2 ${selectedVoice === v.id
                          ? 'bg-white text-black border-white shadow-xl shadow-white/5'
                          : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white'
                          }`}
                      >
                        <span>{v.icon}</span>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Script Content */}
          <div className="glass-card rounded-[2.5rem] p-1 border-white/5 overflow-hidden">
            <div className="bg-slate-950/40 rounded-[2.4rem] overflow-hidden">
              <div className="px-8 py-5 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Master Script</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">{duration} Render</span>
                  <button
                    onClick={copyScriptToClipboard}
                    disabled={loadingScript || !script}
                    className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${copiedScript
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    title="Copy entire script"
                  >
                    {copiedScript ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {loadingScript ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Compiling Visuals...</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
                  {(script?.scenes || []).map((scene, idx) => (
                    <div key={idx} className="p-8 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex gap-6">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/5 rounded-xl text-slate-500 font-black text-xs border border-white/5 group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-all">
                          {idx + 1}
                        </div>
                        <div className="space-y-4 w-full">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Visual Direction</span>
                              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg">
                                <ChevronRightCircle className="w-2.5 h-2.5 text-indigo-400" />
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{scene.transition}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-200 font-medium leading-relaxed italic">"{scene.visual}"</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Vocal Audio</span>
                            <p className="text-sm text-white font-black tracking-tight leading-relaxed">"{scene.audio}"</p>
                          </div>
                          {scene.overlayText && (
                            <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Overlay</span>
                              <p className="text-[10px] text-indigo-300 font-black uppercase tracking-tighter">"{scene.overlayText}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleProceed}
            disabled={loadingScript || !script}
            className="w-full py-6 bg-indigo-600 text-white font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-indigo-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-4 disabled:opacity-50"
          >
            Initiate Veo Rendering
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyBoard;
