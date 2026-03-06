import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Microscope, ChevronRight } from 'lucide-react';

export function ScienceHubEntry() {
  return (
    <div className="w-full max-w-md mt-12 group">
      <div className="relative p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 transition-all hover:shadow-primary/10 hover:border-primary/30 overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Scientific Evidence</h2>
            <p className="text-xs text-primary font-black uppercase tracking-widest">Clinical Validation</p>
          </div>
        </div>
        
        <p className="text-slate-600 mb-8 leading-relaxed font-medium">
          OpenSCG.org is built on a foundation of rigorous research, validated against <span className="text-slate-900 font-bold">gold-standard Echo and MRI</span> clinical references.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">HF Accuracy</p>
            <p className="text-2xl font-black text-primary tracking-tighter">0.95 <span className="text-xs uppercase ml-0.5">AUC</span></p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-wider">Precision</p>
            <p className="text-2xl font-black text-primary tracking-tighter">5-10 <span className="text-xs uppercase ml-0.5">ms</span></p>
          </div>
        </div>
        
        <Link 
          href="/science" 
          className="flex items-center justify-center gap-3 w-full bg-slate-900 hover:bg-primary text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-900/20 hover:shadow-primary/30 active:scale-[0.98]"
        >
          <BookOpen className="w-5 h-5" />
          EXPLORE SCIENCE HUB
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
      
      <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Peer-Reviewed • Open Source • Clinical Grade
      </p>
    </div>
  );
}
