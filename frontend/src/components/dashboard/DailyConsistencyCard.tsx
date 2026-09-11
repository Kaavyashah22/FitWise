import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Dumbbell, Moon, Utensils, CheckCircle2, Circle, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyConsistencyCardProps {
  streak: number;
  hasWorkoutToday: boolean;
  isRecoveryDone: boolean;
  isNutritionDone: boolean;
  onOpenRecoveryModal: () => void;
  onToggleNutrition: () => void;
  onGoToWorkouts: () => void;
}

export const DailyConsistencyCard: React.FC<DailyConsistencyCardProps> = ({
  streak,
  hasWorkoutToday,
  isRecoveryDone,
  isNutritionDone,
  onOpenRecoveryModal,
  onToggleNutrition,
  onGoToWorkouts,
}) => {
  const completedCount =
    (hasWorkoutToday ? 1 : 0) + (isRecoveryDone ? 1 : 0) + (isNutritionDone ? 1 : 0);

  const progressPercentage = Math.round((completedCount / 3) * 100);

  return (
    <Card className="glass-card border border-primary/20 bg-gradient-to-r from-background/95 via-primary/[0.02] to-amber-500/[0.03] shadow-xl overflow-hidden">
      <CardContent className="p-5 sm:p-6 space-y-5">
        
        {/* Top Header: Streak & Overall Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105",
              streak > 0
                ? "bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-amber-500/25"
                : "bg-secondary text-muted-foreground border border-border/60"
            )}>
              <Flame className={cn("w-6 h-6", streak > 0 ? "animate-pulse fill-white" : "")} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                  {streak > 0 ? `${streak}-Day Active Streak` : "Start Your Streak Today"}
                </h3>
                {streak > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[11px] font-semibold">
                    {streak >= 7 ? "Elite Habit 🔥" : streak >= 3 ? "On Fire 🔥" : "Building Momentum"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {streak > 0
                  ? "Consistency is 90% of athletic progress. Keep the momentum rolling!"
                  : "Complete today's workout or log recovery to light your streak flame!"}
              </p>
            </div>
          </div>

          {/* Daily Score Gauge */}
          <div className="flex items-center gap-3 sm:self-center self-start bg-secondary/40 px-3.5 py-2 rounded-xl border border-border/50">
            <div className="text-right">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Today's Checkpoints</span>
              <span className="text-sm font-bold text-foreground">{completedCount} of 3 Met</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center relative">
              <span className={cn(
                "text-xs font-black",
                completedCount === 3 ? "text-emerald-400" : "text-primary"
              )}>
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* The Daily Triad Checkpoints (3 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* 1. Workout Checkpoint */}
          <div className={cn(
            "p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3",
            hasWorkoutToday
              ? "bg-emerald-500/[0.07] border-emerald-500/30 shadow-sm"
              : "bg-background/50 border-border/60 hover:border-primary/40"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  hasWorkoutToday ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/10 text-primary"
                )}>
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">Workout Session</span>
                  <span className="text-[11px] text-muted-foreground">
                    {hasWorkoutToday ? "Logged for today" : "Push your limits"}
                  </span>
                </div>
              </div>
              {hasWorkoutToday ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              )}
            </div>

            <div className="pt-1">
              {hasWorkoutToday ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] w-full justify-center py-1">
                  Completed Today
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onGoToWorkouts}
                  className="w-full text-xs h-7 border-primary/30 hover:bg-primary/10 text-primary font-medium flex items-center justify-center gap-1"
                >
                  Log Workout <ArrowRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* 2. Recovery Checkpoint */}
          <div className={cn(
            "p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3",
            isRecoveryDone
              ? "bg-cyan-500/[0.07] border-cyan-500/30 shadow-sm"
              : "bg-background/50 border-border/60 hover:border-cyan-400/40"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  isRecoveryDone ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-500/10 text-cyan-400"
                )}>
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">Recovery Check-in</span>
                  <span className="text-[11px] text-muted-foreground">
                    {isRecoveryDone ? "Sleep & soreness logged" : "Injury risk predictor"}
                  </span>
                </div>
              </div>
              {isRecoveryDone ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              )}
            </div>

            <div className="pt-1">
              {isRecoveryDone ? (
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px] w-full justify-center py-1">
                  Recovery Recorded
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenRecoveryModal}
                  className="w-full text-xs h-7 border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-medium flex items-center justify-center gap-1"
                >
                  Check-in Now <ArrowRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* 3. Nutrition Checkpoint */}
          <div className={cn(
            "p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3",
            isNutritionDone
              ? "bg-amber-500/[0.07] border-amber-500/30 shadow-sm"
              : "bg-background/50 border-border/60 hover:border-amber-400/40"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  isNutritionDone ? "bg-amber-500/20 text-amber-400" : "bg-amber-500/10 text-amber-400"
                )}>
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">Macro Adherence</span>
                  <span className="text-[11px] text-muted-foreground">
                    {isNutritionDone ? "Daily target maintained" : "Fuel your recovery"}
                  </span>
                </div>
              </div>
              {isNutritionDone ? (
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
              )}
            </div>

            <div className="pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onToggleNutrition}
                className={cn(
                  "w-full text-xs h-7 font-medium transition-all",
                  isNutritionDone
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                    : "border-border/60 hover:bg-accent text-muted-foreground"
                )}
              >
                {isNutritionDone ? "Target Met (Tap to undo)" : "Mark Target Met"}
              </Button>
            </div>
          </div>

        </div>

        {/* Bottom Status Feedback */}
        {completedCount === 3 && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 shrink-0" />
              Perfect day! All 3 daily checkpoints completed. Maximum recovery & hypertrophy primed.
            </span>
            <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px] shrink-0">100% On Track</Badge>
          </div>
        )}

      </CardContent>
    </Card>
  );
};
