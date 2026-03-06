import React from 'react';
import Link from 'next/link';
import { Github, Mail, ShieldCheck } from 'lucide-react';

export function ScienceFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-20 border-t border-slate-800 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-6 lg:col-span-5 space-y-8">
            <Link href="/" className="font-black text-3xl flex items-center gap-4 tracking-tighter text-white hover:opacity-90 transition-opacity">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">SCG</div>
              <span>OpenSCG<span className="text-primary">.org</span></span>
            </Link>
            <p className="text-lg text-slate-400 max-w-md font-medium leading-relaxed">
              An open-source ecosystem bridging the gap between high-fidelity mechanical vibrations and actionable cardiac digital biomarkers.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/HeartScan/openSCG" target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-primary hover:text-white transition-all">
                <Github className="w-6 h-6" />
              </a>
              <a href="mailto:contact@openscg.org" className="p-3 bg-white/5 rounded-xl hover:bg-primary hover:text-white transition-all">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-3 lg:col-span-3 lg:offset-1 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Clinical Resources</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/science" className="hover:text-primary transition-colors flex items-center gap-2 underline decoration-slate-800 underline-offset-4">Evidence Hub Overview</Link></li>
              <li><Link href="/science/synthesis/cad-evolution" className="hover:text-primary transition-colors">CAD Analysis</Link></li>
              <li><Link href="/science/synthesis/smartphone-accuracy" className="hover:text-primary transition-colors">Sensor Validation</Link></li>
              <li><Link href="/science/synthesis/fiducial-points" className="hover:text-primary transition-colors">Waveform Blueprint</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-3 lg:col-span-3 space-y-6">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Project Governance</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li className="flex items-center gap-2 text-slate-300 hover:text-primary transition-colors cursor-pointer">
                <Link href="/about" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Open Source (MIT)
                </Link>
              </li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Initiative</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Affiliated Projects</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            &copy; {new Date().getFullYear()} OpenSCG.org Project. Clinical grade research.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
             <span>v2.0.0 STABLE</span>
             <span>BUILD 2026-03-05</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
