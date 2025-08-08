import { useEffect, useState, useRef } from 'react';

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

// Linear interpolation function
const interpolate = (samples: Sample[], rate: number): WaveformData => {
    if (samples.length < 2) {
        return { t: samples.map(s => s.t), az: samples.map(s => s.az) };
    }

    const newT: number[] = [];
    const newAz: number[] = [];
    const interval = 1000 / rate;

    let lastSample = samples[0];

    for (let i = 1; i < samples.length; i++) {
        const currentSample = samples[i];
        const t1 = lastSample.t;
        const t2 = currentSample.t;
        const az1 = lastSample.az;
        const az2 = currentSample.az;

        if (t2 <= t1) { // Skip duplicate or out-of-order timestamps
            continue;
        }

        let t = Math.ceil(t1 / interval) * interval;

        while (t < t2) {
            const ratio = (t - t1) / (t2 - t1);
            const interpolatedAz = az1 + ratio * (az2 - az1);
            newT.push(t);
            newAz.push(interpolatedAz);
            t += interval;
        }
        lastSample = currentSample;
    }

    return { t: newT, az: newAz };
};


export const useScgSocket = (sessionId: string) => {
    const [status, setStatus] = useState('Connecting...');
    const [fullData, setFullData] = useState<WaveformData>({ t: [], az: [] });
    const lastSampleRef = useRef<Sample | null>(null);

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
                        const samplesToInterpolate = lastSampleRef.current ? [lastSampleRef.current, ...newSamples] : newSamples;
                        const interpolated = interpolate(samplesToInterpolate, INTERPOLATION_RATE);
                        
                        setFullData(prevData => ({
                            t: [...prevData.t, ...interpolated.t],
                            az: [...prevData.az, ...interpolated.az],
                        }));

                        lastSampleRef.current = newSamples[newSamples.length - 1];
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
