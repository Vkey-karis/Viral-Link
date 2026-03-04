
import React, { useState, useCallback, useRef } from 'react';
import { extractProductInfo, findTrendingProducts, GeminiApiError } from '../services/geminiService';
import { ProductData, TrendingProduct } from '../types';
import {
  ArrowRight,
  Loader2,
  Search,
  ShoppingBag,
  AlertCircle,
  Link as LinkIcon,
  Globe,
  Sparkles,
  PenTool,
  X,
  CheckCircle2,
  UploadCloud,
  MapPin,
  ShieldAlert,
  Zap,
  ChevronDown,
  TrendingUp,
  Activity
} from 'lucide-react';

interface Props {
  initialMode?: 'link' | 'search' | 'manual';
  onComplete: (data: ProductData) => void;
  onBack: () => void;
}

interface UploaderProps {
  imageData: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const ProductImageUploader: React.FC<UploaderProps> = ({ imageData, onUpload, onRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onUpload(file);
  };

  return (
    <div
      className={`relative group rounded-[2rem] transition-all duration-500 overflow-hidden border-2 border-dashed
        ${imageData ? 'border-indigo-500 bg-slate-900/40' : isDragging ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]' : 'border-white/5 bg-slate-950/50 hover:border-white/10'}`}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
    >
      <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} className="hidden" />
      {imageData ? (
        <div className="relative p-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <img src={imageData} alt="Preview" className="max-h-64 w-auto rounded-2xl shadow-2xl ring-1 ring-white/10 object-contain" />
          <button type="button" onClick={onRemove} className="absolute top-4 right-4 p-2.5 bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white rounded-full transition-all border border-white/10"><X className="w-4 h-4" /></button>
          <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 text-indigo-400" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Image ready for video</span>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full py-16 flex flex-col items-center justify-center gap-6 group/btn outline-none">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover/btn:border-indigo-500/50 transition-colors">
            <UploadCloud className="w-8 h-8 text-slate-500 group-hover/btn:text-indigo-400 transition-colors" />
          </div>
          <div className="space-y-2 px-8 text-center">
            <h4 className="text-xl font-black text-white tracking-tight uppercase italic">Reference Asset</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">Upload a product photo for the <span className="text-indigo-400 font-bold">Image-to-Video</span> engine.</p>
          </div>
        </button>
      )}
    </div>
  );
};

const LinkAnalyzer: React.FC<Props> = ({ initialMode, onComplete, onBack }) => {
  const [mode, setMode] = useState<'link' | 'search' | 'manual'>(initialMode || 'link');
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [language, setLanguage] = useState('English');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ message: string, type: string } | null>(null);

  // Custom Product Builder State
  const [customTitle, setCustomTitle] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customCategory, setCustomCategory] = useState('Physical Product');
  const [customDescription, setCustomDescription] = useState('');
  const [customFeatures, setCustomFeatures] = useState<string[]>(['', '', '']);
  const [customPainPoints, setCustomPainPoints] = useState<string[]>(['', '', '']);
  const [customBenefits, setCustomBenefits] = useState<string[]>(['', '', '']);
  const [customMarketplace, setCustomMarketplace] = useState('Your Website');

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => { setImageData(reader.result as string); setImageMimeType(file.type); };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyzeLink = async (e: React.FormEvent) => {
    e.preventDefault(); if (!url) return;
    setIsLoading(true); setError(null);
    try {
      const data = await extractProductInfo(url, language);
      onComplete({ ...data, affiliateLink: affiliateLink.trim(), language, imageData: imageData || undefined, imageMimeType: imageMimeType || undefined });
    } catch (err: any) {
      setError({ message: err.message || "Extraction failed.", type: 'UNKNOWN' });
    } finally { setIsLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); if (!keyword) return;
    setIsSearching(true); setTrendingProducts([]); setError(null);
    try {
      const products = await findTrendingProducts(keyword);
      setTrendingProducts(products);
    } catch (err: any) {
      setError({ message: err.message || "Search failed.", type: 'UNKNOWN' });
    } finally { setIsSearching(false); }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(null);

    try {
      const productData: ProductData = {
        title: customTitle,
        price: customPrice,
        description: customDescription,
        features: customFeatures.filter(f => f.trim() !== ''),
        painPoints: customPainPoints.filter(p => p.trim() !== ''),
        benefits: customBenefits.filter(b => b.trim() !== ''),
        reviewsSummary: '',
        marketplace: customMarketplace,
        language: language,
        affiliateLink: affiliateLink.trim(),
        imageData: imageData || undefined,
        imageMimeType: imageMimeType || undefined
      };

      onComplete(productData);
    } catch (err: any) {
      setError({ message: err.message || "Failed to create product.", type: 'UNKNOWN' });
    } finally { setIsLoading(false); }
  };

  const updateListItem = (list: string[], setList: (items: string[]) => void, index: number, value: string) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const addListItem = (list: string[], setList: (items: string[]) => void) => {
    setList([...list, '']);
  };

  const removeListItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    if (list.length > 1) setList(list.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-16 animate-fade-in pb-20 px-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
      >
        <ChevronDown className="w-5 h-5 rotate-90 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-black uppercase tracking-widest">Back to Home</span>
      </button>

      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-6 glass-card border-white/10 rounded-3xl relative overflow-hidden group">
          <ShoppingBag className="w-12 h-12 text-indigo-400 relative z-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
            ANALYZE <span className="text-indigo-500">YOUR PRODUCT</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mx-auto">Paste your affiliate product link and we'll extract everything needed to create viral content.</p>
        </div>
      </div>

      <div className="glass-card p-1.5 rounded-[3rem] border-white/5 shadow-2xl overflow-hidden">
        <div className="bg-slate-950/40 rounded-[2.8rem] p-10 space-y-10">

          <div className="flex p-2 bg-white/5 rounded-2xl border border-white/5">
            {[
              { id: 'link', label: 'Direct Link', icon: LinkIcon },
              { id: 'search', label: 'Global Scan', icon: Sparkles },
              { id: 'manual', label: 'Custom', icon: PenTool }
            ].map((tab) => (
              <button
                key={tab.id} onClick={() => setMode(tab.id as any)}
                className={`flex-1 py-4 px-6 text-[10px] font-black uppercase tracking-[0.25em] rounded-xl transition-all flex items-center justify-center gap-3 ${mode === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <div className="p-2 bg-red-500/20 rounded-xl"><AlertCircle className="w-6 h-6 text-red-400" /></div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm">Analysis Failed</h4>
                <p className="text-red-300 text-xs">{error.message}</p>
              </div>
              <button onClick={() => setError(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
          )}

          {mode === 'link' && (
            <form onSubmit={handleAnalyzeLink} className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
              <div className="relative group">
                <div className="relative flex items-center bg-slate-900/60 rounded-2xl border border-white/5 focus-within:border-indigo-500 transition-all">
                  <Search className="ml-6 w-5 h-5 text-slate-500" />
                  <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter Amazon, Jumia, Selar, or Marketplace URL..." className="w-full p-6 bg-transparent text-white font-bold text-lg italic focus:outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProductImageUploader imageData={imageData} onUpload={handleImageUpload} onRemove={() => setImageData(null)} />
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tracking ID</label>
                    <div className="bg-white/5 rounded-2xl border border-white/5 px-6 flex items-center"><LinkIcon className="w-5 h-5 text-slate-600" /><input type="text" value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} placeholder="yourlink.com/ref" className="w-full p-5 bg-transparent text-white text-sm font-bold focus:outline-none" /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Language</label>
                    <div className="bg-white/5 rounded-2xl border border-white/5 px-6 flex items-center relative"><Globe className="w-5 h-5 text-slate-600" /><select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-5 bg-transparent text-white text-sm font-bold appearance-none cursor-pointer"><option value="English">English</option><option value="French">French</option><option value="Spanish">Spanish</option></select></div>
                  </div>
                  <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-3">
                    <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Ready to scan 40+ marketplaces</p>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-4 disabled:opacity-50">
                {isLoading ? <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing...</> : <>Analyze Product <ArrowRight className="w-6 h-6" /></>}
              </button>
            </form>
          )}

          {mode === 'search' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
              <form onSubmit={handleSearch} className="relative flex items-center bg-slate-900/60 rounded-2xl border border-white/5 focus-within:border-indigo-500 transition-all overflow-hidden">
                <Sparkles className="ml-6 w-6 h-6 text-indigo-500" />
                <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search (e.g. 'Football Jerseys')" className="w-full p-6 bg-transparent text-white font-bold text-lg italic focus:outline-none" required />
                <button type="submit" disabled={isSearching} className="m-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Scan 40+ Markets'}
                </button>
              </form>

              {trendingProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {trendingProducts.map((prod, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-3xl border border-white/5 hover:border-indigo-500 transition-all group relative">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-black uppercase px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 w-fit flex items-center gap-1.5 animate-pulse">
                            <Activity className="w-2.5 h-2.5" /> High Search Volume
                          </span>
                          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{prod.store}</span>
                        </div>
                        <span className="text-white font-black text-lg italic">{prod.price}</span>
                      </div>
                      <h3 className="font-bold text-white text-base mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1 italic">{prod.title}</h3>
                      <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed">{prod.reason}</p>
                      <button onClick={() => { setUrl(prod.url); setMode('link'); }} className="w-full py-4 bg-white/5 hover:bg-white text-slate-400 hover:text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Extract & Produce</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'manual' && (
            <form onSubmit={handleCustomSubmit} className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center border border-pink-500/20">
                    <ShoppingBag className="w-5 h-5 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Product Basics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Title *</label>
                    <input type="text" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="e.g., Premium Leather Wallet" className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white text-sm font-bold focus:outline-none focus:border-pink-500 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price *</label>
                    <input type="text" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} placeholder="e.g., $49.99 or Free" className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white text-sm font-bold focus:outline-none focus:border-pink-500 transition-all" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category *</label>
                    <select value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white text-sm font-bold focus:outline-none focus:border-pink-500 transition-all appearance-none cursor-pointer">
                      <option value="Physical Product">Physical Product</option>
                      <option value="Digital Product">Digital Product</option>
                      <option value="Service">Service</option>
                      <option value="Online Course">Online Course</option>
                      <option value="Software">Software</option>
                      <option value="Subscription">Subscription</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Marketplace</label>
                    <input type="text" value={customMarketplace} onChange={(e) => setCustomMarketplace(e.target.value)} placeholder="e.g., Your Website, Gumroad" className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white text-sm font-bold focus:outline-none focus:border-pink-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description *</label>
                  <textarea value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} placeholder="Describe your product in detail. What makes it special?" rows={4} className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-white text-sm font-medium leading-relaxed focus:outline-none focus:border-pink-500 transition-all resize-none" required />
                  <p className="text-[10px] text-slate-600 ml-1">{customDescription.length} characters</p>
                </div>
              </div>
              <div className="space-y-6 p-8 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20"><CheckCircle2 className="w-5 h-5 text-indigo-400" /></div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Key Features</h3>
                  </div>
                  <button type="button" onClick={() => addListItem(customFeatures, setCustomFeatures)} className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-indigo-500/20">+ Add Feature</button>
                </div>
                <div className="space-y-3">
                  {customFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input type="text" value={feature} onChange={(e) => updateListItem(customFeatures, setCustomFeatures, idx, e.target.value)} placeholder={`Feature ${idx + 1}`} className="flex-1 p-4 bg-white/5 rounded-xl border border-white/5 text-white text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all" />
                      {customFeatures.length > 1 && (<button type="button" onClick={() => removeListItem(customFeatures, setCustomFeatures, idx)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20"><X className="w-4 h-4" /></button>)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 p-8 bg-purple-500/5 rounded-3xl border border-purple-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20"><AlertCircle className="w-5 h-5 text-purple-400" /></div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Pain Points</h3>
                  </div>
                  <button type="button" onClick={() => addListItem(customPainPoints, setCustomPainPoints)} className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-purple-500/20">+ Add Pain Point</button>
                </div>
                <div className="space-y-3">
                  {customPainPoints.map((pain, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input type="text" value={pain} onChange={(e) => updateListItem(customPainPoints, setCustomPainPoints, idx, e.target.value)} placeholder={`Problem ${idx + 1} this solves`} className="flex-1 p-4 bg-white/5 rounded-xl border border-white/5 text-white text-sm font-medium focus:outline-none focus:border-purple-500 transition-all" />
                      {customPainPoints.length > 1 && (<button type="button" onClick={() => removeListItem(customPainPoints, setCustomPainPoints, idx)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20"><X className="w-4 h-4" /></button>)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 p-8 bg-pink-500/5 rounded-3xl border border-pink-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500/10 rounded-xl flex items-center justify-center border border-pink-500/20"><Zap className="w-5 h-5 text-pink-400" /></div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Key Benefits</h3>
                  </div>
                  <button type="button" onClick={() => addListItem(customBenefits, setCustomBenefits)} className="px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-pink-500/20">+ Add Benefit</button>
                </div>
                <div className="space-y-3">
                  {customBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input type="text" value={benefit} onChange={(e) => updateListItem(customBenefits, setCustomBenefits, idx, e.target.value)} placeholder={`Benefit ${idx + 1}`} className="flex-1 p-4 bg-white/5 rounded-xl border border-white/5 text-white text-sm font-medium focus:outline-none focus:border-pink-500 transition-all" />
                      {customBenefits.length > 1 && (<button type="button" onClick={() => removeListItem(customBenefits, setCustomBenefits, idx)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20"><X className="w-4 h-4" /></button>)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProductImageUploader imageData={imageData} onUpload={handleImageUpload} onRemove={() => setImageData(null)} />
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tracking ID</label>
                    <div className="bg-white/5 rounded-2xl border border-white/5 px-6 flex items-center"><LinkIcon className="w-5 h-5 text-slate-600" /><input type="text" value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} placeholder="yourlink.com/ref" className="w-full p-5 bg-transparent text-white text-sm font-bold focus:outline-none" /></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Language</label>
                    <div className="bg-white/5 rounded-2xl border border-white/5 px-6 flex items-center relative"><Globe className="w-5 h-5 text-slate-600" /><select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-5 bg-transparent text-white text-sm font-bold appearance-none cursor-pointer"><option value="English">English</option><option value="French">French</option><option value="Spanish">Spanish</option></select></div>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl shadow-pink-600/40">
                {isLoading ? <><Loader2 className="w-6 h-6 animate-spin" /> Creating...</> : <>Generate Viral Content <ArrowRight className="w-6 h-6" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkAnalyzer;
