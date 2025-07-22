import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface WaveformData {
    t: number[];
    az: number[];
}

export const useScgSocket = (sessionId: string) => {
    const [status, setStatus] = useState('Connecting...');
    const [fullData, setFullData] = useState<WaveformData>({ t: [], az: [] });

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
                if (message.type === 'interpolated_batch' && message.payload.interpolatedSamples) {
                    const newSamples = message.payload.interpolatedSamples;
                    setFullData(prevData => ({
                        t: [...prevData.t, ...newSamples.map((s: any) => s.t)],
                        az: [...prevData.az, ...newSamples.map((s: any) => s.az)],
                    }));
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
