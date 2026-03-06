'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { components } from '@/types/api';
import HelpModal from './HelpModal';

type FileMetadata = components['schemas']['FileMetadata'];

interface AppFooterProps {
  index: number;
  totalFiles: number;
  metadata: FileMetadata | undefined;
  isSkipped: boolean;
  isSaving: boolean;
  displayMode: 'high' | 'low';
  onPrev: () => void;
  onNext: () => void;
  onToggleSkip: () => void;
  onToggleDisplayMode: () => void;
}

export default function AppFooter({
  index,
  totalFiles,
  metadata,
  isSkipped,
  isSaving,
  displayMode,
  onPrev,
  onNext,
  onToggleSkip,
  onToggleDisplayMode,
}: AppFooterProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <footer className="h-16 w-full bg-slate-900 text-slate-300 grid grid-cols-[1fr_auto_1fr] items-center px-6 shrink-0 z-50 shadow-2xl border-t border-slate-800">
      {/* LEFT: Metadata */}
      <div className="flex items-center gap-8 overflow-hidden">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">File ID</span>
          <span className="text-sm font-mono text-slate-200 whitespace-nowrap">{metadata?.filename || '---'}</span>
        </div>
        <div className="h-8 w-px bg-slate-800 shrink-0" />
        <div className="flex flex-col shrink-0">
          {/* CRITICAL: This MUST display Heart Rate BPM. Do not change this label or unit. */}
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-rose-500/80 mb-0.5">Heart Rate</span>
          <span className="text-sm font-bold text-rose-400 whitespace-nowrap">{metadata?.samplingRate ? Math.round(metadata.samplingRate) : '--'} BPM</span>
        </div>
      </div>

      {/* CENTER: Navigation & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button 
            onClick={onPrev}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Previous (Left Arrow)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div className="px-4 flex items-center gap-2">
            <span className="text-sm font-bold text-white">{index + 1}</span>
            <span className="text-slate-600">/</span>
            <span className="text-sm font-bold text-slate-400">{totalFiles}</span>
          </div>

          <button 
            onClick={onNext}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title="Next (Right Arrow)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <button 
          onClick={onToggleSkip}
          className={clsx(
            "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all",
            isSkipped 
              ? "bg-red-900/50 border-red-700 text-red-200 hover:bg-red-800" 
              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
          )}
        >
          {isSkipped ? 'Skipped' : 'Skip [S]'}
        </button>
      </div>

      {/* RIGHT: Display Controls */}
      <div className="flex items-center justify-end gap-3">
        {isSaving && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 animate-pulse uppercase mr-4 whitespace-nowrap">
             <div className="w-2 h-2 bg-blue-500 rounded-full" />
             Saving...
          </div>
        )}
        
        <button 
          onClick={onToggleDisplayMode}
          className={clsx(
            "p-2 rounded-lg border transition-all",
            displayMode === 'low' 
              ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20" 
              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
          )}
          title={displayMode === 'low' ? "Switch to High-Res" : "Switch to Low-Res (Zoom)"}
        >
          {displayMode === 'low' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          )}
        </button>

        <button 
          onClick={() => setIsHelpOpen(true)}
          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 cursor-help hover:text-slate-200 hover:border-slate-500 transition-all active:scale-90"
        >
          ?
        </button>

        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </footer>
  );
}
