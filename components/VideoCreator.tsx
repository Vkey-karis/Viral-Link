
import React, { useState, useEffect, useRef } from 'react';
import { VideoScript, ProductData, GeneratedAsset } from '../types';
import { generateVeoVideo, generateSpeech, checkApiKey, requestApiKey, refreshApiKey, sleep, GeminiApiError } from '../services/geminiService';
import {
  Loader2,
  Video,
  AlertTriangle,
  Play,
  RefreshCw,
  XCircle,
  Key,
  CheckCircle2,
  ShieldAlert,
  Lock,
  Zap,
  Cpu,
  Waves,
  Film,
  Clock,
  ChevronRight,
  MonitorPlay,
  Settings2,
  Sparkles,
  Terminal
} from 'lucide-react';
import { supabase, UserProfile } from '../services/supabaseClient';
import Pricing from './Pricing';

interface Props {
  script: VideoScript;
  productData: ProductData;
  onComplete: (assets: GeneratedAsset[]) => void;
  onBack: () => void;
}

const VideoCreator: React.FC<Props> = ({ script, productData, onComplete, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenes, setScenes] = useState<GeneratedAsset[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [status, setStatus] = useState<string>('Standby');
  const [stage, setStage] = useState<'IDLE' | 'VOICE' | 'VIDEO' | 'COOLDOWN'>('IDLE');
  const [hasKey, setHasKey] = useState(false);
  const [error, setError] = useState<{ message: string, type: string } | null>(null);
  const [timer, setTimer] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkApiKey().then(setHasKey);
    fetchProfile();
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(data);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isGenerating) {
      interval = setInterval(() => { setTimer((t) => t + 1); }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (userProfile?.subscription_tier !== 'premium') {
      setShowPricing(true);
      return;
    }

    if (!hasKey) {
      await requestApiKey();
      const valid = await checkApiKey();
      if (!valid) {
        setError({ message: "A paid API key is required for Veo video generation.", type: 'API_KEY' });
        return;
      }
      setHasKey(true);
    }

    setIsGenerating(true);
    setError(null);
    setTimer(0);
    setScenes([]);
    setCurrentSceneIndex(0);
    setLogs([]);
    addLog("Production Engine Initialized.");

    const generatedAssets: GeneratedAsset[] = [];

    try {
      await supabase.from('usage_logs').insert({
        user_id: userProfile.id,
        action_type: 'video_generation',
        metadata: { scenes: script.scenes.length }
      });

      for (let i = 0; i < script.scenes.length; i++) {
        const scene = script.scenes[i];
        setCurrentSceneIndex(i);

        if (i > 0) {
          setStage('COOLDOWN');
          setStatus(`Cooling down...`);
          addLog("Scene buffer cooling down...");
          await sleep(5000);
        }

        addLog(`Processing Scene ${i + 1}/${script.scenes.length}`);

        setStage('VOICE');
        setStatus(`Synthesizing Vocal Node...`);
        addLog(`Vocal Persona: ${script.voiceName}`);
        let audioUrl = await generateSpeech(scene.audio, script.voiceName);
        addLog(`Audio node generated successfully.`);

        setStage('VIDEO');
        setStatus(`Rendering Cinematic Visuals...`);
        addLog(`Veo Prompt: "${scene.visual.slice(0, 40)}..."`);
        const useImage = (i === 0 && !!productData.imageData);
        if (useImage) addLog("Using Reference Asset for Context.");

        let videoUrl = await generateVeoVideo(scene.visual, productData, useImage);
        addLog(`Visual node rendered.`);

        const asset: GeneratedAsset = {
          sceneIndex: i,
          videoUrl,
          audioUrl,
          visualPrompt: scene.visual,
          audioScript: scene.audio
        };

        generatedAssets.push(asset);
        setScenes([...generatedAssets]);
      }

      setStatus("Synthesis Complete.");
      addLog("Master Export Prepared.");
      onComplete(generatedAssets);

    } catch (e: any) {
      console.error(e);
      if (e instanceof GeminiApiError) setError({ message: e.message, type: e.type });
      else setError({ message: e.message || "Generation failed. Please try again.", type: 'UNKNOWN' });
      setIsGenerating(false);
      addLog("CRITICAL ERROR: Production Halted.");
    }
  };

  const isFree = userProfile?.subscription_tier === 'free';
  const progress = isGenerating ? ((currentSceneIndex + (stage === 'VIDEO' ? 0.8 : 0.3)) / script.scenes.length) * 100 : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-32 animate-fade-in">
      {showPricing && <Pricing userProfile={userProfile} onPaymentSuccess={fetchProfile} onClose={() => setShowPricing(false)} />}

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4"
      >
        <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-black uppercase tracking-widest">Back to Strategy</span>
      </button>

      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 text-center md:text-left px-4">
        <div className="space-y-4">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Veo Production Node v3.1</span>
            </div>
            {isFree && (
              <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Locked</span>
              </div>
            )}
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
            PRODUCTION <span className="text-slate-600">STUDIO</span>
          </h2>
        </div>

        <div className="flex gap-8 items-center bg-white/5 p-6 rounded-[2rem] border border-white/5">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Duration</span>
            <p className="text-xl font-black text-white italic">{script.duration}</p>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Scenes</span>
            <p className="text-xl font-black text-white italic">{script.scenes.length}</p>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Engine</span>
            <p className="text-xl font-black text-indigo-400 italic">VEO 3.1</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left Column: Visual Stage */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-[3.5rem] p-1.5 border-white/5 relative group shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
            <div className="aspect-video bg-slate-950 rounded-[3.4rem] overflow-hidden relative">

              {/* Premium Gate Overlay */}
              {isFree && (
                <div className="absolute inset-0 z-50 bg-slate-950/40 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
                  <div className="w-24 h-24 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center mb-6 border border-indigo-500/30">
                    <Lock className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">ENGINE ACCESS DENIED</h3>
                  <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed mb-8">Upgrade to <span className="text-indigo-400 font-black italic">PRO</span> to unlock high-definition cinematic rendering with Veo 3.1.</p>
                  <button
                    onClick={() => setShowPricing(true)}
                    className="px-10 py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-500 hover:scale-105 transition-all shadow-2xl shadow-indigo-600/40 flex items-center gap-4"
                  >
                    <Zap className="w-5 h-5 fill-current" /> UNLOCK PRO
                  </button>
                </div>
              )}

              {/* Active Render View */}
              {!isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 p-10 group-hover:bg-white/[0.02] transition-all">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <MonitorPlay className="w-10 h-10 text-slate-500 group-hover:text-white" />
                  </div>
                  <div className="text-center space-y-3">
                    <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Ready for Synthesis</h4>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Click initialize below to start the multi-stage AI rendering process.</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 space-y-10">

                  {/* Central Animation based on Stage */}
                  <div className="relative">
                    <div className="absolute -inset-10 bg-indigo-500/10 blur-3xl animate-pulse rounded-full"></div>
                    <div className="w-32 h-32 relative z-10">
                      {stage === 'VOICE' && <Waves className="w-full h-full text-indigo-400 animate-bounce" />}
                      {stage === 'VIDEO' && <Film className="w-full h-full text-purple-400 animate-spin-slow" />}
                      {stage === 'COOLDOWN' && <Clock className="w-full h-full text-slate-600 animate-pulse" />}
                    </div>
                  </div>

                  <div className="text-center space-y-4 relative z-10 w-full">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">{stage} STAGE</span>
                      <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">SCENE {currentSceneIndex + 1}</span>
                    </div>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{status}</h3>

                    {/* Visual Prompt Text during render */}
                    {stage === 'VIDEO' && (
                      <p className="text-xs text-slate-500 italic font-medium max-w-md mx-auto line-clamp-2 animate-in fade-in slide-in-from-bottom-2">
                        "{script.scenes[currentSceneIndex].visual}"
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Production Controls */}
          <div className="flex flex-col md:flex-row gap-6">
            {!isGenerating ? (
              <button
                onClick={handleGenerate}
                className={`flex-1 py-7 bg-white text-black font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-4 text-xl ${error ? 'border-2 border-red-500/30' : ''}`}
              >
                {error ? <RefreshCw className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                {error ? 'RE-INITIALIZE ENGINE' : 'ENGAGE FULL RENDER'}
              </button>
            ) : (
              <div className="flex-1 py-7 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {script.scenes.map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-black ${i < currentSceneIndex ? 'bg-emerald-500 text-white' : i === currentSceneIndex ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-900 text-slate-600'}`}
                      >
                        {i < currentSceneIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Multi-Scene Render</span>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-black text-white font-mono">{timer}s</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[2rem] flex items-start gap-6 animate-in slide-in-from-bottom-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-red-400 font-black uppercase text-xs tracking-widest">Production Pipeline Error</h4>
                <p className="text-red-400/70 text-sm font-medium leading-relaxed">{error.message}</p>
                {error.type === 'API_KEY' && (
                  <button onClick={refreshApiKey} className="mt-4 px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Update Key</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Scene Timeline & Logs */}
        <div className="space-y-8">

          {/* Scene Timeline */}
          <div className="glass-card rounded-[2.5rem] p-1 border-white/5 overflow-hidden">
            <div className="bg-slate-950/40 rounded-[2.4rem] overflow-hidden">
              <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Storyline Assets</span>
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{script.scenes.length} Units</span>
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {script.scenes.map((scene, idx) => (
                  <div
                    key={idx}
                    className={`p-6 border-b border-white/5 transition-all flex items-center gap-4 ${idx === currentSceneIndex && isGenerating ? 'bg-indigo-500/5' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border ${idx < currentSceneIndex ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : idx === currentSceneIndex && isGenerating ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                      {idx < currentSceneIndex ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <h5 className={`text-[10px] font-black uppercase tracking-widest truncate ${idx === currentSceneIndex && isGenerating ? 'text-indigo-400' : 'text-slate-300'}`}>
                        Scene {idx + 1}
                      </h5>
                      <p className="text-[9px] text-slate-600 font-medium truncate italic">{scene.visual}</p>
                    </div>
                    {idx === currentSceneIndex && isGenerating && (
                      <div className="ml-auto flex gap-1">
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                        <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Console Logs */}
          <div className="glass-card rounded-[2.5rem] p-1 border-white/5 overflow-hidden">
            <div className="bg-slate-950/40 rounded-[2.4rem] overflow-hidden">
              <div className="px-8 py-4 border-b border-white/5 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Processing Logs</span>
              </div>
              <div className="p-6 h-[180px] overflow-y-auto font-mono text-[10px] space-y-2 bg-black/20">
                {logs.length === 0 && <p className="text-slate-700 italic">Waiting for connection...</p>}
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 text-slate-500 hover:text-slate-300 transition-colors">
                    <ChevronRight className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>

          <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">PRO TIP</h4>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">"Image-to-Video mode increases conversion by 22% on first-frame hooks. Always upload a high-quality product photo."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCreator;
