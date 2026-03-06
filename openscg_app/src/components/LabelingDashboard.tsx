'use client';

import { useEffect, useRef } from 'react';
import { useHeartScanLabels } from '@/hooks/useHeartScanLabels';
import { useChartInteractions } from '@/hooks/useChartInteractions';
import { useAppStore } from '@/store/useAppStore';
import { useQueryClient } from '@tanstack/react-query';
import ChartWorkspace from './ChartWorkspace';
import AppFooter from './AppFooter';
import FilterPanel from './FilterPanel';
import { useFileNavigation } from '@/hooks/useFileNavigation';
import { useChartDataPreparation } from '@/hooks/useChartDataPreparation';

interface ApiError {
  message: string;
}

export default function LabelingDashboard() {
  const queryClient = useQueryClient();
  const {
    displayMode,
    setDisplayMode,
    filters,
    setFilters,
    isFilterPanelOpen,
    toggleFilterPanel,
    setIsFilterPanelOpen,
  } = useAppStore();

  const {
    metadata,
    chartData,
    segmentData,
    peakData,
    isLoading,
    error
  } = useChartDataPreparation();

  const { 
    isSkipped, 
    toggleSkip, 
    isSaving, 
    saveLabels, 
    labels,
    isDirty
  } = useHeartScanLabels(metadata?.id);

  const {
      currentIndex,
      totalFiles,
      handlePrev,
      handleNext
  } = useFileNavigation({
      isDirty,
      saveLabels,
      toggleSkip
  });

  const { findNearestPoint, cycleLabel, setNegative, clearLabel } = useChartInteractions(metadata?.id);

  // AUTO-SAVE (Debounce)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDirty) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        console.log(`[Labels] Auto-saving due to inactivity...`);
        saveLabels();
      }, 3000);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [labels, isDirty, saveLabels]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-400 font-medium uppercase tracking-widest animate-pulse">
        Initializing workspace...
      </div>
    );
  }

  if (error) {
    const errorMsg = (error as ApiError)?.message || 'Service unavailable';
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 text-slate-800 p-8">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-200">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h2 className="text-xl font-bold mb-2">System Error</h2>
        <div className="bg-white border border-slate-200 rounded-md p-4 mb-6 max-w-lg shadow-sm">
           <p className="text-xs font-mono text-slate-500 break-all leading-relaxed text-center">
             {typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg}
           </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-2.5 bg-slate-900 text-white rounded-md font-bold hover:bg-black transition-colors shadow-lg"
        >
          Reload Interface
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-white flex flex-col overflow-hidden m-0 p-0 antialiased">
      {/* WORKSPACE AREA */}
      <main className="flex-1 w-full relative bg-white m-0 p-0 overflow-hidden flex flex-col min-h-0">
        <FilterPanel
          isOpen={isFilterPanelOpen}
          onToggle={toggleFilterPanel}
          onApply={(f) => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
            setFilters(f);
            setIsFilterPanelOpen(false);
          }}
          initialFilters={filters}
        />

        <ChartWorkspace
          displayMode={displayMode}
          chartData={chartData}
          segmentData={segmentData}
          labels={labels}
          peaks={peakData}
          onPointClick={cycleLabel}
          onPointRightClick={setNegative}
          onPointDoubleClick={clearLabel}
          findNearestPoint={findNearestPoint}
        />

        {isSkipped && (
          <div className="absolute inset-0 z-[60] bg-red-500/5 pointer-events-none border-[12px] border-red-500/10 flex items-start justify-center pt-24">
            <div className="bg-red-600 text-white px-6 py-2 text-xl font-black shadow-xl uppercase tracking-tighter rounded-sm">
              RECORD SKIPPED
            </div>
          </div>
        )}
      </main>

      {/* FOOTER BAR */}
      <AppFooter
        index={currentIndex}
        totalFiles={totalFiles}
        metadata={metadata}
        isSkipped={isSkipped}
        isSaving={isSaving}
        displayMode={displayMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToggleSkip={toggleSkip}
        onToggleDisplayMode={() => setDisplayMode(displayMode === 'high' ? 'low' : 'high')}
      />
    </div>
  );
}
