/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserWorkouts, getWeightLogs, addWeightLog, EXERCISES, WorkoutEntry, WeightLog, getCachedWorkouts, getCachedWeightLogs } from "@/lib/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Weight, Plus, ShieldAlert, Activity, Moon, Dumbbell, Sparkles, Trophy, Target, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getInjuryRiskAPI, getCachedInjuryRisk, InjuryRiskPrediction } from "@/lib/apiClient";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedExercise, setSelectedExercise] = useState("Bench Press");
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [weightVal, setWeightVal] = useState("");
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => getCachedWeightLogs());
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(() => getCachedWorkouts());
  const [injuryRisk, setInjuryRisk] = useState<InjuryRiskPrediction | null>(() => getCachedInjuryRisk());

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [wl, ws] = await Promise.all([getWeightLogs(user.id), getUserWorkouts(user.id)]);
        setWeightLogs(wl);
        setWorkouts(ws);
      } catch (err: any) {
        toast({
          title: "Error loading analytics data",
          description: err.message ?? "Something went wrong",
          variant: "destructive",
        });
      }
    })();

    getInjuryRiskAPI()
      .then((res) => {
        if (res && res.success) setInjuryRisk(res);
      })
      .catch((err) => console.warn("Failed to fetch injury risk in analytics", err));
  }, [user, toast]);

  // Volume by date
  const volumeData = useMemo(() => {
    const filtered = workouts.filter((w) => w.exercise === selectedExercise);
    const grouped: Record<string, number> = {};

    filtered.forEach((w) => {
      grouped[w.date] = (grouped[w.date] || 0) + w.sets * w.reps * w.weight;
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, volume]) => ({ date, volume }));
  }, [workouts, selectedExercise]);

  // ✅ Estimated 1RM per date (Epley formula)
  const strengthData = useMemo(() => {
    const filtered = workouts.filter((w) => w.exercise === selectedExercise);
    const grouped: Record<string, number> = {};

    filtered.forEach((w) => {
      const estimated1RM = w.weight * (1 + w.reps / 30);
      grouped[w.date] = Math.max(grouped[w.date] || 0, estimated1RM);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, oneRM]) => ({
        date,
        oneRM: Number(oneRM.toFixed(1)),
      }));
  }, [workouts, selectedExercise]);

  // ✅ Strength Change + PR detection
  const strengthStats = useMemo(() => {
    if (strengthData.length < 2) return null;

    const first = strengthData[0].oneRM;
    const last = strengthData[strengthData.length - 1].oneRM;

    const percentIncrease = ((last - first) / first) * 100;
    const maxEver = Math.max(...strengthData.map(d => d.oneRM));
    const isPR = last === maxEver;

    return {
      percent: percentIncrease.toFixed(1),
      isPR,
    };
  }, [strengthData]);

  // All-time 1RM Personal Records (Trophy Shelf)
  const trophyPRs = useMemo(() => {
    if (workouts.length === 0) return [];
    const exerciseMap: Record<string, { max1RM: number; weight: number; reps: number; date: string }> = {};

    workouts.forEach((w) => {
      const oneRM = w.weight * (1 + w.reps / 30);
      if (!exerciseMap[w.exercise] || oneRM > exerciseMap[w.exercise].max1RM) {
        exerciseMap[w.exercise] = {
          max1RM: Math.round(oneRM),
          weight: w.weight,
          reps: w.reps,
          date: w.date
        };
      }
    });

    return Object.entries(exerciseMap)
      .map(([exercise, data]) => ({ exercise, ...data }))
      .sort((a, b) => b.max1RM - a.max1RM)
      .slice(0, 4);
  }, [workouts]);

  // Weekly Volume Ring Stats
  const weeklyVolumeStats = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
    const pastWeekWorkouts = workouts.filter((w) => w.date >= sevenDaysAgo);
    const actualVolume = pastWeekWorkouts.reduce((acc, w) => acc + (w.sets * w.reps * w.weight), 0);
    const targetVolume = Math.max(12000, Math.round(actualVolume > 15000 ? actualVolume * 1.15 : 15000));
    const percent = Math.min(100, Math.round((actualVolume / targetVolume) * 100));
    return {
      actualVolume,
      targetVolume,
      percent,
      workoutCount: pastWeekWorkouts.length
    };
  }, [workouts]);

  const weightChartData = weightLogs.map((l) => ({
    date: l.date,
    weight: l.weight,
  }));

  const handleAddWeight = async () => {
    if (!user || !weightVal) return;

    try {
      const entry = await addWeightLog(user.id, weightDate, Number(weightVal));
      setWeightLogs((prev) =>
        [...prev, entry].sort((a, b) => a.date.localeCompare(b.date))
      );
      setWeightVal("");
      toast({ title: "Weight logged!" });
    } catch (err: any) {
      toast({
        title: "Error logging weight",
        description: err.message ?? "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const chartColor = "hsl(152, 76%, 40%)"; // Vibrant primary
  const chartColor2 = "hsl(200, 100%, 50%)"; // Vibrant cyan
  const chartColor3 = "hsl(20, 95%, 53%)"; // Vibrant athletic red-orange

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Progress Analytics</h1>
        <p className="text-muted-foreground">Visualize your fitness journey</p>
      </motion.div>

      {/* AI Predictive Biomechanics & Injury Radar Hero Card */}
      {injuryRisk && (
        <motion.div variants={item}>
          <Card className="glass-card border-t-4 border-t-primary overflow-hidden shadow-xl">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      Predictive Biomechanics & Injury Radar
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                        XGBoost Engine
                      </span>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {injuryRisk.evaluation_mode 
                        ? `${injuryRisk.evaluation_mode} • Acute vs. Chronic Strain Engine`
                        : "Real-time strain forecasting based on acute volume spikes, sleep deficit, and recovery capacity"}
                    </p>
                  </div>
                </div>

                <div 
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md self-start sm:self-auto shadow-sm"
                  style={{
                    backgroundColor: `${injuryRisk.color}15`,
                    borderColor: `${injuryRisk.color}40`,
                    color: injuryRisk.color,
                  }}
                >
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span>AI Injury Risk: {injuryRisk.risk_score}% ({injuryRisk.risk_level})</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Tonnage Card */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                        <Dumbbell className="w-4 h-4 text-primary" />
                        <span>7-Day Volume Load</span>
                      </div>
                      {injuryRisk.logged_workouts_evaluated ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                          {injuryRisk.logged_workouts_evaluated} sessions
                        </span>
                      ) : null}
                    </div>
                    <div className="text-2xl font-black text-foreground tracking-tight mt-1">
                      {(injuryRisk.seven_day_total_volume ?? 0).toLocaleString()} <span className="text-xs font-medium text-muted-foreground">kg lifted</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px] font-medium">Training Density</span>
                    <span className="font-semibold text-foreground bg-secondary px-2.5 py-0.5 rounded-md text-[11px] border border-border/50">
                      {injuryRisk.logged_workouts_evaluated ? "Active Routine" : "No sessions logged"}
                    </span>
                  </div>
                </div>

                {/* 2. Sleep & Recovery Card */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 flex flex-col justify-between hover:border-cyan-400/40 transition-all shadow-sm">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                        <Moon className="w-4 h-4 text-cyan-400" />
                        <span>Sleep & Recovery</span>
                      </div>
                      {injuryRisk.seven_day_avg_metrics && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20">
                          7d avg: {injuryRisk.seven_day_avg_metrics.sleep_hours}h
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-foreground tracking-tight mt-1">
                      {injuryRisk.metrics_evaluated.sleep_hours} <span className="text-xs font-medium text-muted-foreground">hrs/night</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px] font-medium">Readiness Score</span>
                    <span className="font-bold text-foreground bg-primary/10 text-primary px-2.5 py-0.5 rounded-md text-[11px] border border-primary/20">
                      {injuryRisk.metrics_evaluated.recovery_index}/100
                    </span>
                  </div>
                </div>

                {/* 3. Muscle Soreness Strain Card */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/60 flex flex-col justify-between hover:border-amber-400/40 transition-all shadow-sm">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                        <Activity className="w-4 h-4 text-amber-400" />
                        <span>Muscle Soreness</span>
                      </div>
                      {injuryRisk.seven_day_avg_metrics && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                          7d avg: Level {Math.min(5, Math.max(1, Math.round((injuryRisk.seven_day_avg_metrics.soreness_score || 2) / 2)))}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-foreground tracking-tight mt-1">
                      Level {Math.min(5, Math.max(1, Math.round((injuryRisk.metrics_evaluated.soreness_score || 2) / 2)))} <span className="text-xs font-medium text-muted-foreground">/ 5 strain</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px] font-medium">Dietary Adherence</span>
                    <span className="font-semibold text-foreground bg-secondary px-2.5 py-0.5 rounded-md text-[11px] border border-border/50">
                      {injuryRisk.metrics_evaluated.caloric_adherence}% On Track
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical AI Recommendation Bar */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-inner">
                <div className="flex items-start sm:items-center gap-2.5 text-muted-foreground">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground mr-1.5">Clinical AI Recommendation:</span>
                    <span className="text-muted-foreground leading-relaxed">{injuryRisk.recommendation}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap shrink-0 pt-1 md:pt-0">
                  {injuryRisk.drivers.map((driver, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-secondary text-[11px] font-medium text-muted-foreground border border-border/60">
                      {driver}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Performance Milestones Grid: 1RM Trophy Shelf & Weekly Volume Progress Ring */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weekly Volume Ring Card */}
        <motion.div variants={item} className="md:col-span-5">
          <Card className="glass-card h-full flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Weekly Volume Target
                </CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {weeklyVolumeStats.percent}% Complete
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col items-center justify-center my-auto">
              <div className="relative flex items-center justify-center w-36 h-36 my-2">
                <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Track Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-muted/20"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-primary transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - weeklyVolumeStats.percent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <Flame className="w-5 h-5 text-primary mb-0.5" />
                  <span className="text-2xl font-black text-foreground">{weeklyVolumeStats.percent}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Of Goal</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border/40 text-center">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Lifted This Week</span>
                  <span className="text-base font-extrabold text-foreground">{weeklyVolumeStats.actualVolume.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Weekly Target</span>
                  <span className="text-base font-extrabold text-muted-foreground">{weeklyVolumeStats.targetVolume.toLocaleString()} kg</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 1RM Personal Records Trophy Shelf */}
        <motion.div variants={item} className="md:col-span-7">
          <Card className="glass-card h-full flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  All-Time Personal Records (Est. 1RM)
                </CardTitle>
                <span className="text-xs text-muted-foreground">Brzycki Formula</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {trophyPRs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-xs">
                  <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  Log your exercise sets in Workouts to unlock personal records!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {trophyPRs.map((pr, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-gradient-to-br from-secondary/50 via-secondary/30 to-background border border-border/60 hover:border-amber-500/40 transition-all flex items-center justify-between shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground block truncate max-w-[140px]">{pr.exercise}</span>
                        <span className="text-[10px] text-muted-foreground block">
                          {pr.weight}kg × {pr.reps} reps • {new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="text-sm font-black text-amber-500 flex items-center justify-end gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          {pr.max1RM} kg
                        </span>
                        <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Max 1RM</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weight Tracking */}
      <motion.div variants={item}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Weight className="h-5 w-5 text-primary" />
              Body Weight Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} className="w-40" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Weight (kg)</Label>
                <Input type="number" value={weightVal} onChange={(e) => setWeightVal(e.target.value)} placeholder="70" className="w-32" />
              </div>

              <div className="flex items-end">
                <Button size="sm" onClick={handleAddWeight} disabled={!weightVal}>
                  <Plus className="h-4 w-4 mr-1" /> Log
                </Button>
              </div>
            </div>

            {weightChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weightChartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor3} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColor3} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 12%, 20%)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)', padding: '8px 12px', fontSize: '12px' }} 
                    labelStyle={{ color: '#f8fafc', fontWeight: 600, marginBottom: '2px' }}
                    itemStyle={{ color: '#fb923c', fontWeight: 500, fontSize: '12px' }}
                    formatter={(val: number | string) => [`${val} kg`, "Body Weight"]}
                  />
                  <Area type="monotone" dataKey="weight" stroke={chartColor3} strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Weight className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-sm">No weight logs yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Exercise Filter */}
      <motion.div variants={item}>
        <div className="flex items-center gap-4">
          <Label>Filter by Exercise:</Label>
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXERCISES.map((ex) => (
                <SelectItem key={ex} value={ex}>
                  {ex}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Volume */}
        <motion.div variants={item} className="flex h-full w-full">
          <Card className="glass-card flex flex-col w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-primary" />
                Volume Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {volumeData.length > 0 ? (
                <>
                  <div className="mb-3 flex items-center gap-4 text-sm min-h-[20px]">
                    <span className="text-primary font-medium">
                      Total Tracked: {volumeData.reduce((acc, d) => acc + d.volume, 0).toLocaleString()} kg
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={volumeData}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartColor} stopOpacity={1}/>
                          <stop offset="100%" stopColor={chartColor} stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 12%, 20%)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)', padding: '8px 12px', fontSize: '12px' }} 
                        labelStyle={{ color: '#f8fafc', fontWeight: 600, marginBottom: '2px' }}
                        itemStyle={{ color: '#34d399', fontWeight: 500, fontSize: '12px' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                        formatter={(val: number | string) => [`${Number(val).toLocaleString()} kg`, "Total Volume"]}
                      />
                      <Bar dataKey="volume" fill="url(#colorVolume)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-sm text-center">
                    No data for {selectedExercise}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Strength Trend */}
        <motion.div variants={item} className="flex h-full w-full">
          <Card className="glass-card flex flex-col w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />
                Strength Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {strengthData.length > 0 ? (
                <>
                  <div className="mb-3 flex items-center gap-4 text-sm min-h-[20px]">
                    {strengthStats && (
                      <>
                        <span className={Number(strengthStats.percent) >= 0 ? "text-green-400" : "text-red-400"}>
                          {Number(strengthStats.percent) >= 0 ? "🔼" : "🔽"} 
                          {Math.abs(Number(strengthStats.percent))}% Strength Change
                        </span>

                        {strengthStats.isPR && (
                          <span className="text-yellow-400">
                            🏆 New PR
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={strengthData}>
                      <defs>
                        <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColor2} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={chartColor2} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 12%, 20%)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)', padding: '8px 12px', fontSize: '12px' }} 
                        labelStyle={{ color: '#f8fafc', fontWeight: 600, marginBottom: '2px' }}
                        itemStyle={{ color: '#38bdf8', fontWeight: 500, fontSize: '12px' }}
                        formatter={(val: number | string) => [`${val} kg`, "Estimated 1RM"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="oneRM"
                        stroke={chartColor2}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorStrength)"
                        name="Estimated 1RM (kg)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  <p className="text-xs text-muted-foreground mt-2 min-h-[16px]">
                    1RM calculated using Epley Formula: weight × (1 + reps / 30)
                  </p>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-sm text-center">
                    No data for {selectedExercise}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default AnalyticsPage;