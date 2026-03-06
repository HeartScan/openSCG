'use client';

import { useState, useMemo, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import uPlot from 'uplot';
import { ChartData, ChartWorkspaceProps, PeakData } from '@/types/scg';
import SignalChart, { SignalChartRef } from './SignalChart';
import OverviewChart, { OverviewChartRef } from './OverviewChart';

export interface ChartWorkspaceRef {
    updateData: (data: number[][]) => void;
}

const ChartWorkspace = forwardRef<ChartWorkspaceRef, ChartWorkspaceProps>(({
  displayMode,
  chartData,
  segmentData,
  labels,
  peaks,
  onPointClick,
  onPointRightClick,
  onPointDoubleClick,
  findNearestPoint
}, ref) => {
  // We keep a local reference to data to allow imperative updates
  const [internalData, setInternalData] = useState<number[][] | null>(chartData);
  
  // Refs to children
  const signalChartRef = useRef<SignalChartRef>(null);
  const overviewChartRef = useRef<OverviewChartRef>(null);
  
  // For 'high' mode, we might need array of refs? 
  // Simplify: 'high' mode updates via state (internalData), 'low' mode via refs.

  useEffect(() => {
      setInternalData(chartData);
  }, [chartData]);

  useImperativeHandle(ref, () => ({
      updateData: (newData: number[][]) => {
          if (displayMode === 'low') {
              // Direct imperative update for performance
              if (signalChartRef.current) signalChartRef.current.setData(newData);
              if (overviewChartRef.current) overviewChartRef.current.setData(newData);
              
              // LIVE TRACKING LOGIC
              if (overviewChartRef.current && signalChartRef.current && newData[0].length > 0) {
                  const time = newData[0];
                  const lastTime = time[time.length - 1];
                  const WINDOW = 10000; // 10s window
                  const min = Math.max(time[0], lastTime - WINDOW);
                  const max = lastTime;
                  
                  signalChartRef.current.setScale(min, max);
                  overviewChartRef.current.setSelection(min, max);
              }
          } else {
              // For high mode, we just update state to trigger re-render and segment calc
              setInternalData(newData);
          }
      }
  }));

  const globalTimeOrigin = internalData?.[0]?.[0] || 0;

  const initialSelection = useMemo(() => {
    if (!internalData || internalData[0].length === 0) return undefined;
    const start = internalData[0][0];
    const last = internalData[0][internalData[0].length - 1];
    const diff = last - start;
    
    const isNano = diff > 1e7; 
    const step = isNano ? 1e9 : 1000;
    
    const end = start + 10 * step; 
    return { min: start, max: Math.min(last, end) };
  }, [internalData]); // This only runs if internalData changes (e.g. high mode or initial load)

  const [lastDataId, setLastDataId] = useState<number[][] | null>(null);
  const [internalSelection, setInternalSelection] = useState<{ min: number; max: number } | undefined>(undefined);

  if (internalData && lastDataId && internalData !== lastDataId) {
      if (internalData[0][0] !== lastDataId[0][0]) {
          setLastDataId(internalData);
          setInternalSelection(undefined);
      } else {
          setLastDataId(internalData);
      }
  } else if (internalData !== lastDataId) {
      setLastDataId(internalData);
      setInternalSelection(undefined);
  }

  const selection = internalSelection || initialSelection;

  const segments = useMemo(() => {
    if (displayMode !== 'high' || !internalData || internalData[0].length === 0) return null;
    
    // Use provided segmentData if available (e.g. from labeling prep)
    if (segmentData && segmentData.length > 0) {
        return segmentData;
    }

    const totalPoints = internalData[0].length;
    const segmentSize = Math.floor(totalPoints / 3);
    
    return [0, 1, 2].map(i => {
      const start = i * segmentSize;
      const end = i === 2 ? totalPoints : (i + 1) * segmentSize;
      return [
        internalData[0].slice(start, end),
        internalData[1].slice(start, end)
      ];
    });
  }, [internalData, displayMode, segmentData]);

  if (!internalData || internalData[0].length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-300 font-bold uppercase text-[11px] tracking-widest italic">
        Awaiting signal data...
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden m-0 p-0 gap-1">
      {displayMode === 'high' ? (
        segments?.map((seg, idx) => (
          <div key={idx} className="flex-1 w-full relative m-0 p-0 overflow-hidden bg-white border-b border-slate-100 last:border-b-0">
            <SignalChart
              data={seg}
              hideYAxis={false}
              globalTimeOrigin={globalTimeOrigin}
              title={`Segment ${idx + 1}`}
              onPointClick={onPointClick}
              onPointRightClick={onPointRightClick}
              onPointDoubleClick={onPointDoubleClick}
              labels={labels}
              peaks={peaks}
            />
          </div>
        ))
      ) : (
        <div className="w-full h-full flex flex-col m-0 p-0 overflow-hidden bg-white">
          <div className="flex-[4] min-h-0 w-full relative m-0 p-0 overflow-hidden bg-white">
            <SignalChart
              ref={signalChartRef}
              data={internalData}
              title="Zoomed region"
              globalTimeOrigin={globalTimeOrigin}
              selection={selection}
              onPointClick={onPointClick}
              onPointRightClick={onPointRightClick}
              onPointDoubleClick={onPointDoubleClick}
              labels={labels}
              peaks={peaks}
            />
          </div>
          <div className="flex-1 min-h-[100px] max-h-[120px] w-full shrink-0 border-t border-slate-200 bg-slate-50/30 m-0 p-0 flex items-center overflow-hidden relative">
            <OverviewChart 
              ref={overviewChartRef}
              data={internalData}
              selection={selection!}
              onSelectionChange={setInternalSelection}
              globalTimeOrigin={globalTimeOrigin}
            />
          </div>
        </div>
      )}
    </div>
  );
});

ChartWorkspace.displayName = 'ChartWorkspace';
export default ChartWorkspace;
