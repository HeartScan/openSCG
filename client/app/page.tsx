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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 font-sans bg-gray-900 text-white">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-2">OpenSCG</h1>
        <p className="text-lg text-gray-400 mb-8">Live Heart Signal Sharing</p>
        
        {session && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Your Session is Ready</h2>
            <p className="text-gray-400 mb-4">Share this link with your clinician to start.</p>
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/view/${session.sessionId}`}
              className="w-full p-3 font-mono text-sm bg-gray-700 border border-gray-600 rounded-lg text-center text-gray-200"
            />
            
            {!isMeasuring && (
              <button
                onClick={requestPermissionAndStart}
                className="mt-6 w-full px-4 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Measurement
              </button>
            )}
          </div>
        )}

        {isMeasuring && (
          <div className="mt-8">
            {countdown > 0 ? (
              <div className="flex flex-col items-center">
                <p className="text-2xl mb-4">Get Ready...</p>
                <p className="text-8xl font-bold text-green-400">{countdown}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-3xl font-bold text-red-500 animate-pulse mb-2">Recording...</p>
                <p className="text-gray-400">Keep the device steady on your chest.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
