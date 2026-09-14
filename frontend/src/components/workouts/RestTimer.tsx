import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Plus, Timer, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useRestTimer } from "@/context/RestTimerContext";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  className?: string;
  initialSeconds?: number;
}

export const RestTimer: React.FC<RestTimerProps> = ({ className, initialSeconds }) => {
  const {
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
  } = useRestTimer();

  // If an initialSeconds prop is explicitly provided and different from targetSeconds, sync on mount if idle
  useEffect(() => {
    if (initialSeconds !== undefined && initialSeconds !== targetSeconds && !isRunning && timeLeft === targetSeconds) {
      resetTimer(initialSeconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSeconds]);

  // Spacebar quick shortcut to Start / Pause timer (unless typing in inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === "input" || activeTag === "textarea" || (document.activeElement as HTMLElement)?.isContentEditable) {
          return;
        }
        e.preventDefault();
        if (isRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, pauseTimer, startTimer]);

  const handleStart = () => {
    startTimer();
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleReset = (newSecs?: number) => {
    resetTimer(newSecs);
  };

  const addThirtySeconds = () => {
    addSeconds(30);
  };

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // SVG Circular progress calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = targetSeconds > 0 ? timeLeft / targetSeconds : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <Card className={cn("glass-card overflow-hidden border border-primary/20 bg-gradient-to-br from-background/95 via-primary/[0.03] to-emerald-500/[0.04] shadow-lg", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Indicator & Status */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Circular Progress Ring */}
            <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
              <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-muted/30"
                  strokeWidth="7"
                  fill="transparent"
                />
                {/* Active Animated Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={isFinished ? "#10b981" : isRunning ? "#06b6d4" : "#8b5cf6"}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-linear"
                />
              </svg>
              
              {/* Digital Countdown Inside Ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={cn(
                  "font-mono font-extrabold text-xl tracking-tight",
                  isFinished ? "text-emerald-400 animate-pulse" : isRunning ? "text-foreground" : "text-muted-foreground"
                )}>
                  {timeFormatted}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground -mt-0.5">
                  {isFinished ? "Go!" : isRunning ? "Rest" : "Ready"}
                </span>
              </div>
            </div>

            {/* Title & Status Message */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Timer className="w-4 h-4 text-cyan-400" /> In-App Rest Timer
                </span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-muted/60 text-muted-foreground rounded border border-border/60" title="Press spacebar anywhere to toggle start / pause">
                  Space
                </kbd>
                {isFinished && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] animate-bounce">
                    <Sparkles className="w-2.5 h-2.5 mr-1" /> Rest Complete!
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isFinished
                  ? "Target recovery reached — initiate your next set!"
                  : isRunning
                  ? "Replenishing ATP & neuromuscular capacity..."
                  : "Select a rest interval or tap start after your set."}
              </p>
            </div>
          </div>

          {/* Right: Presets & Controls */}
          <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
            {/* Preset Buttons */}
            <div className="flex items-center gap-1.5 bg-secondary/50 p-1 rounded-xl border border-border/50">
              {[
                { label: "60s", sec: 60 },
                { label: "90s", sec: 90 },
                { label: "120s", sec: 120 },
              ].map((preset) => (
                <Button
                  key={preset.sec}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReset(preset.sec)}
                  className={cn(
                    "h-7 px-2.5 text-xs font-semibold rounded-lg transition-all",
                    targetSeconds === preset.sec && !isRunning
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-accent/60 text-muted-foreground"
                  )}
                >
                  {preset.label}
                </Button>
              ))}

              <Button
                size="sm"
                variant="ghost"
                onClick={addThirtySeconds}
                className="h-7 px-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg"
                title="Add 30 seconds"
              >
                <Plus className="w-3 h-3 mr-0.5" /> 30s
              </Button>
            </div>

            {/* Controls: Play / Pause, Reset, Audio Toggle */}
            <div className="flex items-center gap-1.5">
              {isRunning ? (
                <Button
                  size="sm"
                  onClick={handlePause}
                  className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20"
                >
                  <Pause className="w-3.5 h-3.5 mr-1" /> Pause
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStart}
                  className="h-8 px-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/20"
                >
                  <Play className="w-3.5 h-3.5 mr-1" /> Start
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReset()}
                className="h-8 w-8 p-0 border-border/60 hover:bg-accent/50"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                title={soundEnabled ? "Mute chime" : "Enable chime"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </Button>
            </div>

          </div>

        </div>
      </CardContent>
    </Card>
  );
};
