import { useEffect, useState, useRef } from 'react';
const Spline = require('cubic-spline');

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
        let socket: WebSocket | null = null;

        const fetchSession = async () => {
            try {
                const sessionRes = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}`);
                if (!sessionRes.ok) {
                    throw new Error('Session not found');
                }
                const session = await sessionRes.json();

                if (session.status === 'ended') {
                    setStatus('Ended');
                    const dataRes = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}/data`);
                    const data = await dataRes.json();
                    if (data.samples) {
                        const timestamps = data.samples.map((s: Sample) => s.t);
                        const azValues = data.samples.map((s: Sample) => s.az);
                        const spline = new Spline(timestamps, azValues);
                        const first = timestamps[0];
                        const last = timestamps[timestamps.length - 1];
                        const interval = 1000 / INTERPOLATION_RATE;
                        const interpolatedT: number[] = [];
                        const interpolatedAz: number[] = [];
                        for (let t = first; t <= last; t += interval) {
                            interpolatedT.push(t);
                            interpolatedAz.push(spline.at(t));
                        }
                        setFullData({ t: interpolatedT, az: interpolatedAz });
                    }
                } else {
                    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                    const wsUrl = `${wsProtocol}//${API_BASE_URL.replace(/^https?:\/\//, '')}/ws/${sessionId}`;
                    socket = new WebSocket(wsUrl);

                    socket.onopen = () => setStatus('Live');
                    socket.onclose = () => setStatus('Disconnected');
                    socket.onerror = () => setStatus('Error');

                    socket.onmessage = (event) => {
                        try {
                            const message = JSON.parse(event.data);

                            if (message.type === 'samples_batch' && message.payload.samples) {
                                const newSamples: Sample[] = message.payload.samples.map((s: any) => ({ t: s.t, az: s.az }));
                                
                                if (newSamples.length > 0) {
                                    sampleBufferRef.current.push(...newSamples);

                                    if (sampleBufferRef.current.length > 2) {
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

                                        sampleBufferRef.current = sampleBufferRef.current.slice(-2);
                                    }
                                }
                            } else if (message.type === 'session_ended') {
                                setStatus('Ended');
                                socket?.close();
                            }
                        } catch (error) {
                            console.error("Failed to parse WebSocket message:", error);
                        }
                    };
                }
            } catch (error) {
                setStatus('Error');
                console.error("Failed to fetch session:", error);
            }
        };

        fetchSession();

        return () => {
            socket?.close();
        };
    }, [sessionId]);

    return { status, fullData };
};
