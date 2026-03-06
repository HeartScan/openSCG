"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProHeartRateMeasurement from '@/components/ProHeartRateMeasurement';
import MeasurementHistory from '@/components/MeasurementHistory';
import SignalViewer from '@/components/SignalViewer';
import { Activity, X, Share2, Trash2, ChevronDown, ChevronUp, Github, ExternalLink, PlayCircle, ShieldCheck } from 'lucide-react';
import { storage } from '@/lib/utils/storage';
import { ScgTuple, MeasurementEntry } from '@/types/scg';
import { useSessionSync } from '@/hooks/useSessionSync';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { ScienceHubEntry } from '@/components/ScienceHubEntry';
import { ScienceHeader } from '@/components/ScienceHeader';
import { ScienceFooter } from '@/components/ScienceFooter';
import { DesktopMobileBridge } from '@/components/DesktopMobileBridge';
import { useIsMobile } from '@/components/ui/use-mobile';

export default function HomePage() {
    // Generate session ID immediately (client-side specific for now)
    const [sessionId] = useState<string>(() => uuidv4());
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementEntry | null>(null);
    const [isBridgeOpen, setIsBridgeOpen] = useState(false);
    const { ensureSynced, isSyncing } = useSessionSync();
    const isMobile = useIsMobile();

    useEffect(() => {
        // Construct share URL client-side
        if (typeof window !== 'undefined') {
            const url = `${window.location.origin}/view/${sessionId}`;
            setTimeout(() => setShareUrl(url), 0);
        }
    }, [sessionId]);

    const handleComplete = async (heartRate: number, rawData?: ScgTuple[]) => {
        if (!rawData || !sessionId) return;

        // ScgTuple: [timestamp, ax, ay, az]
        const startTime = rawData.length > 0 ? rawData[0][0] : 0;
        const endTime = rawData.length > 0 ? rawData[rawData.length - 1][0] : 0;
        const duration = endTime - startTime;

        try {
            // 1. Save locally (offline-first)
            await storage.saveMeasurement({
                id: sessionId,
                timestamp: Date.now(),
                data: rawData,
                duration,
                synced: false // Initially not synced (or assume streamed)
            });

            console.log('Measurement saved locally', sessionId);
        } catch (e) {
            console.error('Failed to save measurement', e);
        }
    };

    const handleShare = useCallback(async () => {
        if (!selectedMeasurement) return;
        
        const url = await ensureSynced(selectedMeasurement);
        if (url) {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'OpenSCG Heart Recording',
                        text: `Review this SCG measurement from ${new Date(selectedMeasurement.timestamp).toLocaleString()}`,
                        url: url,
                    });
                } catch (e) {
                    await navigator.clipboard.writeText(url);
                    alert("Link copied to clipboard!");
                }
            } else {
                await navigator.clipboard.writeText(url);
                alert("Link copied to clipboard!");
            }
        }
    }, [selectedMeasurement, ensureSynced]);

    const handleDelete = useCallback(async () => {
        if (!selectedMeasurement) return;
        if (confirm("Are you sure you want to delete this recording?")) {
            await storage.deleteMeasurement(selectedMeasurement.id);
            setSelectedMeasurement(null);
        }
    }, [selectedMeasurement]);

    if (!sessionId) return <div className="flex items-center justify-center h-screen font-bold text-slate-400">Initializing Session...</div>;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/30">
            <ScienceHeader />
            
            <main className="flex-grow container mx-auto p-4 flex flex-col items-center">
                <div className="max-w-4xl w-full flex flex-col items-center py-12 md:py-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 tracking-tight">
                        OpenSCG
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                        High-fidelity cardiomechanical signal acquisition powered by smartphone MEMS technology.
                    </p>
                    <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-md">
                        Data is stored locally on your device. For sharing, an anonymous cache is kept on the server for 30 days.
                    </p>
                </div>
                
                <div className="w-full max-w-md mb-12">
                    <ProHeartRateMeasurement 
                        sessionId={sessionId}
                        onComplete={handleComplete}
                        onError={(err) => alert(err)}
                        shareUrl={shareUrl || ''}
                        onDesktopClick={() => setIsBridgeOpen(true)}
                    />
                </div>

                <ScienceHubEntry />

                <div className="w-full max-w-md mt-16 mb-20">
                    <div className="flex items-center gap-3 mb-6 px-4">
                        <div className="w-1 h-5 bg-primary/50 rounded-full" />
                        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Clinical Logs</h2>
                    </div>
                    <MeasurementHistory onSelect={(item) => setSelectedMeasurement(item)} />
                </div>

                {/* Collaboration Section */}
                <section className="w-full bg-white border-y border-slate-100 py-24 px-4 mt-16">
                   <div className="max-w-3xl mx-auto text-center space-y-8">
                     <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                       <ShieldCheck className="w-4 h-4 text-primary" /> Open Source Standards
                     </div>
                     <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Open Research & Collaboration</h2>
                     <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
                       OpenSCG.org is an open-source initiative. We welcome collaboration with academic institutions, clinical research organizations, and independent developers.
                     </p>
                     <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                       <a href="https://github.com/HeartScan/openSCG" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary transition-all shadow-lg active:scale-[0.98] tracking-wide text-sm">
                         <Github className="w-5 h-5" />
                         View GitHub Repository
                       </a>
                       <Link href="/science" className="inline-flex items-center gap-2 font-bold text-primary hover:underline underline-offset-8 decoration-2 tracking-wide text-sm">
                         Scientific Foundation <ExternalLink className="w-4 h-4" />
                       </Link>
                     </div>
                   </div>
                </section>
            </main>

            <ScienceFooter />

            <DesktopMobileBridge isOpen={isBridgeOpen} onClose={() => setIsBridgeOpen(false)} />

            {/* Historical Data Viewer Modal */}
            {selectedMeasurement && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-white sticky top-0 z-10">
                            <button 
                                onClick={handleShare}
                                disabled={isSyncing}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-slate-200 text-primary-foreground px-4 py-2 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all active:scale-[0.98] shrink-0"
                            >
                                {isSyncing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Share2 className="w-4 h-4" />
                                )}
                                {isSyncing ? 'Syncing...' : 'Share'}
                            </button>
                            
                            <button 
                                onClick={handleDelete}
                                className="w-10 h-10 border border-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-xl flex items-center justify-center text-slate-300 transition-all shrink-0"
                                title="Delete recording"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <button 
                                onClick={() => setSelectedMeasurement(null)}
                                className="w-10 h-10 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-all active:scale-90 shrink-0"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 min-h-0 bg-white p-4">
                            <div className="h-full rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-inner">
                                <SignalViewer 
                                    timestamp={selectedMeasurement.timestamp}
                                    initialData={[
                                        selectedMeasurement.data.map(d => d[0]), // t
                                        selectedMeasurement.data.map(d => d[3])  // az
                                    ]} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
