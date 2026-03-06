import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { AccelerometerDataPoint, ScgDataPayload, ScgTuple } from '@/types/scg';

export const useScgSocket = (sessionId?: string, onData?: (data: ScgTuple[]) => void) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        // Connect with fallback transports and explicit path
        // We use window.location.origin to ensure we connect to the same host over HTTPS
        const socket = io(typeof window !== 'undefined' ? window.location.origin : '', {
            path: '/api/socket',
            query: { sessionId },
            transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Socket.IO connected:', socket.id);
            socket.emit('join-session', sessionId);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error.message);
        });

    socket.on('scg-data', (payload: ScgDataPayload | ScgTuple[] | AccelerometerDataPoint[]) => {
        // Handle both legacy ScgDataPayload and the reality of raw array transmission
        if (Array.isArray(payload)) {
            if (onData) {
                // Map legacy AccelerometerDataPoint[] to ScgTuple[] if needed
                if (payload.length > 0 && !Array.isArray(payload[0]) && typeof payload[0] === 'object' && 'timestamp' in payload[0]) {
                    const legacyPoints = payload as AccelerometerDataPoint[];
                    onData(legacyPoints.map(p => [p.timestamp, p.ax, p.ay, p.az]));
                } else {
                    onData(payload as ScgTuple[]);
                }
            }
        } else if (payload && payload.data) {
            if (onData) onData(payload.data);
        }
    });

        socketRef.current = socket;

        return () => {
            if (socket.connected) {
                socket.emit('leave-session', sessionId);
            }
            socket.disconnect();
            socketRef.current = null;
        };
    }, [sessionId, onData]);

    const sendData = useCallback((data: ScgTuple[]) => {
        const socket = socketRef.current;
        if (socket && socket.connected) {
            socket.emit('scg-data', { sessionId, data });
        } else {
            // Log warning if trying to send while disconnected
            console.warn('Socket not connected, skipping data send');
        }
    }, [sessionId]);

    return { sendData };
};
