'use client';

import React from 'react';
import { Smartphone, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface MobileOnlyErrorProps {
  onClose: () => void;
}

export default function MobileOnlyError({ onClose }: MobileOnlyErrorProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-2">
      <div className="relative w-24 h-24 mb-2">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="relative bg-white rounded-3xl p-5 border border-slate-200 shadow-lg">
          <Smartphone className="w-14 h-14 text-blue-500" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
             <X className="w-4 h-4 text-white font-bold" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Mobile Access Required</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
          Clinical heart rhythm analysis requires smartphone telemetry to capture cardiac micro-vibrations with high fidelity.
        </p>
      </div>

      <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 justify-center">
          <Info className="w-4 h-4 text-blue-500" />
          How to perform measurement
        </div>
        
        <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-md">
          <Image 
            src="/images/boy.webp" 
            alt="Phone placement illustration" 
            fill 
            className="object-cover"
          />
        </div>
        
        <p className="text-xs text-slate-400 italic">
          Open this page on your smartphone and place it firmly on your chest as shown above.
        </p>
      </div>

      <Button 
        onClick={onClose}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl shadow-md shadow-blue-100 font-bold transition-all"
      >
        Acknowledge
      </Button>
    </div>
  );
}
