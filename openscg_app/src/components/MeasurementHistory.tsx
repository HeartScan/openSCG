'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { storage } from '@/lib/utils/storage';
import { MeasurementEntry } from '@/types/scg';
import { Activity, Trash2, ChevronRight, Clock, Share2 } from 'lucide-react';

interface MeasurementHistoryProps {
  onSelect: (entry: MeasurementEntry) => void;
  activeId?: string;
}

export default function MeasurementHistory({ onSelect, activeId }: MeasurementHistoryProps) {
    const [items, setItems] = useState<any[]>([]);
  const isMounted = useRef(false);

  const refresh = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const data = await storage.getAllMeasurements();
      // Ensure data is typed correctly or cast if necessary, though storage should handle it
      // Assuming storage returns partial or full objects that match MeasurementEntry
      if (isMounted.current) {
         setItems(data as MeasurementEntry[]); 
      }
    } catch (error) {
      console.error("Failed to load measurements", error);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    void refresh();

    // Listen for storage changes in other tabs
    const handleStorageChange = () => {
        refresh();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for changes in this tab (since we don't have a shared state manager)
    const interval = setInterval(() => {
        refresh();
    }, 2000);
    
    return () => {
      isMounted.current = false;
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [refresh]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
        await storage.deleteMeasurement(id);
        refresh();
    } catch (err) {
        console.error("Failed to delete measurement", err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-xl">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-medium text-slate-400">No recent measurements found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className={`
            group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4
            ${activeId === item.id 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50/50'}
          `}
        >
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${activeId === item.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}
          `}>
            <Activity className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${activeId === item.id ? 'text-blue-100' : 'text-slate-400'}`}>
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className={`text-sm font-black truncate ${activeId === item.id ? 'text-white' : 'text-slate-700'}`}>
              {item.source ? item.source.replace('Test data: ', '').replace('Real-time clinical measurement', 'Measurement') : 'SCG Recording'}
            </p>
            <p className={`text-[11px] font-medium ${activeId === item.id ? 'text-blue-100' : 'text-slate-500'}`}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.data.length} samples
            </p>
          </div>

          <ChevronRight className={`w-5 h-5 transition-transform ${activeId === item.id ? 'text-white' : 'text-slate-300 group-hover:translate-x-1'}`} />
        </div>
      ))}
    </div>
  );
}
