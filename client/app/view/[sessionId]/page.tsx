"use client";

import { useEffect, useState, useRef } from 'react';
import Plot from 'react-plotly.js';

// Dynamically import Plotly to avoid SSR issues
import dynamic from 'next/dynamic';
const DynamicPlot = dynamic(() => import('react-plotly.js'), { ssr: false });


interface InterpolatedSample {
    t: number;
    az: number;
}

const SessionViewer = ({ params }: { params: { sessionId: string } }) => {
    const { sessionId } = params;
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [status, setStatus] = useState('Connecting...');
    const [chartData, setChartData] = useState<{ t: number[], az: number[] }>({ t: [], az: [] });
    const maxChartPoints = 500; // Display last 5 seconds of data (500 points at 100Hz)

    useEffect(() => {
        const wsUrl = `ws://localhost:8000/ws/${sessionId}`;
        const newSocket = new WebSocket(wsUrl);

        newSocket.onopen = () => setStatus('Live');
        newSocket.onclose = () => setStatus('Disconnected');
        newSocket.onerror = () => setStatus('Error');

        newSocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'interpolated_batch' && message.payload.interpolatedSamples) {
                    const newSamples: InterpolatedSample[] = message.payload.interpolatedSamples;
                    
                    setChartData(prevData => {
                        const newT = [...prevData.t, ...newSamples.map(s => s.t)];
                        const newAz = [...prevData.az, ...newSamples.map(s => s.az)];

                        // Keep the chart data from growing indefinitely
                        if (newT.length > maxChartPoints) {
                            return {
                                t: newT.slice(newT.length - maxChartPoints),
                                az: newAz.slice(newAz.length - maxChartPoints),
                            };
                        }
                        return { t: newT, az: newAz };
                    });
                }
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [sessionId]);

    return (
        <main className="flex min-h-screen flex-col items-center p-8 font-sans bg-gray-900 text-white">
            <div className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold text-center mb-2">OpenSCG Viewer</h1>
                <p className="text-center font-mono text-sm text-gray-400 mb-6">Session ID: {sessionId}</p>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Live Waveform</h2>
                        <p>Status: <span className={status === 'Live' ? 'text-green-400' : 'text-red-400'}>{status}</span></p>
                    </div>
                    
                    <div className="bg-gray-900 rounded-md p-2">
                        <DynamicPlot
                            data={[
                                {
                                    x: chartData.t,
                                    y: chartData.az,
                                    type: 'scatter',
                                    mode: 'lines',
                                    marker: { color: '#10B981' },
                                },
                            ]}
                            layout={{
                                plot_bgcolor: '#111827',
                                paper_bgcolor: '#111827',
                                font: { color: '#E5E7EB' },
                                xaxis: { title: 'Time (ms)', gridcolor: '#374151' },
                                yaxis: { title: 'AZ Axis', gridcolor: '#374151' },
                                margin: { l: 50, r: 20, b: 40, t: 20, pad: 4 }
                            }}
                            config={{ responsive: true }}
                            className="w-full h-96"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SessionViewer;
