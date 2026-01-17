
import React, { useState, useRef, useEffect } from 'react';
import { AdCopyPackage, ProductData, VideoScript, GeneratedAsset } from '../types';
import { saveProject } from '../services/storageService';
import { Download, CheckCircle, Youtube, Instagram, Facebook, ArrowLeft, Link as LinkIcon, Copy, RefreshCw, Play, Pause, Linkedin, Twitter, Share2, Loader2, Smartphone, Save, SmartphoneIcon, ExternalLink, Hash, Activity, Send, ClipboardCheck } from 'lucide-react';

interface Props {
  product: ProductData;
  copy: AdCopyPackage;
  script: VideoScript;
  assets: GeneratedAsset[];
  onReset: () => void;
  onRedo: () => void;
}

const ExportPack: React.FC<Props> = ({ product, copy, script, assets, onReset, onRedo }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [socialStatus, setSocialStatus] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fullCaption = `${copy.hooks[0].toUpperCase()}\n\n${copy.shortCopy}\n\n${copy.ctaLines[0]}\n\n${copy.hashtags.join(" ")}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleAudioEnded = () => {
      if (currentAssetIndex < assets.length - 1) setCurrentAssetIndex(prev => prev + 1);
      else { setIsPlaying(false); setCurrentAssetIndex(0); }
    };
    audio.addEventListener('ended', handleAudioEnded);
    return () => audio.removeEventListener('ended', handleAudioEnded);
  }, [currentAssetIndex, assets.length]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video && audio) {
       const asset = assets[currentAssetIndex];
       if (asset) {
           if (video.src !== asset.videoUrl && asset.videoUrl) { video.src = asset.videoUrl; video.loop = true; }
           if (audio.src !== asset.audioUrl && asset.audioUrl) { audio.src = asset.audioUrl; }
           if (isPlaying) { video.play().catch(() => {}); audio.play().catch(() => {}); }
           else { video.pause(); audio.pause(); }
       }
    }
  }, [currentAssetIndex, isPlaying, assets]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };
  
  const handleSaveProject = () => {
    try {
      saveProject(product, copy, script);
      setIsSaved(true);
      setSocialStatus("Project Saved to History.");
      setTimeout(() => setSocialStatus(null), 3000);
    } catch (e) { alert("Storage limit exceeded."); }
  };

  const handleSocialShare = (platform: string) => {
    copyToClipboard(fullCaption, 'all');
    setSocialStatus(`Preparing ${platform.toUpperCase()}...`);
    setTimeout(() => setSocialStatus(null), 4000);
    let url = '';
    const textEncoded = encodeURIComponent(fullCaption);
    switch (platform) {
      case 'instagram': url = 'https://www.instagram.com/'; break;
      case 'tiktok': url = 'https://www.tiktok.com/upload'; break;
      case 'youtube': url = 'https://studio.youtube.com/'; break;
      case 'facebook': url = 'https://www.facebook.com/'; break;
      case 'twitter': url = `https://twitter.com/intent/tweet?text=${textEncoded}`; break;
      case 'linkedin': url = 'https://www.linkedin.com/feed/'; break;
    }
    window.open(url, '_blank');
  };

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const renderFullVideo = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    try {
      const mimeType = getSupportedMimeType();
      if (!mimeType) throw new Error("No supported video MIME type found in this browser.");

      const canvas = document.createElement('canvas'); canvas.width = 720; canvas.height = 1280;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error("Canvas context failed");

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const destNode = audioCtx.createMediaStreamDestination();
      const canvasStream = canvas.captureStream(30);
      
      if (destNode.stream.getAudioTracks().length > 0) canvasStream.addTrack(destNode.stream.getAudioTracks()[0]);
      
      const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 3000000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start();

      if (audioCtx.state === 'suspended') await audioCtx.resume();

      for (let i = 0; i < assets.length; i++) {
        setRenderProgress(Math.round(((i) / assets.length) * 100));
        const asset = assets[i];
        const sceneScript = script.scenes[i];
        
        const audioEl = new Audio(asset.audioUrl || "");
        audioEl.crossOrigin = "anonymous";
        await new Promise((res) => { audioEl.oncanplaythrough = res; audioEl.onerror = () => res(null); audioEl.load(); });
        
        const videoEl = document.createElement('video');
        videoEl.src = asset.videoUrl || ""; videoEl.crossOrigin = "anonymous"; videoEl.muted = true; videoEl.loop = true; videoEl.playsInline = true;
        await new Promise((res) => { videoEl.onloadeddata = res; videoEl.onerror = res; videoEl.load(); });
        
        const sourceNode = audioCtx.createMediaElementSource(audioEl);
        sourceNode.connect(destNode);
        
        await videoEl.play(); await audioEl.play();
        const duration = (audioEl.duration && isFinite(audioEl.duration)) ? audioEl.duration * 1000 : 5000;
        const startTime = Date.now();
        
        await new Promise<void>((resolve) => {
            const draw = () => {
                const elapsed = Date.now() - startTime;
                ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                if (sceneScript.overlayText) {
                    ctx.save(); ctx.font = 'bold 58px "Inter", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    const x = canvas.width / 2; const y = canvas.height * 0.85;
                    ctx.lineWidth = 10; ctx.strokeStyle = 'black'; ctx.lineJoin = 'round'; ctx.strokeText(sceneScript.overlayText, x, y);
                    ctx.fillStyle = 'white'; ctx.fillText(sceneScript.overlayText, x, y); ctx.restore();
                }
                if (elapsed < duration) requestAnimationFrame(draw); else resolve();
            };
            draw();
        });
        
        videoEl.pause(); audioEl.pause(); sourceNode.disconnect(); videoEl.remove(); audioEl.remove();
      }
      
      recorder.stop();
      await new Promise(r => recorder.onstop = r);
      
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mimeType });
      const file = new File([blob], `ViralLink_${product.title.slice(0, 10).trim()}.${extension}`, { type: mimeType });
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'ViralLink Output', text: fullCaption });
      } else {
          const url = URL.createObjectURL(file); const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }
      setRenderProgress(100);
    } catch (e: any) { 
      console.error(e);
      alert(`Export failed: ${e.message}. You can still download individual scene assets below.`); 
    } finally { setIsRendering(false); }
  };

  const currentSceneScript = script.scenes[currentAssetIndex];

  const socialPlatforms = [
    { id: 'tiktok', icon: Share2, label: 'TikTok', color: 'hover:bg-[#00f2ea]/10 hover:border-[#00f2ea]/50 hover:text-[#00f2ea]' },
    { id: 'instagram', icon: Instagram, label: 'Instagram', color: 'hover:bg-[#e4405f]/10 hover:border-[#e4405f]/50 hover:text-[#e4405f]' },
    { id: 'youtube', icon: Youtube, label: 'YouTube', color: 'hover:bg-[#ff0000]/10 hover:border-[#ff0000]/50 hover:text-[#ff0000]' },
    { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:bg-[#1877f2]/10 hover:border-[#1877f2]/50 hover:text-[#1877f2]' },
    { id: 'twitter', icon: Twitter, label: 'X / Twitter', color: 'hover:bg-[#1da1f2]/10 hover:border-[#1da1f2]/50 hover:text-[#1da1f2]' },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-[#0a66c2]/10 hover:border-[#0a66c2]/50 hover:text-[#0a66c2]' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-32 animate-fade-in px-4">
      <div className="text-center space-y-8 mb-16">
        <div className="inline-flex items-center justify-center p-6 glass-card border-white/10 rounded-3xl relative overflow-hidden group">
           <Activity className="w-12 h-12 text-emerald-400 relative z-10" />
           <div className="absolute inset-0 bg-emerald-500/5 blur-2xl animate-pulse"></div>
        </div>
        <div className="space-y-4">
           <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">
             CONTENT <span className="text-emerald-500">READY</span>
           </h2>
           <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Your viral assets are synthesized. Time to share your story with the world.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-10">
           <div className="relative glass-card rounded-[3.5rem] p-1 border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
              <div className="relative aspect-[9/16] bg-slate-950 rounded-[3.4rem] overflow-hidden group">
                 {currentSceneScript?.overlayText && (
                   <div className="absolute bottom-[18%] left-0 right-0 text-center z-30 pointer-events-none px-10">
                     <h2 className="text-3xl font-black text-white italic tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,1)] uppercase" 
                         style={{ WebkitTextStroke: '2px black' }}>
                       {currentSceneScript.overlayText}
                     </h2>
                   </div>
                 )}

                 <video 
                   ref={videoRef}
                   className="w-full h-full object-cover"
                   playsInline
                   muted
                 />
                 <audio ref={audioRef} />

                 <div 
                   className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all cursor-pointer group"
                   onClick={togglePlay}
                 >
                   {!isPlaying && (
                     <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all shadow-2xl border border-white/20">
                       <Play className="w-10 h-10 text-white fill-current ml-2" />
                     </div>
                   )}
                 </div>

                 <div className="absolute top-10 left-0 right-0 flex justify-center gap-2 z-40 px-10">
                   {assets.map((_, idx) => (
                     <div 
                       key={idx} 
                       className={`h-1 rounded-full transition-all duration-500 ${idx === currentAssetIndex ? 'w-12 bg-white shadow-[0_0_10px_white]' : 'w-4 bg-white/20'}`} 
                     />
                   ))}
                 </div>

                 <div className="absolute bottom-8 left-0 right-0 text-center z-40">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">AI Synthesis Engine • 9:16 Vertical</span>
                 </div>
              </div>
           </div>

           <div className="max-w-md mx-auto space-y-4">
              <button 
                onClick={renderFullVideo}
                disabled={isRendering}
                className="w-full py-7 bg-white text-black font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl transition-all hover:scale-[1.03] flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isRendering ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Finalizing ({renderProgress}%)</>
                ) : (
                  <><Smartphone className="w-6 h-6" /> Export to Mobile</>
                )}
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                 <button 
                    onClick={() => copyToClipboard(fullCaption, 'all')}
                    className="py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 transition-all"
                  >
                    {copiedSection === 'all' ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedSection === 'all' ? 'Copied Caption' : 'Copy Caption'}
                  </button>
                  <button 
                    onClick={handleSaveProject}
                    disabled={isSaved}
                    className="py-5 bg-white/5 border border-white/5 hover:bg-emerald-500/20 text-emerald-500 font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {isSaved ? "Saved" : "Save Project"}
                  </button>
              </div>
           </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">Your Ad Caption</h3>
              <button 
                onClick={() => copyToClipboard(fullCaption, 'all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copiedSection === 'all' ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10'}`}
              >
                {copiedSection === 'all' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'all' ? 'Copied All!' : 'Copy All'}
              </button>
            </div>
            
            <div className="glass-card rounded-[2.5rem] p-1 border-white/5 overflow-hidden group">
               <div className="bg-slate-950/40 p-10 space-y-8 rounded-[2.4rem] relative">
                  <div className="space-y-3 group/segment">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Viral Hook</span>
                        <button onClick={() => copyToClipboard(copy.hooks[0], 'hook')} className="p-2 text-slate-600 hover:text-white transition-colors opacity-0 group-hover/segment:opacity-100">
                          {copiedSection === 'hook' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                     </div>
                     <p className="text-lg font-black text-white uppercase italic">
                       {copy.hooks[0]}
                     </p>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/5 group/segment">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Post Content</span>
                        <button onClick={() => copyToClipboard(copy.shortCopy, 'body')} className="p-2 text-slate-600 hover:text-white transition-colors opacity-0 group-hover/segment:opacity-100">
                          {copiedSection === 'body' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                     </div>
                     <p className="text-sm text-slate-200 font-medium leading-relaxed italic pr-4">
                       {copy.shortCopy}
                     </p>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/5 group/segment">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Call to Action</span>
                        <button onClick={() => copyToClipboard(copy.ctaLines[0], 'cta')} className="p-2 text-slate-600 hover:text-white transition-colors opacity-0 group-hover/segment:opacity-100">
                          {copiedSection === 'cta' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                     </div>
                     <p className="text-base font-black text-white tracking-tight italic">
                       {copy.ctaLines[0]}
                     </p>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-white/5 group/segment">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Optimized Tags</span>
                        <button onClick={() => copyToClipboard(copy.hashtags.join(" "), 'tags')} className="p-2 text-slate-600 hover:text-white transition-colors opacity-0 group-hover/segment:opacity-100">
                          {copiedSection === 'tags' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {copy.hashtags.map(tag => (
                         <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">
                            <Hash className="w-2 h-2" /> {tag.replace('#','')}
                         </span>
                       ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">One-Click Share</h3>
              <Send className="w-4 h-4 text-slate-600" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {socialPlatforms.map((p) => (
                 <button 
                   key={p.id} 
                   onClick={() => handleSocialShare(p.id)} 
                   className={`flex flex-col items-center justify-center p-6 glass-card rounded-[2rem] border-white/5 transition-all group ${p.color}`}
                 >
                    <p.icon className="w-7 h-7 mb-3 text-slate-500 group-hover:inherit transition-colors" />
                    <span className="text-[10px] font-black text-slate-500 group-hover:inherit uppercase tracking-widest">{p.label}</span>
                 </button>
               ))}
            </div>
            {socialStatus && (
               <div className="text-center text-sm font-black text-emerald-400 animate-pulse tracking-widest uppercase italic">
                 {socialStatus}
               </div>
            )}
          </div>

          <button 
            onClick={onReset}
            className="w-full py-8 text-slate-600 hover:text-white font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4 transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> Create Another Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPack;
