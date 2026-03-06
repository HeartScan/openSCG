"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Monitor, ChevronRight, ShieldCheck, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function DesktopMobileBridge({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.origin);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-primary">
               <Smartphone className="w-8 h-8" />
               <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
               <Monitor className="w-8 h-8 text-slate-500" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight uppercase italic leading-none">
              Mobile Sensor <br /><span className="text-primary text-4xl">Required</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-lg font-medium mt-4">
              OpenSCG.org utilizes high-fidelity MEMS accelerometers built into your smartphone to capture cardiac vibrations.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 bg-white space-y-8">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
            {url && (
              <div className="bg-white p-4 rounded-2xl shadow-xl mb-4 border border-slate-100">
                <QRCodeSVG value={url} size={180} level="H" includeMargin={false} />
              </div>
            )}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scan to open on mobile</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Clinical Precision</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Desktop hardware lacks the inertial sensors required for seismocardiography.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Real-time Sync</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Once opened on your phone, you can share a live dashboard back to this screen.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            I UNDERSTAND
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
