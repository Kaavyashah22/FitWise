/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addWorkout, getUserWorkouts, deleteWorkout, WorkoutEntry, getCachedWorkouts, syncOfflineWorkouts } from "@/lib/workouts";
import { EXERCISE_LIBRARY } from "@/lib/exercise-library";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { Plus, Trash2, Dumbbell, Loader2, Trophy, ChevronDown, ChevronRight, Calendar, WifiOff, CloudUpload, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RestTimer } from "@/components/workouts/RestTimer";
import { useRestTimer } from "@/context/RestTimerContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const WorkoutsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { startTimer } = useRestTimer();
  const { isOnline, offlineQueueCount, isSyncing, syncNow, refreshQueueCount } = useOnlineStatus();

  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(() => getCachedWorkouts());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (workouts.length > 0 && Object.keys(expandedDates).length === 0) {
      const latestDate = [...workouts].sort((a, b) => b.date.localeCompare(a.date))[0].date;
      setExpandedDates({ [latestDate]: true });
    }
  }, [workouts]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const synced = await syncOfflineWorkouts().catch(() => 0);
        if (synced > 0) {
          toast({
            title: "Cloud Sync Complete ☁️",
            description: `Synchronized ${synced} offline workout set${synced > 1 ? "s" : ""} to your cloud account.`,
          });
        }
        const ws = await getUserWorkouts(user.id);
        setWorkouts(ws);
        refreshQueueCount();
      } catch (err: any) {
        // If offline, don't show alarming error toast
        if (navigator.onLine) {
          toast({
            title: "Error loading workouts",
            description: err.message ?? "Something went wrong",
            variant: "destructive",
          });
        }
      }
    })();
  }, [user, toast]);

  const muscleGroups = Object.keys(EXERCISE_LIBRARY);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMuscle, setSelectedMuscle] = useState<string>(muscleGroups[0]);
  const [selectedExercise, setSelectedExercise] = useState<string>(
    EXERCISE_LIBRARY[muscleGroups[0]][0].name
  );
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const exercisesForMuscle = EXERCISE_LIBRARY[selectedMuscle] || [];

  const selectedExerciseObject = exercisesForMuscle.find(
    (ex) => ex.name === selectedExercise
  );

  const handleAdd = async () => {
    if (!user || !weight || !selectedExercise) return;

    setIsAdding(true);
    try {
      const entry = await addWorkout({
        userId: user.id,
        date,
        muscleGroup: selectedMuscle,
        exercise: selectedExercise,
        sets: Number(sets),
        reps: Number(reps),
        weight: Number(weight),
      });

      setWorkouts((prev) => [entry, ...prev.filter((p) => p.id !== entry.id)]);
      setWeight("");
      setIsModalOpen(false);
      refreshQueueCount();

      if (entry.id.startsWith("offline-") || !isOnline) {
        toast({
          title: "Saved to Offline Storage ⚡",
          description: `Gym dead zone detected. ${selectedExercise} set safely queued on device. Auto-syncs to cloud when reconnected.`,
        });
      } else {
        toast({
          title: "Workout logged! 🏋️‍♂️",
          description: `${selectedExercise} added to your cloud profile.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error logging workout",
        description: err.message ?? "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkout(id);
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      refreshQueueCount();
    } catch (err: any) {
      toast({
        title: "Error deleting workout",
        description: err.message ?? "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleRepeatSet = async (w: WorkoutEntry) => {
    if (!user) return;
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const entry = await addWorkout({
        userId: user.id,
        date: todayStr,
        muscleGroup: w.muscleGroup,
        exercise: w.exercise,
        sets: 1,
        reps: w.reps,
        weight: w.weight,
      });

      setWorkouts((prev) => [entry, ...prev.filter((p) => p.id !== entry.id)]);
      setExpandedDates((prev) => ({ ...prev, [todayStr]: true }));
      startTimer(90);
      refreshQueueCount();

      if (entry.id.startsWith("offline-") || !isOnline) {
        toast({
          title: "Set Logged Offline! ⚡",
          description: `Logged Set: ${w.exercise} (1 x ${w.reps} @ ${w.weight}kg). Queued locally • 90s rest timer started!`,
        });
      } else {
        toast({
          title: "Set Logged! ⏱️",
          description: `Logged Set: ${w.exercise} (1 x ${w.reps} @ ${w.weight}kg). 90s rest timer started!`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error repeating set",
        description: err.message ?? "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const sorted = [...workouts].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  
  const groupedByDate = sorted.reduce((acc, w) => {
    if (!acc[w.date]) acc[w.date] = [];
    acc[w.date].push(w);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  const groupedArray = Object.entries(groupedByDate).sort((a, b) => b[0].localeCompare(a[0]));

  const toggleDate = (dateStr: string) => {
    setExpandedDates(prev => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const estimated1RM = weight && reps ? (Number(weight) * (1 + Number(reps) / 30)).toFixed(1) : null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workout Log</h1>
          <p className="text-muted-foreground mt-1">Track your exercises and push your limits.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5 mr-2" /> Log Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-card">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" /> Log Exercise
              </DialogTitle>
              <DialogDescription>
                Record your sets, reps, and weight to track your progress.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="block w-full appearance-none min-h-[40px] text-left [&::-webkit-date-and-time-value]:text-left" 
                />
              </div>

              {/* Muscle Group */}
              <div className="space-y-2">
                <Label>Muscle Group</Label>
                <Select
                  value={selectedMuscle}
                  onValueChange={(val) => {
                    setSelectedMuscle(val);
                    setSelectedExercise(EXERCISE_LIBRARY[val][0].name);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {muscleGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Exercise */}
              <div className="space-y-2 sm:col-span-2">
                <Label>Exercise</Label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {exercisesForMuscle.map((ex) => (
                      <SelectItem key={ex.name} value={ex.name}>
                        {ex.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sets */}
              <div className="space-y-2">
                <Label>Sets</Label>
                <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} min="1" />
              </div>

              {/* Reps */}
              <div className="space-y-2">
                <Label>Reps</Label>
                <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} min="1" />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="60" />
              </div>
              
              {/* Live 1RM Preview */}
              <div className="space-y-2 flex items-end">
                 <div className="w-full h-10 rounded-md border border-primary/30 bg-primary/10 flex items-center justify-between px-3">
                   <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. 1RM</span>
                   <span className="text-primary font-bold flex items-center gap-1">
                     {estimated1RM ? <><Trophy className="w-3 h-3 text-yellow-500" /> {estimated1RM} kg</> : "—"}
                   </span>
                 </div>
              </div>
            </div>

            {/* Exercise Preview */}
            {selectedExerciseObject && (
              <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
                <video
                  src={selectedExerciseObject.media}
                  controls
                  className="rounded-lg w-full h-40 object-cover mb-3 shadow-inner"
                />
                <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                  {selectedExerciseObject.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={handleAdd} disabled={!weight || !selectedExercise || isAdding} className="w-full sm:w-auto shadow-lg">
                {isAdding ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" /> Log Workout</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Offline Status & Pending Cloud Sync Notification Banner */}
      {!isOnline ? (
        <motion.div variants={item} className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs sm:text-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
              <WifiOff className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-foreground">Offline Gym Mode Active</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                No internet connection detected. You can freely log exercises, sets, and weights — all data is saved securely to your device.
              </p>
            </div>
          </div>
          {offlineQueueCount > 0 && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/15 shrink-0 ml-2 font-mono">
              {offlineQueueCount} queued
            </Badge>
          )}
        </motion.div>
      ) : offlineQueueCount > 0 ? (
        <motion.div variants={item} className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20 text-primary shrink-0">
              <CloudUpload className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-foreground">
                {offlineQueueCount} Offline Workout Set{offlineQueueCount > 1 ? "s" : ""} Ready to Sync
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Internet is online. Your gym sets recorded offline can be synced to your cloud account now.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              await syncNow();
              if (user) {
                const refreshed = await getUserWorkouts(user.id, true);
                setWorkouts(refreshed);
              }
            }}
            disabled={isSyncing}
            className="h-8 text-xs font-semibold shrink-0 ml-3 bg-primary text-primary-foreground shadow-sm"
          >
            {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
            Sync Now
          </Button>
        </motion.div>
      ) : null}

      {/* In-App Gym Rest Timer */}
      <motion.div variants={item}>
        <RestTimer />
      </motion.div>

      {/* History */}
      <motion.div variants={item}>
        <Card className="glass-card overflow-hidden">
          <CardHeader className="bg-secondary/30 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" /> History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Dumbbell className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-sm">No workouts logged yet. Start crushing your goals!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead>Muscle</TableHead>
                      <TableHead>Exercise</TableHead>
                      <TableHead className="text-right">Sets</TableHead>
                      <TableHead className="text-right">Reps</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="w-[110px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedArray.map(([dateStr, dayWorkouts]) => {
                      const isExpanded = expandedDates[dateStr];
                      const totalVolume = dayWorkouts.reduce((acc, w) => acc + (w.sets * w.reps * w.weight), 0);
                      const displayDate = new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

                      return (
                        <React.Fragment key={dateStr}>
                          {/* Group Header Row */}
                          <TableRow 
                            className="bg-secondary/40 hover:bg-secondary/60 transition-colors cursor-pointer border-b border-border/50"
                            onClick={() => toggleDate(dateStr)}
                          >
                            <TableCell colSpan={6} className="py-3 font-medium text-foreground">
                              <div className="flex items-center gap-3">
                                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary opacity-80" /> 
                                  {displayDate}
                                </div>
                                <span className="text-xs font-normal text-muted-foreground ml-2 bg-background/80 px-2 py-0.5 rounded-full border border-border/50">
                                  {dayWorkouts.length} exercise{dayWorkouts.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-right font-semibold text-foreground">
                              {totalVolume.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">vol</span>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>

                          {/* Exercise Rows (if expanded) */}
                          {isExpanded && dayWorkouts.map((w) => (
                            <TableRow key={w.id} className="hover:bg-muted/10 transition-colors">
                              <TableCell className="pl-8 text-xs text-muted-foreground">
                                {/* Empty cell to indent exercises under date */}
                              </TableCell>
                              <TableCell>
                                 <Badge variant="outline" className="bg-background/50">{w.muscleGroup}</Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span>{w.exercise}</span>
                                  {w.id.startsWith("offline-") && (
                                    <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 text-[9px] px-1.5 py-0 flex items-center gap-0.5 font-semibold">
                                      <WifiOff className="h-2.5 w-2.5" /> Saved Offline
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{w.sets}</TableCell>
                              <TableCell className="text-right">{w.reps}</TableCell>
                              <TableCell className="text-right">{w.weight} kg</TableCell>
                              <TableCell className="text-right text-primary font-bold opacity-80">
                                {(w.sets * w.reps * w.weight).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRepeatSet(w)}
                                    className="h-8 px-2 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1"
                                    title="1-Tap: Log another set with same weight/reps & start 90s rest timer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Set</span>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleDelete(w.id)} 
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                                    title="Delete entry"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default WorkoutsPage;