/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addWorkout, getUserWorkouts, deleteWorkout, WorkoutEntry } from "@/lib/workouts";
import { EXERCISE_LIBRARY } from "@/lib/exercise-library";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { Plus, Trash2, Dumbbell, Loader2, Trophy, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const WorkoutsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
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
        const ws = await getUserWorkouts(user.id);
        setWorkouts(ws);
      } catch (err: any) {
        toast({
          title: "Error loading workouts",
          description: err.message ?? "Something went wrong",
          variant: "destructive",
        });
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

      setWorkouts((prev) => [...prev, entry]);
      setWeight("");
      setIsModalOpen(false);

      toast({
        title: "Workout logged!",
        description: `${selectedExercise} added successfully.`,
      });
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
    } catch (err: any) {
      toast({
        title: "Error deleting workout",
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
                      <TableHead className="w-[60px]"></TableHead>
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
                              <TableCell className="font-medium">{w.exercise}</TableCell>
                              <TableCell className="text-right">{w.sets}</TableCell>
                              <TableCell className="text-right">{w.reps}</TableCell>
                              <TableCell className="text-right">{w.weight} kg</TableCell>
                              <TableCell className="text-right text-primary font-bold opacity-80">
                                {(w.sets * w.reps * w.weight).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)} className="hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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