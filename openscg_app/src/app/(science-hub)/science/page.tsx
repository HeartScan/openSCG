import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getMasterStudies } from '@/lib/science';
import { RandomStudyIllustration } from '@/components/RandomStudyIllustration';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Activity, ShieldCheck, Microscope, Database, BarChart3, ChevronRight, Stethoscope, Cpu, FlaskConical } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Science & Clinical Validation | OpenSCG.org',
  description: 'Evidence-based foundation of smartphone Seismocardiography. Validated against Echo and MRI for clinical-grade cardiac insights.',
  keywords: ['SCG validation', 'seismocardiography accuracy', 'smartphone heart monitoring', 'heart failure detection', 'CAD screening'],
};

export default async function ScienceHubPage() {
  const allStudies = await getMasterStudies();
  
  const clusters = [
    { id: 'comparison', name: 'Gold-Standard Comparisons', icon: <FlaskConical className="w-5 h-5" /> },
    { id: 'cad', name: 'CAD Detection & Ischemia', icon: <Activity className="w-5 h-5" /> },
    { id: 'hf', name: 'Heart Failure & Congestion', icon: <Stethoscope className="w-5 h-5" /> },
    { id: 'tech', name: 'Technical Reports & MEMS', icon: <Cpu className="w-5 h-5" /> },
    { id: 'ml', name: 'Machine Learning & AI', icon: <Microscope className="w-5 h-5" /> },
  ];

  const groupedStudies = clusters.map(cluster => ({
    ...cluster,
    studies: allStudies.filter(s => s.cluster === cluster.id)
  })).filter(c => c.studies.length > 0);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto py-20 px-4 sm:px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-4">
              <ShieldCheck className="w-4 h-4" />
              E-E-A-T Validated Research Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
              The Science of <span className="text-primary">Mechanical</span> Cardiac Insights
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl font-medium">
              OpenSCG.org provides a transparent, peer-reviewed foundation for smartphone-based Seismocardiography, backed by over 30 years of clinical research.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#summary" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95">
                <BarChart3 className="w-5 h-5" />
                PERFORMANCE SUMMARY
              </a>
              <a href="#bibliography" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-slate-900/10 active:scale-95">
                <Database className="w-5 h-5" />
                EXPLORE CLUSTERS
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-20 px-4 sm:px-6 space-y-32">
        {/* Random Illustration Highlight */}
        <RandomStudyIllustration />
        
        {/* Performance Summary */}
        <section id="summary" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Clinical Performance</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Validated against Echo, MRI, and Angiography</p>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-3 py-1 rounded-full">v2.0.0 Stable</div>
          </div>
          
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Application</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Validated Accuracy</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Study IDs</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Clinical Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm"><FlaskConical className="w-6 h-6" /></div>
                        <span className="font-black text-slate-900 text-lg">Timing Precision</span>
                      </div>
                    </td>
                    <td className="p-8 font-mono text-primary font-black text-lg">5-10 ms <span className="text-xs uppercase text-slate-400">MAD</span></td>
                    <td className="p-8">
                      <div className="flex gap-2">
                        <Link href="/science/studies/dehkordi-2019-multimodal-echo-investigation" className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">S001</Link>
                        <Link href="/science/studies/sørensen-2018-definition-of-fiducial-points" className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">S002</Link>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">High (Echo Validated)</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-sm"><ShieldCheck className="w-6 h-6" /></div>
                        <span className="font-black text-slate-900 text-lg">Ischemia (CAD)</span>
                      </div>
                    </td>
                    <td className="p-8 font-mono text-primary font-black text-lg">0.93 <span className="text-xs uppercase text-slate-400">AUC</span></td>
                    <td className="p-8">
                      <div className="flex gap-2">
                        <Link href="/science/studies/dehkordi-2019-scg-for-cad-screening" className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">S006</Link>
                        <Link href="/science/studies/wilson-1993-diagnostic-accuracy-of-scg-for-cad" className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">S038</Link>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">Angio Confirmed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm"><Stethoscope className="w-6 h-6" /></div>
                        <span className="font-black text-slate-900 text-lg">Heart Failure</span>
                      </div>
                    </td>
                    <td className="p-8 font-mono text-primary font-black text-lg">0.95 <span className="text-xs uppercase text-slate-400">AUC</span></td>
                    <td className="p-8">
                      <div className="flex gap-2">
                        <Link href="/science/studies/haddad-2024-smartphone-hf-recognition" className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">S007</Link>
                        <Link href="/science/studies/suresh-2020-seismonet-end-to-end-dl" className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">S027</Link>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">Clinical Scale</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-8 border-b-0">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm"><Cpu className="w-6 h-6" /></div>
                        <span className="font-black text-slate-900 text-lg">Sensor Fidelity</span>
                      </div>
                    </td>
                    <td className="p-8 font-mono text-primary font-black text-lg border-b-0">0.98+ <span className="text-xs uppercase text-slate-400">Corr.</span></td>
                    <td className="p-8 border-b-0">
                      <div className="flex gap-2">
                        <Link href="/science/studies/landreani-2016-beat-to-beat-hr-by-smartphone" className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">S009</Link>
                        <Link href="/science/studies/inan-2014-review-of-recent-advances" className="text-[10px] font-black bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">S031</Link>
                      </div>
                    </td>
                    <td className="p-8 border-b-0">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider">Hardware Validated</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Synthesis Hubs */}
        <section className="scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Scientific Syntheses</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Deep-dive analyses grouping decades of evidence into clear, actionable knowledge modules.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <Link href="/science/synthesis/cad-evolution" className="group">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl transition-all group-hover:shadow-primary/10 group-hover:border-primary/30 h-full flex flex-col">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-primary transition-colors">The CAD Evolution</h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-8">
                  How stress SCG accurately predicts anatomic CAD and estimates PCWP in clinical settings.
                </p>
                <div className="mt-auto flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                  Read Analysis <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <Link href="/science/synthesis/smartphone-accuracy" className="group">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl transition-all group-hover:shadow-blue-600/10 group-hover:border-blue-600/30 h-full flex flex-col">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                  <Cpu className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-blue-600 transition-colors">Smartphone Sensors</h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-8">
                  Technical breakdown of MEMS accelerometer noise floors and advanced ML denoising.
                </p>
                <div className="mt-auto flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-[10px]">
                  Review Technicals <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            <Link href="/science/synthesis/fiducial-points" className="group">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl transition-all group-hover:shadow-emerald-600/10 group-hover:border-emerald-600/30 h-full flex flex-col">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <Microscope className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-emerald-600 transition-colors">Cardiac Cycle Blueprint</h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-8">
                  Technical reference for AO, AC, MO, and MC waveforms validated against echocardiography.
                </p>
                <div className="mt-auto flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[10px]">
                  View Blueprint <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Bibliography Organized by Clusters */}
        <section id="bibliography" className="scroll-mt-24 space-y-20">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Research Clusters</h2>
            <p className="text-slate-500 font-medium leading-relaxed italic border-l-4 border-primary pl-6">
              Our bibliography is organized by all 5 clinical and technical domains to facilitate targeted academic review.
            </p>
          </div>
          
          {groupedStudies.map((group) => (
            <div key={group.id} className="space-y-10">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">{group.icon}</div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{group.name}</h3>
                <span className="ml-auto text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full text-slate-400">{group.studies.length} STUDIES</span>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.studies.map((study) => (
                  <Link 
                    key={study.id} 
                    href={`/science/studies/${study.slug}`} 
                    className="group bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-primary hover:shadow-2xl transition-all flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg">ID: {study.id}</span>
                      <span className="text-xs font-bold text-slate-400">{study.year !== 0 ? study.year : 'N/A'}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors tracking-tight">{study.title}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-6">{study.authors_short}</p>
                    <p className="text-sm text-slate-600 line-clamp-3 mt-auto leading-relaxed font-medium">{study.answer_machine.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* FAQ Section */}
        <section className="bg-slate-900 text-white rounded-[4rem] p-12 md:p-24 shadow-2xl shadow-slate-900/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-16 text-center tracking-tighter leading-none">Evidence-Based <span className="text-primary italic font-serif">FAQ</span></h2>
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-primary flex items-center gap-4 italic tracking-tight">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  How does respiration affect SCG?
                </h3>
                <p className="text-slate-400 leading-relaxed font-medium text-lg pl-6 border-l border-slate-800">
                  Respiration induces baseline wander and morphology changes. Our algorithms compensate for these effects, though a brief 10-second breath-hold is recommended for highest precision <Link href="/science/studies/zia-2020-resilient-sti-estimation" className="text-white hover:text-primary font-black underline decoration-primary underline-offset-4">(S039)</Link>.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-primary flex items-center gap-4 italic tracking-tight">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  Is the technology truly ECG-free?
                </h3>
                <p className="text-slate-400 leading-relaxed font-medium text-lg pl-6 border-l border-slate-800">
                  Yes. Peer-reviewed research confirms the feasibility of identifying heartbeats and inter-beat intervals directly from SCG via template matching and mode decomposition <Link href="/science/studies/shafiq-2016-automatic-sti-identification" className="text-white hover:text-primary font-black underline decoration-primary underline-offset-4">(S036)</Link>.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-primary flex items-center gap-4 italic tracking-tight">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  Can it monitor Stroke Volume at home?
                </h3>
                <p className="text-slate-400 leading-relaxed font-medium text-lg pl-6 border-l border-slate-800">
                  Studies in diverse patient groups, including children with CHD, have shown that SCG can estimate Stroke Volume with accuracy levels acceptable for clinical monitoring <Link href="/science/studies/ganti-2022-stroke-volume-in-chd" className="text-white hover:text-primary font-black underline decoration-primary underline-offset-4">(S034)</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <div className="bg-white py-32 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center">
           <div className="max-w-2xl mx-auto space-y-8">
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Open Research & Collaboration</h2>
             <p className="text-xl text-slate-500 font-medium leading-relaxed">
               OpenSCG.org is an open-source initiative. We welcome collaboration with academic institutions, clinical research organizations, and independent developers.
             </p>
             <div className="pt-6">
               <a href="https://github.com/HeartScan/openSCG" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-primary transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                 VIEW GITHUB REPOSITORY <ChevronRight className="w-5 h-5" />
               </a>
             </div>
           </div>
        </div>
      </div>

      <footer className="py-12 bg-slate-50 text-[10px] font-bold text-slate-400 text-center px-4 uppercase tracking-[0.2em]">
        <div className="max-w-4xl mx-auto border-t border-slate-200 pt-12">
          <p className="mb-6 leading-relaxed max-w-2xl mx-auto">Disclaimer: All clinical data refers to specific research cohorts. OpenSCG.org is for wellness and remote monitoring support. Consult with a medical professional for diagnosis.</p>
          <p>&copy; {new Date().getFullYear()} OpenSCG.org Project. Distributed under Creative Commons 4.0.</p>
        </div>
      </footer>
    </div>
  );
}
