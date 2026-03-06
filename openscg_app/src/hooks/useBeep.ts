"use client";

import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook to manage beep sounds using Web Audio API.
 * Handles AudioContext lifecycle and provides a playBeep function.
 */
export const useBeep = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(async (frequency = 800, duration = 0.1) => {
    try {
      // Create context on demand if it doesn't exist or was closed.
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const contextOptions = { latencyHint: 'playback' as AudioContextLatencyCategory };
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(contextOptions);
      }

      const ctx = audioContextRef.current;

      // If context is suspended, it MUST be resumed before use.
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // If it's still not running, we can't play.
      if (ctx.state !== 'running') {
        return;
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Use very low gain to reduce chances of system triggering vibration
      // Haptic feedback is often triggered by transients or volume levels above 0.5
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);

    } catch (err: unknown) {
      console.error('Error playing beep:', err);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  return { playBeep };
};
