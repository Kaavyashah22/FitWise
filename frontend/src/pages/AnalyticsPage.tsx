/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserWorkouts, getWeightLogs, addWeightLog, EXERCISES, WorkoutEntry, WeightLog, getCachedWorkouts, getCachedWeightLogs } from "@/lib/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Weight, Plus, ShieldAlert, Activity, Moon, Dumbbell, Sparkles } from "lucide-react";
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
                      Real-time strain forecasting based on acute volume spikes, sleep deficit, and recovery capacity
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

            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Dumbbell className="w-3.5 h-3.5 text-primary" />
                    <span>7-Day Volume Load (Tonnage)</span>
                  </div>
                  <div className="text-xl font-extrabold text-foreground">
                    {(injuryRisk.seven_day_total_volume ?? 0).toLocaleString()} <span className="text-xs font-medium text-muted-foreground">kg lifted</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {injuryRisk.logged_workouts_evaluated ? `${injuryRisk.logged_workouts_evaluated} workouts evaluated this week` : "No workouts logged this week"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sleep & Recovery Index</span>
                  </div>
                  <div className="text-xl font-extrabold text-foreground">
                    {injuryRisk.metrics_evaluated.sleep_hours} <span className="text-xs font-medium text-muted-foreground">hrs/night</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Readiness Score: {injuryRisk.metrics_evaluated.recovery_index}/100
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Muscle Soreness Strain</span>
                  </div>
                  <div className="text-xl font-extrabold text-foreground">
                    {injuryRisk.metrics_evaluated.soreness_score} <span className="text-xs font-medium text-muted-foreground">/ 10 Soreness</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Dietary Adherence: {injuryRisk.metrics_evaluated.caloric_adherence}%
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start sm:items-center gap-2 text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="font-semibold text-foreground mr-1.5">Clinical AI Recommendation:</span>
                    <span>{injuryRisk.recommendation}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  {injuryRisk.drivers.map((driver, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-secondary text-[11px] font-medium text-muted-foreground border border-border/50">
                      {driver}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
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
                  <div className="mb-3 flex items-center gap-4 text-sm min-h-[20px] invisible">
                    <span>Placeholder</span>
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
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="volume" fill="url(#colorVolume)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <p className="text-xs text-muted-foreground mt-2 min-h-[16px] invisible">
                    Placeholder
                  </p>
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
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
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