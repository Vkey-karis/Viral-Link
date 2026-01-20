
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, Hash, Target, Trophy, Flame, Lightbulb, TrendingUp, DollarSign, Clock, BarChart, BookMarked, Search, Filter } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const SEOContent: React.FC<Props> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Growth Hacks', 'Digital Assets', 'Affiliate Basics', 'Sales Velocity', 'Global Markets'];

  const guides = [
    {
      title: "Mastering the TikTok Affiliate Algorithm with ViralLink",
      keywords: "TikTok shop for creators, viral affiliate hooks, algorithm pacing, high engagement shorts",
      category: "Growth Hacks",
      level: "Intermediate",
      time: "5 min",
      content: `The secret to winning on TikTok in 2026 isn't just about the product—it's about 'pacing.' ViralLink's AI engine is specifically tuned to generate scripts that use 'pattern interrupts' every 3 seconds. By using our 'Wake Up Call' template, you can bypass the scroll-reflex and force viewers to engage.`,
      proTip: "When using our AI, ensure your hook mentions a specific number (e.g., '3 reasons why you are failing...'). This creates a psychological curiosity gap.",
      powerKeywords: ["ROI", "Retention", "Curiosity Gap"]
    },
    {
      title: "How to Scale Gumroad & Selar to $10k/Month Using AI",
      keywords: "Gumroad passive income, digital products marketing, Selar affiliate nigeria, automated VSL",
      category: "Digital Assets",
      level: "Advanced",
      time: "8 min",
      content: `Selling digital products on Gumroad or Selar requires a different visual strategy. Unlike physical goods, digital assets need to show 'outcome' rather than 'item.' ViralLink's 'Before/After' mode is perfect for software or courses. It visualizes the frustration of the user before your product and the massive relief after.`,
      proTip: "Use the 'Professional Female' voice (Zephyr) for digital courses. Data shows that calm, authoritative female voices have 22% higher conversion rates for educational content.",
      powerKeywords: ["Conversion Rate", "Passive Income", "Scalability"]
    },
    {
      title: "Amazon Associates: The Zero-Budget Video Strategy",
      keywords: "Amazon associates high ticket items, free video ads for amazon, zero budget affiliate",
      category: "Affiliate Basics",
      level: "Beginner",
      time: "4 min",
      content: `Most Amazon affiliates fail because they use boring, static images. ViralLink's Image-to-Video feature takes standard Amazon product photos and adds cinematic motion, professional lighting, and viral overlays. This turns a simple sneaker photo from Adidas into a 4k lifestyle commercial.`,
      proTip: "Focus on 'High Ticket' items. ViralLink allows you to create luxury-style ads for these high-ticket items instantly to maximize commission-per-click.",
      powerKeywords: ["High-Ticket", "Aesthetics", "Brand Authority"]
    },
    {
      title: "WarriorPlus & ClickBank: The 'Direct Response' Revolution",
      keywords: "WarriorPlus vs ClickBank, high gravity products, AI sales scripts, VSL automation",
      category: "Sales Velocity",
      level: "Advanced",
      time: "6 min",
      content: `In the high-velocity world of WarriorPlus and ClickBank, you need scripts that feel 'raw' and 'urgent.' Our 'Stop Lying' template is designed for this exact purpose. It uses aggressive questioning to disqualify non-buyers and attract high-intent leads.`,
      proTip: "Always use the 'Energetic Male' voice (Puck) for these niches. Energy transfers. If your voiceover sounds excited, your audience will feel the energy of the opportunity.",
      powerKeywords: ["Sales Velocity", "Direct Response", "Gravity Scores"]
    }
  ];

  const filteredGuides = activeCategory === 'All' ? guides : guides.filter(g => g.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 py-12 animate-fade-in">
      
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 shrink-0 space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-black uppercase text-[10px] tracking-[0.3em] mb-12">
          <ArrowLeft className="w-4 h-4" /> Back Home
        </button>

        <div className="space-y-4">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-indigo-500 pl-4">Categories</h4>
           <div className="flex flex-col gap-1">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold text-left transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
           <div className="flex items-center gap-2 text-indigo-400">
             <BookMarked className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-widest">Saved Guides</span>
           </div>
           <p className="text-[10px] text-slate-500 leading-relaxed">Login to bookmark strategy guides for offline access.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-1 w-12 bg-indigo-500"></div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Knowledge Hub</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">THE AFFILIATE DOMINATION <br /> <span className="text-slate-600">BLUEPRINTS</span></h1>
        </div>

        <div className="grid grid-cols-1 gap-12">
           {filteredGuides.map((guide, i) => (
             <div key={i} className="group bg-slate-900/40 border border-slate-800 p-10 rounded-[2.5rem] hover:border-indigo-500/30 transition-all space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Target className="w-32 h-32 text-indigo-500" />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-lg text-[10px] font-black uppercase text-slate-400 border border-slate-800">
                         <Clock className="w-3 h-3" /> {guide.time}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-lg text-[10px] font-black uppercase text-indigo-400 border border-slate-800">
                         <BarChart className="w-3 h-3" /> {guide.level}
                      </div>
                   </div>
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{guide.category}</span>
                </div>

                <div className="space-y-4 relative z-10">
                   <h3 className="text-3xl font-bold text-white leading-tight">{guide.title}</h3>
                   <div className="flex flex-wrap gap-2">
                     {guide.keywords.split(',').map(k => (
                       <span key={k} className="text-[9px] font-black text-slate-500 uppercase px-2 py-1 bg-slate-950/50 rounded border border-slate-800">{k.trim()}</span>
                     ))}
                   </div>
                </div>

                <p className="text-slate-400 leading-relaxed text-lg relative z-10">{guide.content}</p>

                {/* Pro Tip Box (SEO Trick) */}
                <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex gap-4 relative z-10">
                   <div className="shrink-0 w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                      <Lightbulb className="w-5 h-5" />
                   </div>
                   <div className="space-y-1">
                      <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest">Affiliate Secret</h4>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"{guide.proTip}"</p>
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex items-center justify-between relative z-10">
                   <div className="flex gap-4">
                      {guide.powerKeywords.map(pk => (
                        <span key={pk} className="text-[9px] font-black text-indigo-500/60 uppercase">{pk}</span>
                      ))}
                   </div>
                   <button className="flex items-center gap-2 text-white font-black uppercase text-xs tracking-widest group/btn">
                     Read Full Blueprint <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-all" />
                   </button>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-12 rounded-[3rem] text-center space-y-6 shadow-2xl">
           <Trophy className="w-12 h-12 text-white/50 mx-auto" />
           <h3 className="text-3xl font-black text-white">READY TO TEST THESE STRATEGIES?</h3>
           <p className="text-white/70 max-w-sm mx-auto">Knowledge without action is just data. Start your campaign today.</p>
           <button onClick={onBack} className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all">
             Launch Dashboard
           </button>
        </div>
      </div>
    </div>
  );
};

export default SEOContent;
