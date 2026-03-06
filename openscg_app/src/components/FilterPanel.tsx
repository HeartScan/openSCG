'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { components } from '@/types/api';

type FileFilter = components['schemas']['FileFilter'];
type LabelStatus = "all" | "unlabeled" | "labeled" | "skipped" | "needs_review";

interface FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onApply: (filters: FileFilter) => void;
  initialFilters: FileFilter;
}

export default function FilterPanel({
  isOpen,
  onToggle,
  onApply,
  initialFilters,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FileFilter>(initialFilters);

  const handleApply = () => {
    onApply(localFilters);
  };

  const statusOptions: { value: LabelStatus; label: string; locked?: boolean }[] = [
    { value: 'all', label: 'All Files' },
    { value: 'unlabeled', label: 'Unlabeled' },
    { value: 'labeled', label: 'Labeled' },
    { value: 'skipped', label: 'Skipped' },
    { value: 'needs_review', label: 'Needs Review' },
  ];

  return (
    <div
      className={clsx(
        "fixed inset-y-0 right-0 w-[350px] bg-slate-50 shadow-xl z-[200] transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Trigger Tab */}
      <button
        onClick={onToggle}
        className={clsx(
          "absolute left-0 top-10 w-12 h-12 -translate-x-full rounded-l-md border-y border-l transition-colors flex items-center justify-center shadow-md",
          isOpen ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? <line x1="18" y1="6" x2="6" y2="18"></line> : <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>}
          {isOpen && <line x1="6" y1="6" x2="18" y2="18"></line>}
        </svg>
      </button>

      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Dataset Filters</h3>
        <p className="text-xs text-slate-500 mt-1">Configure your workspace view</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Workflow Phase */}
        <section>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Workflow Phase</label>
          <div className="grid grid-cols-1 gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setLocalFilters({ ...localFilters, labelStatus: option.value })}
                className={clsx(
                  "px-4 py-2.5 text-left text-sm font-semibold rounded-md transition-all border",
                  localFilters.labelStatus === option.value
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Metrics Section */}
        <section>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Signal Metrics</label>
          <div className="space-y-3">
             <div className="p-4 bg-white border border-slate-200 rounded-md">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-3">BPM Range</span>
                <div className="flex items-center gap-3">
                   <input 
                      type="number" 
                      placeholder="Min"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                      value={localFilters.bpmRange?.min || ''}
                      onChange={(e) => setLocalFilters({
                         ...localFilters,
                         bpmRange: { ...localFilters.bpmRange, min: parseInt(e.target.value) || undefined }
                      })}
                   />
                   <span className="text-slate-300">-</span>
                   <input 
                      type="number" 
                      placeholder="Max"
                      className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded outline-none focus:border-blue-500"
                      value={localFilters.bpmRange?.max || ''}
                      onChange={(e) => setLocalFilters({
                         ...localFilters,
                         bpmRange: { ...localFilters.bpmRange, max: parseInt(e.target.value) || undefined }
                      })}
                   />
                </div>
             </div>

             <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">
                <input 
                  type="checkbox"
                  checked={!!localFilters.editedByMe}
                  onChange={(e) => setLocalFilters({ ...localFilters, editedByMe: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Only my annotations</span>
             </label>
          </div>
        </section>

        {/* Search */}
        <section>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Search Identifier</label>
          <input
            type="text"
            value={localFilters.filenamePattern || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, filenamePattern: e.target.value })}
            placeholder="Filename / UUID"
            className="w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 placeholder:text-slate-300"
          />
        </section>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200 bg-white">
        <button
          onClick={handleApply}
          className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-md hover:bg-slate-900 transition-colors shadow-sm"
        >
          Apply Filters
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
