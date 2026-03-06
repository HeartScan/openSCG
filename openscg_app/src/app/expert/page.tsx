'use client';

import LabelingDashboard from '@/components/LabelingDashboard';

export default function ExpertPage() {
  return (
    <main className="flex h-screen flex-col items-center overflow-hidden">
      <div className="z-[100] w-full flex items-center justify-between p-4 bg-gray-900 text-white shadow-xl shrink-0">
        <h1 className="text-2xl font-bold">HeartScan Specialist Interface</h1>
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-400 font-mono">Expert Mode: ACTIVE</span>
        </div>
      </div>
      
      <div className="flex-1 w-full overflow-hidden relative">
        <LabelingDashboard />
      </div>
    </main>
  );
}
