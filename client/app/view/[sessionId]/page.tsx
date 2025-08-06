"use client";

import { useState } from 'react';
import { useScgSocket } from '../../hooks/useScgSocket';
import { CommonView } from '../../components/viewer/CommonView';
import { ZoomedView } from '../../components/viewer/ZoomedView';

const SessionViewer = ({ params }: { params: { sessionId: string } }) => {
    const { sessionId } = params;
    const { status, fullData } = useScgSocket(sessionId);
    const [viewMode, setViewMode] = useState<'common' | 'zoomed'>('common');

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 font-sans bg-gray-900 text-white">
            <div className="w-full max-w-7xl mx-auto">
                <div className="text-center mb-4">
                    <h1 className="text-4xl font-bold">OpenSCG Viewer</h1>
                    <p className="text-lg text-gray-400 mt-2">Session ID: <span className="font-mono text-gray-300">{sessionId}</span></p>
                </div>

                <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-2xl font-semibold">Live Waveform</h2>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setViewMode(viewMode === 'common' ? 'zoomed' : 'common')}
                                className="px-4 py-2 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                {viewMode === 'common' ? 'Switch to Zoomed Mode' : 'Switch to Common Mode'}
                            </button>
                            <div className="flex items-center space-x-2">
                                <span className={`h-3 w-3 rounded-full ${status === 'Live' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                <p className="font-medium">{status}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {viewMode === 'common' ? (
                            <CommonView fullData={fullData} />
                        ) : (
                            <ZoomedView fullData={fullData} />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SessionViewer;
