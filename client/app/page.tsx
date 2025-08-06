"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import RealTimeChart from "./components/patient/RealTimeChart";
import getApiBaseUrl from "./utils/getApiBaseUrl";

interface SessionData {
  sessionId: string;
  viewerUrl: string;
  websocketUrl: string;
  createdAt: string;
  status: 'created' | 'active' | 'ended';
}

interface AccelerometerDataPoint {
    ax: number;
    ay: number;
    az: number;
    t: number;
}

export default function Home() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("");
  
  const dataBufferRef = useRef<AccelerometerDataPoint[]>([]);
  const latestAzRef = useRef<number>(0);
  const socketRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastTimestampRef = useRef<number>(0);
  const duplicateTimestampBufferRef = useRef<number[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const url = await getApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
        setApiBaseUrl(url);

        const response = await fetch(`${url}/api/v1/sessions`, { method: "POST" });
        if (!response.ok) throw new Error("Failed to create session");
        const data: SessionData = await response.json();
        setSession(data);
      } catch (error) {
        console.error("Error initializing session:", error);
        setError("Failed to connect to the backend. Please check the server.");
      }
    };
    initialize();
  }, []);

  const startMeasurement = () => {
    if (!apiBaseUrl || !session) return;
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${apiBaseUrl.replace(/^https?:\/\//, '')}${session.websocketUrl}`;
    const newSocket = new WebSocket(wsUrl);
    socketRef.current = newSocket;

    newSocket.onopen = () => {
      console.log("WebSocket Connected");
      setError(null);
      window.addEventListener('devicemotion', handleDeviceMotion);
    };

    newSocket.onclose = () => {
      console.log("WebSocket Disconnected");
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };

    newSocket.onerror = () => {
      setError("WebSocket connection failed. Please try again.");
    };
    
    const sendIntervalId = setInterval(() => {
        if (dataBufferRef.current.length > 0) {
            const payload = {
                type: "samples_batch",
                payload: { samples: dataBufferRef.current }
            };
            newSocket.send(JSON.stringify(payload));
            if (audioRef.current) {
                audioRef.current.play();
            }
            dataBufferRef.current = [];
        }
    }, 1000);

    const chartUpdateIntervalId = setInterval(() => {
        setChartData((prev: number[]) => [...prev, latestAzRef.current].slice(-200));
    }, 50);

    return () => {
        clearInterval(sendIntervalId);
        clearInterval(chartUpdateIntervalId);
        newSocket.close();
    };
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;
    const { x, y, z } = event.accelerationIncludingGravity;
    let timestamp = event.timeStamp;

    if (timestamp === lastTimestampRef.current) {
      duplicateTimestampBufferRef.current.push(timestamp);
      const estimatedInterval = 10; // Assuming 100Hz, so 10ms interval
      timestamp += (estimatedInterval / (duplicateTimestampBufferRef.current.length + 1));
    } else {
      lastTimestampRef.current = timestamp;
      duplicateTimestampBufferRef.current = [];
    }

    const dataPoint: AccelerometerDataPoint = {
      ax: x || 0,
      ay: y || 0,
      az: z || 0,
      t: timestamp,
    };
    dataBufferRef.current.push(dataPoint);
    latestAzRef.current = z || 0;
  };

  const stopMeasurement = async () => {
    setIsMeasuring(false);
    if (socketRef.current) {
        socketRef.current.close();
    }
    if (session) {
        try {
            await fetch(`${apiBaseUrl}/api/v1/sessions/${session.sessionId}/end`, { method: "POST" });
        } catch (error) {
            console.error("Error ending session:", error);
        }
    }
  };

  const shareSession = () => {
    const url = `${window.location.origin}${session!.viewerUrl}`;
    if (navigator.share) {
      navigator.share({
        title: 'OpenSCG Session',
        text: 'Join my OpenSCG session to view my heart signal in real-time.',
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Session link copied to clipboard!');
    }
  };

  const requestPermissionAndStart = async () => {
    if (audioRef.current) {
        audioRef.current.play();
        audioRef.current.pause();
    }
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
        setCountdown((prev: number) => prev - 1);
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
        <header className="mb-8">
          <h1 className="text-5xl font-bold mb-2">OpenSCG</h1>
          <p className="text-xl text-gray-400">Live Heart Signal Sharing</p>
        </header>

        <div className="mb-8 p-6 bg-gray-800 rounded-xl shadow-lg">
          <p className="text-gray-300">
            This is an open-source project for real-time seismocardiography (SCG) signal acquisition and streaming.
            You can find more information and contribute on{' '}
            <a
              href="https://github.com/HeartScan/openSCG"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>

        {error && (
          <div className="bg-red-800 p-4 rounded-lg mb-4">
            <p className="text-white font-bold">{error}</p>
          </div>
        )}
        
        {session && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Your Session is Ready</h2>
            <p className="text-gray-400 mb-4">Share this link with your clinician to start.</p>
            <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${session.viewerUrl}`}
                  className="w-full p-3 font-mono text-sm bg-gray-700 border border-gray-600 rounded-lg text-center text-gray-200"
                />
                <button
                    onClick={shareSession}
                    className="px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Share
                </button>
            </div>
            
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
                <div className="w-full h-40 mt-4">
                  <RealTimeChart azData={chartData} />
                </div>
              </div>
            )}
            <button
              onClick={stopMeasurement}
              className="mt-6 w-full px-4 py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Measurement
            </button>
          </div>
        )}
        <audio ref={audioRef} src="/heartbeat.mp3" />
      </div>
    </main>
  );
}
