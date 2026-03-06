"use client";

import { useRef, useCallback } from 'react';
import { MEASUREMENT_CONFIG } from '@/lib/utils/measurementConfig';

interface PeakDetectorProps {
  onPeakDetected?: (currentTime: number, interval: number) => void;
}

/**
 * Hook to encapsulate the high-precision "MATLAB-style" peak detection algorithm.
 * Fully decoupled from UI and audio feedback.
 */
export const usePeakDetector = ({ onPeakDetected }: PeakDetectorProps = {}) => {
  const quarterPeriod = MEASUREMENT_CONFIG.QUARTER_PERIOD;
  
  // Algorithm internal state buffers
  const zValuesRef = useRef<number[]>([]);
  const deviationAbsSumsRef = useRef<number[]>([]);
  const meanDeviationsRef = useRef<number[]>([]);
  const maxMeanDeviationsLongRef = useRef<number[]>([]);
  
  const lastPeakTimeRef = useRef(0);
  const heartbeatCountRef = useRef(0);
  const peakTimestampsRef = useRef<number[]>([]);

  const resetDetector = useCallback(() => {
    zValuesRef.current = [];
    deviationAbsSumsRef.current = [];
    meanDeviationsRef.current = [];
    maxMeanDeviationsLongRef.current = [];
    lastPeakTimeRef.current = 0;
    heartbeatCountRef.current = 0;
    peakTimestampsRef.current = [];
  }, []);

  const detectPeaks = useCallback((currentValue: number, currentTime: number) => {
    // Refractory period: minimum time between detections to prevent "rattling"
    const noSearchFlagDuration = MEASUREMENT_CONFIG.MIN_PEAK_INTERVAL;
    
    zValuesRef.current.push(currentValue);
    
    // Circular buffer management
    if (zValuesRef.current.length > 8 * quarterPeriod) {
      zValuesRef.current.shift();
    }
    
    // Need minimum samples for initial mean/deviation calculation
    if (zValuesRef.current.length < 4 * quarterPeriod) {
      deviationAbsSumsRef.current.push(0);
      meanDeviationsRef.current.push(0);
      maxMeanDeviationsLongRef.current.push(0);
      return;
    }
    
    if (lastPeakTimeRef.current === 0) {
      lastPeakTimeRef.current = currentTime;
    }
    
    const timeSinceLastPeak = currentTime - lastPeakTimeRef.current;
    if (timeSinceLastPeak < noSearchFlagDuration) {
      return;
    }
    
    // MATLAB Logic Port:
    // 1. Calculate window mean
    const meanWindow = zValuesRef.current.slice(-2 * quarterPeriod);
    const windowMean = meanWindow.reduce((a, b) => a + b, 0) / meanWindow.length;
    
    // 2. Absolute deviation from mean
    const deviationWindow = zValuesRef.current.slice(-quarterPeriod);
    const deviationAbsSum = deviationWindow.reduce((sum, val) => sum + Math.abs(val - windowMean), 0);
    
    // 3. Smoothed deviation signal
    const tempSums = [...deviationAbsSumsRef.current, deviationAbsSum];
    const smoothingWindow = tempSums.slice(-MEASUREMENT_CONFIG.SMOOTHING_WINDOW);
    const smoothedDeviation = smoothingWindow.reduce((a, b) => a + b, 0) / smoothingWindow.length;
    deviationAbsSumsRef.current.push(smoothedDeviation);
    
    // 4. Mean deviation window (dynamic thresholding)
    const meanDevWindow = deviationAbsSumsRef.current.slice(Math.round(-MEASUREMENT_CONFIG.MEAN_DEV_WINDOW_FACTOR * quarterPeriod));
    const meanDeviation = meanDevWindow.reduce((a, b) => a + b, 0) / meanDevWindow.length;
    meanDeviationsRef.current.push(meanDeviation);
    
    // 5. Max deviation window for peak trigger
    const maxDevWindow = meanDeviationsRef.current.slice(-4 * quarterPeriod);
    const maxMeanDeviationLong = Math.max(...maxDevWindow);
    maxMeanDeviationsLongRef.current.push(maxMeanDeviationLong);
    
    // Trigger condition: current signal crosses dynamic threshold
    const currentSignal = deviationAbsSumsRef.current[deviationAbsSumsRef.current.length - 1];
    const prevSignal = deviationAbsSumsRef.current[deviationAbsSumsRef.current.length - 3];
    const currentThreshold = maxMeanDeviationsLongRef.current[maxMeanDeviationsLongRef.current.length - 1];
    const prevThreshold = maxMeanDeviationsLongRef.current[maxMeanDeviationsLongRef.current.length - 3];
    
    if (currentSignal > currentThreshold && prevSignal < prevThreshold) {
      lastPeakTimeRef.current = currentTime;
      heartbeatCountRef.current++;
      peakTimestampsRef.current.push(currentTime);
      
      if (onPeakDetected) {
        onPeakDetected(currentTime, timeSinceLastPeak);
      }
    }
  }, [onPeakDetected, quarterPeriod]);

  return {
    detectPeaks,
    resetDetector,
    heartbeatCount: heartbeatCountRef,
    peakTimestamps: peakTimestampsRef
  };
};
