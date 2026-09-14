import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRestTimer } from "@/context/RestTimerContext";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus, RotateCcw, Timer, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MiniRestTimer: React.FC = () => {
  const { timeLeft, targetSeconds, isRunning, isFinished, startTimer, pauseTimer, addSeconds, resetTimer } = useRestTimer();
  const location = useLocation();
  const navigate = useNavigate();

  // If the user is already on /workouts, the full timer card is visible there
  const isWorkoutsPage = location.pathname === "/workouts";

  // Display floating pill if timer is active or finished
  const shouldShow = (isRunning || timeLeft < targetSeconds || isFinished) && !isWorkoutsPage;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 p-2 pl-3 rounded-full bg-background/95 backdrop-blur-xl border border-primary/40 shadow-2xl shadow-primary/20"
        >
          {/* Pulsing Timer Icon & Digits */}
          <div 
            onClick={() => navigate("/workouts")}
            className="flex items-center gap-2 cursor-pointer pr-1 group"
            title="Click to view full workout timer"
          >
            <div className={`p-1.5 rounded-full ${isRunning ? "bg-primary/20 text-primary animate-pulse" : isFinished ? "bg-amber-500/20 text-amber-400" : "bg-secondary text-muted-foreground"}`}>
              {isFinished ? <Sparkles className="w-3.5 h-3.5 text-amber-400" /> : <Timer className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-medium leading-none">
                {isFinished ? "Rest Complete" : "Rest Timer"}
              </span>
              <span className={`text-sm font-bold font-mono tracking-tight ${isRunning ? "text-primary" : isFinished ? "text-amber-400 animate-bounce" : "text-foreground"}`}>
                {isFinished ? "0:00" : formattedTime}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 border-l border-border/60 pl-2">
            {isFinished ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => resetTimer()}
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                title="Reset timer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            ) : isRunning ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={pauseTimer}
                className="h-7 w-7 rounded-full text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                title="Pause"
              >
                <Pause className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startTimer()}
                className="h-7 w-7 rounded-full text-primary hover:text-primary hover:bg-primary/10"
                title="Start"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </Button>
            )}

            {!isFinished && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => addSeconds(30)}
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 text-xs font-bold"
                title="Add 30s"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/workouts")}
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
              title="Open Workouts"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
