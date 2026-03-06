'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ChartWorkspace, { ChartWorkspaceRef } from './ChartWorkspace';
import { X, LayoutGrid, Activity } from 'lucide-react';
import { useScgSocket } from '@/hooks/useScgSocket';
import { ScgTuple } from '@/types/scg';

interface SignalViewerProps {
  sessionId?: string;
  initialData?: number[][]; // [time[], signal[]]
  timestamp?: number;
  title?: string;
  onClose?: () => void;
}

export default function SignalViewer({ sessionId, initialData, timestamp, title, onClose }: SignalViewerProps) {
  const [displayMode, setDisplayMode] = useState<'high' | 'low'>('low');
  // State for low-frequency updates / initial load
  const [data, setData] = useState<number[][]>(initialData || [[], []]);

  // Refs for high-frequency updates
  const dataRef = useRef<number[][]>(initialData || [[], []]);
  const chartWorkspaceRef = useRef<ChartWorkspaceRef>(null);
  const rafRef = useRef<number | null>(null);
  const lastStateUpdate = useRef<number>(0);

  // Socket callback
  const onData = useCallback((points: ScgTuple[]) => {
    // Initialize if empty
    if (dataRef.current.length < 2) dataRef.current = [[], []];
    const times = dataRef.current[0];
    const signal = dataRef.current[1];

    const wasEmpty = times.length === 0;

    // Filter out points with anomalous timestamps
    const now = Date.now();
    const validPoints = points.filter((p) => p[0] > now - 3600000); // Last hour only

    if (validPoints.length === 0) return;

    validPoints.forEach((p) => {
      times.push(p[0]);
      signal.push(p[3]);
    });

    // Limit buffer size (1M points max)
    const MAX_POINTS = 1000000;
    if (times.length > MAX_POINTS) {
      dataRef.current = [times.slice(-MAX_POINTS), signal.slice(-MAX_POINTS)];
    }

    // Trigger first render if this was the first data packet
    if (wasEmpty) {
      setData([[...times], [...signal]]);
    }

    // High-Frequency Imperative Update via RAF
    if (chartWorkspaceRef.current) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (chartWorkspaceRef.current) {
          chartWorkspaceRef.current.updateData(dataRef.current);
        }
      });
    }
  }, []);

  useScgSocket(sessionId, onData);

  // Sync dataRef to state when switching to 'high' mode, or periodically if in 'high' mode
  useEffect(() => {
    if (displayMode === 'high') {
      setData([[...dataRef.current[0]], [...dataRef.current[1]]]);

      // Set up interval for high mode updates
      const interval = setInterval(() => {
        setData([[...dataRef.current[0]], [...dataRef.current[1]]]);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [displayMode]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Initial loading state
  if (!data || data[0]?.length === 0) {
    if (sessionId) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500 p-8 text-center animate-in fade-in duration-700">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-blue-500 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">Waiting for Patient</h2>
          <p className="max-w-md text-slate-500 mb-6 leading-relaxed">
            The session link has been established. Once the patient starts the recording, the live signal will appear
            here automatically.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            Connection active for {sessionId.slice(0, 8)}
          </div>
        </div>
      );
    }
    return null;
  }

  // Display count from Ref for realtime feeling, or state?
  const sampleCount = data[0]?.length || 0;

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Viewer Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 shrink-0 bg-white z-10 w-full">
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div className="flex w-8 h-8 bg-blue-50 rounded-lg items-center justify-center text-blue-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base font-bold text-slate-800 truncate">
              {title || (timestamp ? `Recorded: ${new Date(timestamp).toLocaleString()}` : (sessionId ? 'Live Session' : 'Signal Analysis'))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setDisplayMode('low')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                displayMode === 'low' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setDisplayMode('high')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                displayMode === 'high' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Split View
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
              title="Close viewer"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 min-h-0 relative">
        <ChartWorkspace ref={chartWorkspaceRef} chartData={data} displayMode={displayMode} />
      </div>
    </div>
  );
}
