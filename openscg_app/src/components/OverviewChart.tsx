'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

interface OverviewChartProps {
  data: number[][];
  selection: { min: number, max: number };
  onSelectionChange: (sel: { min: number, max: number }) => void;
  globalTimeOrigin?: number;
}

export interface OverviewChartRef {
    setData: (data: number[][]) => void;
    setSelection: (min: number, max: number) => void;
}

const OverviewChart = forwardRef<OverviewChartRef, OverviewChartProps>(({
  data,
  selection,
  onSelectionChange,
  globalTimeOrigin,
}, ref) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  const uPlotInstance = useRef<uPlot | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  useImperativeHandle(ref, () => ({
      setData: (newData: number[][]) => {
          if (uPlotInstance.current) {
              uPlotInstance.current.setData(newData as uPlot.AlignedData);
          }
      },
      setSelection: (min: number, max: number) => {
          if (!selectionRef.current || !uPlotInstance.current) return;
          const data = uPlotInstance.current.data; 
          const time = data[0];
          if (!time || time.length === 0) return;
          
          const totalMin = time[0];
          const totalMax = time[time.length-1];
          const totalRange = totalMax - totalMin || 1;
          
          const left = ((min - totalMin) / totalRange) * 100;
          const width = ((max - min) / totalRange) * 100;
          
          selectionRef.current.style.left = `${Math.max(0, Math.min(100, left))}%`;
          selectionRef.current.style.width = `${Math.max(0, Math.min(100, width))}%`;
      }
  }));

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'resize-left' | 'resize-right' | null>(null);
  const [startX, setStartX] = useState(0);
  const [initialSelectionState, setInitialSelectionState] = useState(selection);

  const time = data[0];
  const totalMin = time && time.length > 0 ? time[0] : 0;
  const totalMax = time && time.length > 0 ? time[time.length - 1] : 1;
  const totalRange = totalMax - totalMin || 1;

  const leftPercent = ((selection.min - totalMin) / totalRange) * 100;
  const widthPercent = ((selection.max - selection.min) / totalRange) * 100;

  const isNano = totalRange > 1e7;
  const step = isNano ? 1e9 : 1000;

  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        sizeRef.current = { width: entry.contentRect.width, height: entry.contentRect.height };
        if (uPlotInstance.current) uPlotInstance.current.setSize(sizeRef.current);
      }
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize uPlot instance once
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Initial data or empty
    const initialData = data && data[0] ? data : [[], []];

    const opts: uPlot.Options = {
      width: sizeRef.current.width || 600,
      height: sizeRef.current.height || 100,
      padding: [0, 0, 0, 0],
      cursor: { show: false },
      select: { show: false, left: 0, top: 0, width: 0, height: 0 },
      scales: {
        x: { time: false },
        y: { range: (u, min, max) => [min, max] },
      },
      series: [
        {},
        {
          stroke: '#94a3b8',
          width: 1,
          points: { show: false },
          paths: uPlot.paths.linear ? uPlot.paths.linear() : undefined,
        },
      ],
      axes: [{ show: false }, { show: false }],
    };

    uPlotInstance.current = new uPlot(opts, initialData as uPlot.AlignedData, chartRef.current);
    
    return () => {
        uPlotInstance.current?.destroy();
        uPlotInstance.current = null;
    };
  }, []); // Run once on mount

  // Update data efficiently (React fallback)
  useEffect(() => {
      if (uPlotInstance.current && data && data[0] && data[0].length > 0) {
          uPlotInstance.current.setData(data as uPlot.AlignedData);
      }
  }, [data]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, mode: 'move' | 'resize-left' | 'resize-right') => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    setDragMode(mode);
    setStartX(clientX);
    setInitialSelectionState(selection);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = clientX - startX;
      const deltaVal = (deltaX / rect.width) * totalRange;

      if (dragMode === 'move') {
        let newMin = initialSelectionState.min + deltaVal;
        let newMax = initialSelectionState.max + deltaVal;
        const width = initialSelectionState.max - initialSelectionState.min;
        if (newMin < totalMin) { newMin = totalMin; newMax = totalMin + width; }
        if (newMax > totalMax) { newMax = totalMax; newMin = totalMax - width; }
        onSelectionChange({ min: newMin, max: newMax });
      } else if (dragMode === 'resize-left') {
        const newMin = Math.min(initialSelectionState.max - 0.05 * step, Math.max(totalMin, initialSelectionState.min + deltaVal));
        onSelectionChange({ min: newMin, max: initialSelectionState.max });
      } else if (dragMode === 'resize-right') {
        const newMax = Math.max(initialSelectionState.min + 0.05 * step, Math.min(totalMax, initialSelectionState.max + deltaVal));
        onSelectionChange({ min: initialSelectionState.min, max: newMax });
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragMode, startX, initialSelectionState, totalMin, totalMax, totalRange, onSelectionChange, step]);

  return (
    <div ref={containerRef} className="w-full h-full relative group select-none overflow-hidden bg-slate-50/50">
      {/* Background Chart */}
      <div ref={chartRef} className="absolute inset-0 pointer-events-none opacity-50" />
      
      {/* Interactive Selection Area */}
      <div 
        ref={selectionRef}
        className="absolute h-full bg-blue-500/10 border-x border-blue-500/30 transition-shadow duration-200"
        style={{ left: `${Math.max(0, Math.min(100, leftPercent))}%`, width: `${Math.max(0, Math.min(100, widthPercent))}%` }}
      >
        {/* Center Drag Area */}
        <div 
          className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
          onMouseDown={(e) => handleMouseDown(e, 'move')}
          onTouchStart={(e) => handleMouseDown(e, 'move')}
        />

        {/* Left Resize Handle */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize z-20"
          onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
          onTouchStart={(e) => handleMouseDown(e, 'resize-left')}
        >
          <div className="w-1.5 h-12 bg-blue-500/40 rounded-full shadow-sm" />
        </div>

        {/* Right Resize Handle */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-8 -mr-4 flex items-center justify-center cursor-ew-resize z-20"
          onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
          onTouchStart={(e) => handleMouseDown(e, 'resize-right')}
        >
          <div className="w-1.5 h-12 bg-blue-500/40 rounded-full shadow-sm" />
        </div>
      </div>
    </div>
  );
});

OverviewChart.displayName = 'OverviewChart';
export default OverviewChart;
