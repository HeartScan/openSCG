"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook to manage device motion sensors and permissions.
 * Reference implementation from deprecated/cardioai/hooks/useMotionSensor.ts
 */
export const useMotionSensor = (onMotion: (event: DeviceMotionEvent) => void) => {
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const onMotionRef = useRef(onMotion);

  useEffect(() => {
    onMotionRef.current = onMotion;
  }, [onMotion]);

  const requestPermission = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DeviceMotion = (window as any).DeviceMotionEvent;

    // Check if DeviceMotionEvent exists and has requestPermission (iOS 13+)
    if (typeof DeviceMotion !== 'undefined' && 
        typeof DeviceMotion.requestPermission === 'function') {
      try {
        const response = await DeviceMotion.requestPermission();
        setPermissionStatus(response);
        return response === 'granted';
      } catch (error) {
        console.error('Motion permission error:', error);
        setPermissionStatus('denied');
        return false;
      }
    } else {
      // Non-iOS or older iOS/Android
      setPermissionStatus('granted');
      return true;
    }
  }, []);

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      onMotionRef.current(event);
    };

    if (permissionStatus === 'granted') {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [permissionStatus]);

  const isSupported = typeof window !== 'undefined' && 'DeviceMotionEvent' in window;

  return {
    permissionStatus,
    requestPermission,
    isSupported
  };
};
