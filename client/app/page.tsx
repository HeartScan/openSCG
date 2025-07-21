"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SessionData {
  sessionId: string;
  viewerUrl: string;
  websocketUrl: string;
  createdAt: string;
}

interface AccelerometerDataPoint {
    ax: number;
    ay: number;
    az: number;
    t: number;
}

export default function Home() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const dataBufferRef = useRef<AccelerometerDataPoint[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Auto-create session on load
  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/sessions`, { method: "POST" });
        if (!response.ok) throw new Error("Failed to create session");
        const data: SessionData = await response.json();
        setSession(data);
      } catch (error) {
        console.error(error);
      }
    };
    createSession();
  }, []);

  const startMeasurement = () => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${API_BASE_URL.replace(/^https?:\/\//, '')}${session!.websocketUrl}`;
    const newSocket = new WebSocket(wsUrl);
    socketRef.current = newSocket;

    newSocket.onopen = () => {
      console.log("WebSocket Connected");
      window.addEventListener('devicemotion', handleDeviceMotion);
    };

    newSocket.onclose = () => {
      console.log("WebSocket Disconnected");
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
    
    const intervalId = setInterval(() => {
        if (dataBufferRef.current.length > 0) {
            const payload = {
                type: "samples_batch",
                payload: { samples: dataBufferRef.current }
            };
            newSocket.send(JSON.stringify(payload));
            dataBufferRef.current = [];
        }
    }, 1000); // Send data every second

    return () => {
        clearInterval(intervalId);
        newSocket.close();
    };
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;
    const { x, y, z } = event.accelerationIncludingGravity;
    const dataPoint: AccelerometerDataPoint = {
      ax: x || 0,
      ay: y || 0,
      az: z || 0,
      t: event.timeStamp,
    };
    dataBufferRef.current.push(dataPoint);
  };

  const requestPermissionAndStart = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      const permission = await (DeviceMotionEvent as any).requestPermission();
      if (permission === 'granted') {
        setIsMeasuring(true);
      } else {
        alert("Motion sensor permission denied.");
      }
    } else {
      setIsMeasuring(true);
    }
  };

  useEffect(() => {
    if (isMeasuring) {
      const countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      if (countdown === 0) {
        clearInterval(countdownInterval);
        startMeasurement();
      }
      return () => clearInterval(countdownInterval);
    }
  }, [isMeasuring, countdown]);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 font-sans bg-gray-900 text-white">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8">OpenSCG Patient Client</h1>
        
        {session && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">Your Session is Ready</h2>
            <p className="mb-4">Share this link with your clinician:</p>
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/view/${session.sessionId}`}
              className="w-full p-2 font-mono text-sm bg-gray-700 border border-gray-600 rounded"
            />
            
            {!isMeasuring && (
              <button
                onClick={requestPermissionAndStart}
                className="mt-6 w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Start Measurement
              </button>
            )}
          </div>
        )}

        {isMeasuring && (
          <div className="mt-8 text-center">
            {countdown > 0 ? (
              <div>
                <p className="text-xl mb-2">Get Ready...</p>
                <p className="text-7xl font-bold">{countdown}</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-green-400 animate-pulse">Recording...</p>
                <p>Data is being sent to your clinician.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
