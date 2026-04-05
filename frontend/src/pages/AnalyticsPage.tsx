import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getUserWorkouts, getWeightLogs, addWeightLog, EXERCISES, WorkoutEntry, WeightLog } from "@/lib/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Weight, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedExercise, setSelectedExercise] = useState("Bench Press");
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [weightVal, setWeightVal] = useState("");
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

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

  const chartColor = "hsl(152, 60%, 45%)";
  const chartColor2 = "hsl(200, 55%, 55%)";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Progress Analytics</h1>
        <p className="text-muted-foreground">Visualize your fitness journey</p>
      </motion.div>

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
                <LineChart data={weightChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 12%, 20%)" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke={chartColor} strokeWidth={2} dot={{ fill: chartColor, r: 4 }} />
                </LineChart>
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
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 12%, 20%)" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="volume" fill={chartColor} radius={[4, 4, 0, 0]} />
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
                    <LineChart data={strengthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 12%, 20%)" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="oneRM"
                        stroke={chartColor2}
                        strokeWidth={2}
                        dot={{ fill: chartColor2, r: 4 }}
                        name="Estimated 1RM (kg)"
                      />
                    </LineChart>
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