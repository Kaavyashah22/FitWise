import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface RestTimerContextType {
  targetSeconds: number;
  timeLeft: number;
  isRunning: boolean;
  isFinished: boolean;
  soundEnabled: boolean;
  startTimer: (seconds?: number) => void;
  pauseTimer: () => void;
  resetTimer: (seconds?: number) => void;
  addSeconds: (seconds: number) => void;
  toggleSound: () => void;
}

const RestTimerContext = createContext<RestTimerContextType | undefined>(undefined);

// Web Audio API singleton to ensure reliable playback across browser autoplay restrictions
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

export const RestTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [targetSeconds, setTargetSeconds] = useState(90);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timestamp-based synchronization to prevent timer drift when switching tabs or backgrounding
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio chime and trigger mobile vibration
  const playAlert = useCallback(() => {
    // 1. Mobile Haptic Vibration
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([250, 100, 250, 100, 400]);
      } catch {
        /* ignore */
      }
    }

    // 2. Audio Chime
    if (!soundEnabled) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: High crisp bell (A5 = 880Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: Harmonic resolution (D6 = 1174.66Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1174.66, now + 0.18);
      gain2.gain.setValueAtTime(0.4, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.85);
    } catch {
      /* AudioContext error */
    }
  }, [soundEnabled]);

  // Main countdown effect driven by wall-clock timestamps
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (!endTimeRef.current) return;
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          setIsFinished(true);
          endTimeRef.current = null;
          playAlert();
          toast({
            title: "Rest Complete! ⏱️",
            description: "Ready for your next set. Push your limits!",
          });
        }
      }, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, playAlert]);

  const startTimer = useCallback((seconds?: number) => {
    getAudioContext(); // Unlocks browser audio policy on user click
    const duration = seconds !== undefined ? seconds : timeLeft > 0 ? timeLeft : targetSeconds;
    if (seconds !== undefined) {
      setTargetSeconds(seconds);
    }
    setTimeLeft(duration);
    endTimeRef.current = Date.now() + duration * 1000;
    setIsFinished(false);
    setIsRunning(true);
  }, [timeLeft, targetSeconds]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    if (endTimeRef.current) {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      endTimeRef.current = null;
    }
  }, []);

  const resetTimer = useCallback((seconds?: number) => {
    getAudioContext();
    const duration = seconds !== undefined ? seconds : targetSeconds;
    if (seconds !== undefined) {
      setTargetSeconds(seconds);
    }
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(duration);
    endTimeRef.current = null;
  }, [targetSeconds]);

  const addSeconds = useCallback((extraSeconds: number) => {
    getAudioContext();
    setTimeLeft((prev) => {
      const updated = Math.max(0, prev + extraSeconds);
      if (endTimeRef.current) {
        endTimeRef.current += extraSeconds * 1000;
      }
      return updated;
    });
    setTargetSeconds((prev) => Math.max(0, prev + extraSeconds));
    setIsFinished(false);
  }, []);

  const toggleSound = useCallback(() => {
    getAudioContext();
    setSoundEnabled((prev) => !prev);
  }, []);

  return (
    <RestTimerContext.Provider
      value={{
        targetSeconds,
        timeLeft,
        isRunning,
        isFinished,
        soundEnabled,
        startTimer,
        pauseTimer,
        resetTimer,
        addSeconds,
        toggleSound,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  );
};

export const useRestTimer = (): RestTimerContextType => {
  const context = useContext(RestTimerContext);
  if (!context) {
    throw new Error("useRestTimer must be used within a RestTimerProvider");
  }
  return context;
};
