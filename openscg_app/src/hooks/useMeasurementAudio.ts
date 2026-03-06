"use client";

import { useEffect, useCallback } from 'react';
import { useBeep } from '@/hooks/useBeep';

type MeasurementStage = 'ready' | 'countdown' | 'measuring' | 'complete' | 'error';

/**
 * Hook to manage all measurement-related audio cues.
 * Ensures analytic beep purity and absolute vibration control.
 */
export const useMeasurementAudio = (stage: MeasurementStage) => {
  const { playBeep } = useBeep();

  const playHeartbeatSound = useCallback(() => {
    // Analytic heartbeat beep: 1000Hz, 0.1s
    playBeep(1000, 0.1);
  }, [playBeep]);

  const playCountdownTick = useCallback(() => {
    // Countdown tick: 800Hz, 0.1s
    playBeep(800, 0.1);
  }, [playBeep]);

  const playCompletionSound = useCallback(() => {
    // Completion melody/beep: 1200Hz, 0.15s
    playBeep(1200, 0.15);
  }, [playBeep]);

  const unlockAudio = useCallback(() => {
    // Silent beep to unlock AudioContext on user gesture
    playBeep(1, 0.001);
  }, [playBeep]);

  // Stage-based automatic triggers
  useEffect(() => {
    if (stage === 'complete') {
      playCompletionSound();
    }
  }, [stage, playCompletionSound]);

  return {
    playHeartbeatSound,
    playCountdownTick,
    playCompletionSound,
    unlockAudio
  };
};
