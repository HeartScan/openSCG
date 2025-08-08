import { useEffect, useState, useRef } from 'react';
import Spline from 'cubic-spline';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const INTERPOLATION_RATE = 100; // Hz

interface Sample {
    t: number;
    az: number;
}

interface WaveformData {
    t: number[];
    az: number[];
}

export const useScgSocket = (sessionId: string) => {
    const [status, setStatus] = useState('Connecting...');
    const [fullData, setFullData] = useState<WaveformData>({ t: [], az: [] });
    const sampleBufferRef = useRef<Sample[]>([]);

    useEffect(() => {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${wsProtocol}//${API_BASE_URL.replace(/^https?:\/\//, '')}/ws/${sessionId}`;
        const newSocket = new WebSocket(wsUrl);

        newSocket.onopen = () => setStatus('Live');
        newSocket.onclose = () => setStatus('Disconnected');
        newSocket.onerror = () => setStatus('Error');

        newSocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'samples_batch' && message.payload.samples) {
                    const newSamples: Sample[] = message.payload.samples.map((s: any) => ({ t: s.t, az: s.az }));
                    
                    if (newSamples.length > 0) {
                        sampleBufferRef.current.push(...newSamples);

                        // Process buffer if it has enough points
                        if (sampleBufferRef.current.length > 2) {
                            // Sort buffer by timestamp to ensure order
                            sampleBufferRef.current.sort((a, b) => a.t - b.t);

                            const timestamps = sampleBufferRef.current.map(s => s.t);
                            const azValues = sampleBufferRef.current.map(s => s.az);

                            const spline = new Spline(timestamps, azValues);
                            
                            const first = sampleBufferRef.current[0].t;
                            const last = sampleBufferRef.current[sampleBufferRef.current.length - 1].t;
                            const interval = 1000 / INTERPOLATION_RATE;

                            const interpolatedT: number[] = [];
                            const interpolatedAz: number[] = [];

                            for (let t = first; t <= last; t += interval) {
                                interpolatedT.push(t);
                                interpolatedAz.push(spline.at(t));
                            }

                            setFullData(prevData => ({
                                t: [...prevData.t, ...interpolatedT],
                                az: [...prevData.az, ...interpolatedAz],
                            }));

                            // Keep the last few samples for the next batch to ensure continuity
                            sampleBufferRef.current = sampleBufferRef.current.slice(-2);
                        }
                    }
                } else if (message.type === 'session_ended') {
                    setStatus('Ended');
                    newSocket.close();
                }
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };

        return () => {
            newSocket.close();
        };
    }, [sessionId]);

    return { status, fullData };
};
