import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addWorkout, getUserWorkouts, deleteWorkout, EXERCISES, WorkoutEntry } from "@/lib/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { Plus, Trash2, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const WorkoutsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(() => user ? getUserWorkouts(user.id) : []);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [exercise, setExercise] = useState(EXERCISES[0]);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");

  const handleAdd = () => {
    if (!user || !weight) return;
    const entry = addWorkout({
      userId: user.id,
      date,
      exercise,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
    });
    setWorkouts((prev) => [...prev, entry]);
    setWeight("");
    toast({ title: "Workout logged!", description: `${exercise} added successfully.` });
  };

  const handleDelete = (id: string) => {
    deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Workout Log</h1>
        <p className="text-muted-foreground">Track your exercises and progress</p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Log Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <Label>Exercise</Label>
                <Select value={exercise} onValueChange={setExercise}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXERCISES.map((ex) => (
                      <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sets</Label>
                <Input type="number" value={sets} onChange={(e) => setSets(e.target.value)} min="1" />
              </div>
              <div className="space-y-2">
                <Label>Reps</Label>
                <Input type="number" value={reps} onChange={(e) => setReps(e.target.value)} min="1" />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="60" />
              </div>
            </div>
            <Button className="mt-4" onClick={handleAdd} disabled={!weight}>
              <Plus className="h-4 w-4 mr-1" /> Add Entry
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-primary" /> History</CardTitle>
          </CardHeader>
          <CardContent>
            {sorted.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No workouts logged yet. Start tracking above!</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Exercise</TableHead>
                      <TableHead>Sets</TableHead>
                      <TableHead>Reps</TableHead>
                      <TableHead>Weight (kg)</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-mono text-xs">{w.date}</TableCell>
                        <TableCell className="font-medium">{w.exercise}</TableCell>
                        <TableCell>{w.sets}</TableCell>
                        <TableCell>{w.reps}</TableCell>
                        <TableCell>{w.weight}</TableCell>
                        <TableCell className="text-primary font-medium">{w.sets * w.reps * w.weight}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
