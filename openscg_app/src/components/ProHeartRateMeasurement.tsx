"use client";

/**
 * IMPORTANT: THIS COMPONENT MUST ONLY USE REAL DEVICE DATA
 */
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Heart, Activity, CheckCircle, AlertCircle, PlayCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import Image from "next/image"
import {useIsMobile} from "@/components/ui/use-mobile"
import {useAnalytics} from "@/lib/analytics/AnalyticsProvider"
import {AccelerometerDataPoint, ScgTuple} from "@/types/scg";
import {useMotionSensor} from "@/hooks/useMotionSensor";
import {useScgSocket} from "@/hooks/useScgSocket";

export interface HeartRateMeasurementProps {
    onComplete?: (heartRate: number, rawData?: ScgTuple[]) => void;
    onStart?: () => void;
    onError?: (error: string) => void;
    className?: string;
    onDesktopClick?: () => void;
    durationMs?: number;
    sessionId?: string;
    shareUrl?: string;
}


const ProHeartRateMeasurement: React.FC<HeartRateMeasurementProps> = (
    {
        onComplete,
        onStart,
        onError,
        className = '',
        onDesktopClick,
        durationMs = 60000,
        sessionId,
        shareUrl,
    }) => {
    const isMobile = useIsMobile();
    const { sendData } = useScgSocket(sessionId);
    // State variables
    const [stage, setStage] = useState<'ready' | 'countdown' | 'measuring' | 'complete' | 'error'>('ready');
    const stageRef = useRef(stage); 
    useEffect(() => {
        stageRef.current = stage;
        // When completing, ensure the last frame is drawn for review
        if (stage === 'complete') {
            setTimeout(drawChart, 100);
        }
    }, [stage]);

    const [countdown, setCountdown] = useState(3);
    const [isCounting, setIsCounting] = useState(false);
    const [isIndefinite, setIsIndefinite] = useState(durationMs <= 0);
    const [measurementProgress, setMeasurementProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleSimulate = () => {
            sendRandomTestData();
        };
        document.addEventListener('data-simulate-trigger', handleSimulate);
        return () => document.removeEventListener('data-simulate-trigger', handleSimulate);
    }, []);
    const [chartData, setChartData] = useState<number[]>([]);
    const [hasMotionData, setHasMotionData] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Refs for measurement data
    const dataBufferRef = useRef<ScgTuple[]>([]);
    const lastPeakTimeRef = useRef(0);
    const heartbeatCountRef = useRef(0);
    const chartCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const updateChartTimerRef = useRef<NodeJS.Timeout | null>(null);
    const motionDataReceivedRef = useRef(false);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const analytics = useAnalytics();
    
    // Audio Context Ref for programmatic beeps (Web Audio API)
    const audioContextRef = useRef<AudioContext | null>(null);

    // Refs for the MATLAB-style peak detection algorithm
    const quarterPeriod = 20;
    const zValuesRef = useRef<number[]>([]);
    const deviationAbsSumsRef = useRef<number[]>([]);
    const meanDeviationsRef = useRef<number[]>([]);
    const maxMeanDeviationsLongRef = useRef<number[]>([]);
    const maxMeanDeviationLongRef = useRef<number[]>([]);

    // Buffer for handling duplicate timestamps intelligently
    const duplicateTimestampBuffer = useRef<AccelerometerDataPoint[]>([]);
    const lastUniqueTimestamp = useRef<number>(0);
    const streamBufferRef = useRef<ScgTuple[]>([]);

    const playBeep = useCallback((frequency = 800, duration = 0.1) => {
        try {
            if (!audioContextRef.current) return;
            const ctx = audioContextRef.current;
            if (ctx.state !== 'running') return;

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            // ANALYTIC ENVELOPE (Soft attack to prevent vibration artifacts)
            const attackTime = 0.02;
            gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + attackTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            oscillator.stop(ctx.currentTime + duration);
        } catch (err: unknown) {
            console.error('Error playing beep:', err);
        }
    }, []);

    const cleanupMeasurement = () => {
        if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
        if (updateChartTimerRef.current) clearInterval(updateChartTimerRef.current);
        if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };

    const drawChart = () => {
        const canvas = chartCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        // ScgTuple: [t, ax, ay, az], so az is index 3
        const dataToUse = dataBufferRef.current.length > 0
            ? dataBufferRef.current.slice(-150).map(data => data[3])
            : chartData;
        ctx.fillStyle = 'rgba(10, 10, 20, 0.05)';
        ctx.fillRect(0, 0, width, height);
        let maxVal = Math.max(...dataToUse) * 1.1;
        let minVal = Math.min(...dataToUse) * 0.9;
        const range = maxVal - minVal;
        if (range < 0.5) {
            const avg = (maxVal + minVal) / 2;
            maxVal = avg + 0.5; minVal = avg - 0.5;
        }
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < dataToUse.length; i++) {
            const x = (i / (dataToUse.length - 1)) * width;
            const y = height - ((dataToUse[i] - minVal) / (maxVal - minVal)) * height;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    };

    const completeMeasurement = useCallback(async () => {
        cleanupMeasurement();
        setStage('complete');
        if (onComplete) {
            onComplete(0, dataBufferRef.current);
        }
        playBeep(1200, 0.3);

        // Auto-reset results preview after 7 seconds
        setTimeout(() => {
            if (stageRef.current === 'complete') {
                setStage('ready');
            }
        }, 7000);
    }, [onComplete, playBeep]);

    const startMeasurement = () => {
        setStage('measuring');
        heartbeatCountRef.current = 0;
        zValuesRef.current = [];
        deviationAbsSumsRef.current = [];
        meanDeviationsRef.current = [];
        maxMeanDeviationsLongRef.current = [];
        dataBufferRef.current = [];
        streamBufferRef.current = []; // Explicitly clear stream buffer
        setHasMotionData(false); // Reset motion data flag
        const measurementStartTime = Date.now();

        const animate = () => {
            drawChart();
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animationFrameRef.current = requestAnimationFrame(animate);

        updateChartTimerRef.current = setInterval(() => {
            if (dataBufferRef.current.length > 0) {
                setChartData(dataBufferRef.current.slice(-150).map(data => data[3]));
            }
            if (durationMs > 0) {
                const progress = Math.min(100, ((Date.now() - measurementStartTime) / durationMs) * 100);
                setMeasurementProgress(progress);
            } else {
                // Indefinite progress just scrolls/pulses or shows elapsed time
                const elapsedSec = Math.floor((Date.now() - measurementStartTime) / 1000);
                setMeasurementProgress(elapsedSec); // Reuse for elapsed time display
            }
        }, 50);

        if (durationMs > 0) {
            setTimeout(() => {
                if (stageRef.current === 'measuring') completeMeasurement();
            }, durationMs);
        }
    };

    const detectPeaks = useCallback((currentValue: number, currentTime: number) => {
        const noSearchFlagDuration = 400; 
        zValuesRef.current.push(currentValue);
        if (zValuesRef.current.length > 160) zValuesRef.current.shift();
        if (zValuesRef.current.length < 80) {
            deviationAbsSumsRef.current.push(0);
            meanDeviationsRef.current.push(0);
            maxMeanDeviationsLongRef.current.push(0);
            return;
        }
        if (lastPeakTimeRef.current === 0) lastPeakTimeRef.current = currentTime;
        const timeSinceLastPeak = currentTime - lastPeakTimeRef.current;
        if (timeSinceLastPeak < noSearchFlagDuration) return;

        const meanWindow = zValuesRef.current.slice(-40);
        const windowMean = meanWindow.reduce((a, b) => a + b, 0) / meanWindow.length;
        const deviationWindow = zValuesRef.current.slice(-20);
        const deviationAbsSum = deviationWindow.reduce((sum, val) => sum + Math.abs(val - windowMean), 0);
        
        const tempSums = [...deviationAbsSumsRef.current, deviationAbsSum];
        const smoothedDeviation = tempSums.slice(-60).reduce((a,b)=>a+b,0) / 60;
        deviationAbsSumsRef.current.push(smoothedDeviation);

        const meanDeviation = deviationAbsSumsRef.current.slice(-36).reduce((a,b)=>a+b,0) / 36;
        meanDeviationsRef.current.push(meanDeviation);

        const maxMeanDeviationLong = Math.max(...meanDeviationsRef.current.slice(-80));
        maxMeanDeviationLongRef.current.push(maxMeanDeviationLong);

        const currentSignal = deviationAbsSumsRef.current[deviationAbsSumsRef.current.length - 1];
        const prevSignal = deviationAbsSumsRef.current[deviationAbsSumsRef.current.length - 3];
        const currentThreshold = maxMeanDeviationsLongRef.current[maxMeanDeviationsLongRef.current.length - 1];
        const prevThreshold = maxMeanDeviationsLongRef.current[maxMeanDeviationsLongRef.current.length - 3];

        if (currentSignal > currentThreshold && prevSignal < prevThreshold) {
            lastPeakTimeRef.current = currentTime;
            heartbeatCountRef.current++;
            playBeep(1000, 0.1);
        }
    }, [playBeep]);

    const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
        if (stageRef.current !== 'measuring' || !event.accelerationIncludingGravity) return;
        
        // Performance: Avoid object creation if unnecessary
        const accel = event.accelerationIncludingGravity;
        
        // Normalization: Use performance.now() if event.timeStamp is relative/zero-based
        // or ensure we use a consistent offset.
        // For simplicity and to fix chart stretching, we'll use Date.now() 
        // but since sensors update at 100Hz, we should preserve the relative precision.
        const timestamp = Date.now(); 
        
        // ScgTuple: [t, ax, ay, az]
        const dataPoint: ScgTuple = [timestamp, accel.x || 0, accel.y || 0, accel.z || 0];

        if (!motionDataReceivedRef.current) {
            motionDataReceivedRef.current = true;
            setHasMotionData(true);
        }

        dataBufferRef.current.push(dataPoint);
        streamBufferRef.current.push(dataPoint);
        detectPeaks(dataPoint[3], timestamp);
        
        // Stream data in chunks
        if (streamBufferRef.current.length >= 10) {
            sendData([...streamBufferRef.current]);
            streamBufferRef.current = [];
        }

        if (dataBufferRef.current.length > 2000) dataBufferRef.current.shift();
    }, [detectPeaks, sendData]);

    const { requestPermission } = useMotionSensor(handleDeviceMotion);

    const sendRandomTestData = async () => {
        const fileIndex = Math.floor(Math.random() * 10);
        const fileName = fileIndex === 2 ? 'measurement_3.json' : `measurement_${fileIndex}.json`;
        
        try {
            const response = await fetch(`measurements/${fileName}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const sessionData = await response.json();
            
            // Test files are already in ScgTuple format [t, ax, ay, az]
            const samples: ScgTuple[] = sessionData.samples || [];
            
            if (samples.length === 0) throw new Error("No samples in test file structure");

            // Reset buffers
            dataBufferRef.current = [];
            streamBufferRef.current = [];
            setHasMotionData(true);
            setStage('measuring');
            setIsIndefinite(true);
            
            // Stream data points with a delay to simulate real-time
            let i = 0;
            const simulationStartTime = Date.now();

            const CHUNK_SIZE = 10;
            const streamInterval = setInterval(() => {
                const chunk = samples.slice(i, i + CHUNK_SIZE);
                if (chunk.length === 0) {
                    clearInterval(streamInterval);
                    return;
                }
                
                // Normalize timestamps for simulation to be real-time relative to now
                const now = Date.now();
                const timePassedSinceStart = now - simulationStartTime;

                const normalizedChunk: ScgTuple[] = chunk.map((s, index) => {
                    // Use a synthetic relative offset to ensure smooth, sequential timestamps
                    const pointOffset = timePassedSinceStart + (index * 10); 
                    return [
                        simulationStartTime + pointOffset,
                        s[1], s[2], s[3]
                    ];
                });

                // Update local buffer for visualization
                dataBufferRef.current.push(...normalizedChunk);
                if (dataBufferRef.current.length > 2000) dataBufferRef.current.shift();
                
                // Send to socket
                sendData(normalizedChunk);
                
                i += CHUNK_SIZE;
            }, 100); 

            updateChartTimerRef.current = streamInterval;
            
            const animate = () => {
                drawChart();
                animationFrameRef.current = requestAnimationFrame(animate);
            };
            animationFrameRef.current = requestAnimationFrame(animate);

        } catch (err) {
            console.error("Failed to send test data:", err);
            setErrorMessage("Failed to load test data: " + fileName);
            setStage('error');
        }
    };

    const beginCountdown = async () => {
        // CRITICAL: Request permission FIRST to preserve user gesture context on iOS
        const granted = await requestPermission();
        if (!granted) {
            alert("Motion sensor permission is required.");
            return;
        }

        // Initialize AudioContext on same user gesture
        try {
            if (!audioContextRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            // Play initial silent tone to unlock audio context
            playBeep(440, 0.001);
        } catch (e) {
            console.warn("Audio Context unlock failed:", e);
        }

        if (onStart) onStart();
        setStage('countdown');
        setCountdown(3);
        setIsCounting(true);

        // Explicitly scroll into view to avoid layout shift jumping
        if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    useEffect(() => {
        if (isCounting) {
            if (countdown > 0) {
                countdownTimerRef.current = setTimeout(() => {
                    setCountdown(prev => prev - 1);
                    playBeep(800, 0.1);
                }, 1000);
            } else {
                // Countdown finished
                const timer = setTimeout(() => {
                    setIsCounting(false);
                    startMeasurement();
                }, 0);
                return () => clearTimeout(timer);
            }
        }
        return () => { if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current); };
    }, [countdown, isCounting, playBeep]);

    // Cleanup audio context on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);
            }
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className={`flex flex-col items-center justify-center w-full max-w-lg mx-auto rounded-xl p-6 transition-all duration-500 ${className}`}
        >
            {stage === 'ready' && (
                <div className="flex flex-col items-center space-y-6 text-center w-full max-w-sm mx-auto">
                    <div className="relative w-full aspect-square max-h-[300px] mb-2 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden group">
                        <Image 
                            src="/images/boy.webp" 
                            alt="Instruction: Place phone vertically in middle of chest or horizontally under left breast" 
                            fill
                            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                        <div className="absolute top-4 right-4 flex gap-2">
                             <div className="w-10 h-10 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-600" />
                             </div>
                        </div>
                        <Heart className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 text-red-500 animate-pulse drop-shadow-lg"/>
                    </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Measurement Instruction</h3>
                <p className="text-sm text-slate-500 leading-relaxed px-2">
                    Place your phone firmly on your chest as shown above. Lie down flat for 60 seconds during measurement.
                </p>
            </div>

            {shareUrl && (
                <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center relative overflow-hidden">
                    <p className="text-[9px] text-slate-400 mb-2 font-bold uppercase tracking-widest relative z-10">
                        Share real-time stream:
                    </p>
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 relative z-10">
                        <div className="flex-1 px-3 py-1.5 text-primary text-[9px] font-bold truncate select-all text-left">
                            {shareUrl}
                        </div>
                        <button 
                            onClick={(e) => { 
                                navigator.clipboard.writeText(shareUrl); 
                                const target = e.currentTarget as HTMLButtonElement;
                                if (target) {
                                    const originalText = target.innerText;
                                    target.innerText = 'OK';
                                    setTimeout(() => target.innerText = originalText, 2000);
                                }
                            }}
                            className="bg-slate-900 text-white text-[9px] px-3 py-1.5 rounded-lg hover:bg-primary font-bold transition-all shrink-0 uppercase tracking-widest"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 w-full">
                <Button 
                    onClick={() => { 
                        setIsIndefinite(false);
                        if (isMobile) beginCountdown(); 
                        else if (onDesktopClick) onDesktopClick(); 
                    }} 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-16 text-lg rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                >
                    Start 60s Session
                </Button>
                
                <Button 
                    onClick={() => { 
                        setIsIndefinite(true);
                        if (isMobile) beginCountdown(); 
                        else if (onDesktopClick) onDesktopClick(); 
                    }} 
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 font-bold h-12 rounded-xl hover:bg-blue-50 transition-all"
                >
                    Monitoring Mode
                </Button>

                <Button 
                    onClick={sendRandomTestData}
                    variant="ghost"
                    className="w-full text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-blue-500 flex items-center justify-center gap-2 py-4"
                >
                    <PlayCircle className="w-4 h-4" />
                    Try with Example Data
                </Button>
            </div>
        </div>
            )}
            {stage === 'countdown' && (
                <div className="relative flex flex-col items-center justify-center py-12">
                    <Image src="/images/boy.webp" alt="" width={300} height={300} className="absolute opacity-10" />
                    <p className="text-lg font-bold text-slate-400 mb-6 z-10 uppercase tracking-widest">Get Ready</p>
                    <div className="text-8xl font-black text-blue-600 mb-4 z-10 tabular-nums">{countdown}</div>
                    <p className="text-slate-500 z-10 font-medium">Position phone now</p>
                </div>
            )}
            {stage === 'measuring' && (
                <div className="flex flex-col items-center space-y-6 w-full">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 text-xs font-bold uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        Measuring...
                    </div>
                    <div className="w-full h-44 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 relative">
                        <canvas ref={chartCanvasRef} className="w-full h-full absolute inset-0 opacity-70" />
                        {!hasMotionData && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium text-sm">Awaiting motion data...</div>
                        )}
                    </div>
                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{isIndefinite ? 'Elapsed Time' : 'Capture Progress'}</span>
                            <span>{isIndefinite ? `${measurementProgress}s` : `${Math.round(measurementProgress)}%`}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div 
                                className={`h-full bg-blue-600 transition-all duration-300 ease-out ${isIndefinite ? 'w-full animate-pulse opacity-60' : ''}`} 
                                style={!isIndefinite ? {width: `${measurementProgress}%`} : {}}
                            ></div>
                        </div>
                    </div>
                    <Button 
                        onClick={completeMeasurement} 
                        variant="destructive" 
                        className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-red-100"
                    >
                        Stop Recording
                    </Button>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Stay Still and Breathe Normally</p>
                </div>
            )}
            {stage === 'complete' && (
                <div className="flex flex-col items-center space-y-6 text-center py-4 w-full">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-10 h-10 text-green-500"/>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Capture Verified</h3>
                            <p className="text-slate-500 text-xs">Data saved locally and synced to cloud.</p>
                        </div>
                    </div>

                    <div className="w-full h-44 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 relative opacity-60 grayscale-[0.5]">
                        <canvas ref={chartCanvasRef} className="w-full h-full absolute inset-0" />
                        <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
                            <span className="bg-white/80 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase">Review Mode</span>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <Button onClick={() => setStage('ready')} variant="outline" className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">New Measurement</Button>
                    </div>
                </div>
            )}
            {stage === 'error' && (
                <div className="flex flex-col items-center space-y-6 text-center py-4">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-2"/>
                    <h3 className="text-xl font-bold text-slate-800">Telemetry Error</h3>
                    <p className="text-slate-500 text-sm px-4">{errorMessage}</p>
                    <Button onClick={() => setStage('ready')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl mt-4 shadow-md shadow-blue-100">Retry Capture</Button>
                </div>
            )}
        </div>
    );
};

export default ProHeartRateMeasurement;
