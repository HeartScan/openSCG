import React from 'react';
import { Info, ExternalLink, ShieldCheck, Microscope, Database, GraduationCap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-slate-50/50 min-h-screen pb-24 font-sans selection:bg-primary/10">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="container mx-auto px-4 py-16 sm:px-6 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase shadow-lg shadow-primary/10">
                Institutional Profile
              </div>
              <div className="h-px w-8 bg-slate-200" />
              <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">About the Initiative</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.95]">
              OpenSCG is an open <span className="text-primary">research initiative</span>
            </h1>
            
            <p className="text-xl text-slate-600 font-medium leading-relaxed italic border-l-4 border-primary pl-8 py-2">
              Focused on seismocardiography (SCG), including curated scientific literature, datasets, methods, and educational materials.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/5" />
              
              <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter">Mission & Vision</h2>
              
              <div className="prose prose-slate max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-600 prose-p:font-medium">
                <p>
                  The project aims to make SCG research more accessible, structured, and machine-readable for researchers, developers, and clinicians. By bridging the gap between raw mechanical vibrations and clinical biomarkers, we enable the next generation of non-invasive cardiac monitoring.
                </p>
                
                <div className="grid sm:grid-cols-3 gap-6 mt-12">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <Microscope className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-sm font-black uppercase tracking-widest mb-2">Scientific Literature</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed">Curated database of peer-reviewed studies.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <Database className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-sm font-black uppercase tracking-widest mb-2">Open Datasets</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed">Standardized formats for signal processing.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <GraduationCap className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-sm font-black uppercase tracking-widest mb-2">Education</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed">Methods and materials for the SCG community.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white shadow-2xl shadow-slate-900/30 border border-white/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Affiliated Projects</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter mb-4">HeartScan</h2>
                  <p className="text-lg text-slate-400 font-medium max-w-md">
                    A commercial application of smartphone-based SCG technology, utilizing the research and standards developed within the OpenSCG ecosystem.
                  </p>
                </div>
                
                <a 
                  href="https://heartscan.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-primary hover:bg-white hover:text-primary text-white px-8 py-4 rounded-2xl font-black transition-all shrink-0 shadow-2xl shadow-primary/20 active:scale-95 uppercase tracking-widest text-xs"
                >
                  Visit HeartScan <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/40 sticky top-24">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Initiative Status</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Governance</span>
                  <span className="text-xs font-black uppercase px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">Open Source</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">License</span>
                  <span className="text-xs font-black uppercase text-slate-900">MIT</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Version</span>
                  <span className="text-xs font-black uppercase text-slate-900">2.0.1 Stable</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-sm font-bold text-slate-500">Contact</span>
                  <a href="mailto:contact@openscg.org" className="text-xs font-black uppercase text-primary hover:underline">Email Us</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
