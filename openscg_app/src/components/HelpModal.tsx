'use client';

import { useState } from 'react';
import { 
  X, 
  MousePointer2, 
  MousePointerClick, 
  Keyboard, 
  Info, 
  ArrowLeftRight, 
  ArrowUpCircle, 
  Search,
  Zap
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Info className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">Quick Start Guide</h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Mastering the workspace</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section: Mouse Labeling */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <MousePointer2 className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-tighter">Mouse Interactions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InteractionCard 
                icon={<MousePointerClick className="w-4 h-4" />}
                title="Left Click"
                description="Cycle label: None → Positive → Negative → Skipped"
                color="text-emerald-400"
                bg="bg-emerald-400/5"
              />
              <InteractionCard 
                icon={<Zap className="w-4 h-4" />}
                title="Right Click"
                description="Quick mark as Negative (Red)"
                color="text-rose-400"
                bg="bg-rose-400/5"
              />
              <InteractionCard 
                icon={<X className="w-4 h-4" />}
                title="Double Click"
                description="Clear label (Remove)"
                color="text-slate-400"
                bg="bg-slate-400/5"
              />
            </div>
          </section>

          {/* Section: Keyboard Shortcuts */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Keyboard className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-tighter">Keyboard Shortcuts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Shortcut keyName="← / →" description="Navigate to Previous / Next file" />
              <Shortcut keyName="↑ / ↓" description="Toggle SKIP status for current file" />
              <Shortcut keyName="S" description="Quick toggle SKIP status" />
              <Shortcut keyName="Ctrl + Wheel" description="Zoom horizontal (Time axis)" />
              <Shortcut keyName="Shift + Wheel" description="Scroll vertical (Amplitude)" />
              <Shortcut keyName="Wheel" description="Zoom vertical (Amplitude)" />
            </div>
          </section>

          {/* Section: Navigation Modes */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-purple-400">
              <ArrowLeftRight className="w-4 h-4" />
              <h3 className="text-xs font-black uppercase tracking-tighter">Advanced Navigation</h3>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 bg-purple-500/10 rounded flex items-center justify-center">
                  <Search className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-sm">
                  <p className="text-slate-200 font-bold">Low-Res (Zoom) Mode</p>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1">
                    Use the bottom overview chart to navigate long signals. Drag the blue box to move, or draw a new area to zoom in.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-700/50">
                <div className="shrink-0 w-8 h-8 bg-emerald-500/10 rounded flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-sm">
                  <p className="text-slate-200 font-bold">Auto-Save</p>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1">
                    Your changes are saved automatically whenever you move to another file or apply filters.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

function InteractionCard({ icon, title, description, color, bg }: { icon: React.ReactNode, title: string, description: string, color: string, bg: string }) {
  return (
    <div className={`${bg} border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700 group`}>
      <div className={`${color} mb-3 group-hover:scale-110 transition-transform`}>{icon}</div>
      <p className="text-sm font-bold text-slate-200 mb-1 leading-tight">{title}</p>
      <p className="text-xs text-slate-500 leading-snug">{description}</p>
    </div>
  );
}

function Shortcut({ keyName, description }: { keyName: string, description: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-800 rounded-lg group hover:border-slate-700 transition-all">
      <span className="text-xs text-slate-400 leading-tight pr-4">{description}</span>
      <kbd className="px-2 py-1 bg-slate-950 border border-slate-700 text-[10px] font-mono font-black text-slate-300 rounded shadow-inner shrink-0 group-hover:text-blue-400 group-hover:border-blue-900/50 transition-colors">
        {keyName}
      </kbd>
    </div>
  );
}
