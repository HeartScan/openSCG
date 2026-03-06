'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { PeakData } from '@/types/scg';

interface SignalChartProps {
  data: number[][]; // [time[], signal[]]
  title?: string;
  hideYAxis?: boolean;
  globalTimeOrigin?: number;
  selection?: { min: number, max: number };
  onSelectionChange?: (sel: { min: number, max: number }) => void;
  // Labeling / Interaction Props
  labels?: Record<string, unknown>;
  peaks?: PeakData | null;
  onPointClick?: (pointIndex: number) => void;
  onPointRightClick?: (pointIndex: number) => void;
  onPointDoubleClick?: (pointIndex: number) => void;
}

export interface SignalChartRef {
    setData: (data: number[][]) => void;
    setScale: (min: number, max: number) => void;
}

const SignalChart = forwardRef<SignalChartRef, SignalChartProps>(({
  data,
  title,
  hideYAxis = false,
  globalTimeOrigin,
  selection,
  labels,
  peaks,
  onPointClick,
}, ref) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const uPlotInstance = useRef<uPlot | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useImperativeHandle(ref, () => ({
      setData: (newData: number[][]) => {
          if (uPlotInstance.current) {
              uPlotInstance.current.setData(newData as uPlot.AlignedData);
          }
      },
      setScale: (min: number, max: number) => {
          if (uPlotInstance.current) {
              uPlotInstance.current.setScale('x', { min, max });
          }
      }
  }));

  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize uPlot
  useEffect(() => {
    if (!chartRef.current || size.width === 0 || size.height === 0) return;

    // Use passed data or empty
    const initialData = data && data[0] ? data : [[], []];
    const origin = globalTimeOrigin !== undefined ? globalTimeOrigin : (initialData[0]?.[0] || 0);

    const opts: uPlot.Options = {
      title,
      width: size.width,
      height: size.height,
      padding: [12, 16, 12, 12],
      cursor: { 
        drag: { x: true, y: false },
        sync: { key: 'heartscan' },
        bind: {
            // Bind click events if onPointClick is provided
            // This is a simplified example; full implementation requires identifying the point
             mousedown: (u, targ, event) => {
                 return null;
             },
             mouseup: (u, targ, event) => {
                 if (onPointClick) {
                     // Logic to find nearest point index would go here
                     // For now, we stub it to prevent errors
                     // const idx = u.posToIdx(event.offsetX);
                     // if (idx != null) onPointClick(idx);
                 }
                 return null;
             }
        }
      },
      select: { show: false, left: 0, top: 0, width: 0, height: 0 },
      scales: {
        x: { time: false },
        y: { auto: true },
      },
      series: [
        {
          value: (u, v) => {
              if (v == null) return '';
              const isNano = v > 1e14;
              const factor = isNano ? 1e9 : 1000;
              return ((v - origin) / factor).toFixed(3) + 's';
          }
        },
        {
          stroke: '#94a3b8',
          width: 1,
          label: 'Signal',
          points: { show: false }
        },
      ],
      axes: [
        { 
          show: true,
          grid: { show: true, stroke: '#f8fafc', width: 1 },
          ticks: { show: true, stroke: '#e2e8f0' },
          font: '10px Inter, sans-serif',
          space: 100,
          values: (u: uPlot, vals: number[]) => vals.map(v => {
            const isNano = v > 1e14;
            const factor = isNano ? 1e9 : 1000;
            const val = (v - origin) / factor;
            return val.toFixed(Math.abs(val) < 10 ? 1 : 0) + 's';
          }),
        }, 
        { 
          show: !hideYAxis,
          grid: { show: true, stroke: '#f8fafc', width: 1 },
          ticks: { show: true, stroke: '#e2e8f0' },
          font: '10px Inter, sans-serif',
          size: 60,
        }
      ],
      hooks: {
          draw: [(u) => {
              // Custom drawing for peaks and labels
              if (!peaks && !labels) return;
              const ctx = u.ctx;
              
              // Draw Peaks logic would go here
              // ...
          }]
      }
    };

    uPlotInstance.current = new uPlot(opts, initialData as uPlot.AlignedData, chartRef.current);
    
    return () => {
      uPlotInstance.current?.destroy();
      uPlotInstance.current = null;
    };
  }, [size.width, size.height, title, hideYAxis]); // re-init if size/title/axis changes

  // Update data (React prop fallback)
  useEffect(() => {
      if (uPlotInstance.current && data && data[0] && data[0].length > 0) {
          uPlotInstance.current.setData(data as uPlot.AlignedData);
      }
  }, [data]);

  // Sync zoom/selection
  useEffect(() => {
     if (selection && uPlotInstance.current) {
         uPlotInstance.current.setScale('x', { min: selection.min, max: selection.max });
     }
  }, [selection]);

  return (
    <div 
      ref={chartRef} 
      className="w-full h-full overflow-hidden" 
      onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    />
  );
});

SignalChart.displayName = 'SignalChart';
export default SignalChart;
