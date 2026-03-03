import { useState } from "react";
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
import { Plus, Trash2, Dumbbell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const WorkoutsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [workouts, setWorkouts] = useState<WorkoutEntry[]>(() =>
    user ? getUserWorkouts(user.id) : []
  );

  const muscleGroups = Object.keys(EXERCISE_LIBRARY);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMuscle, setSelectedMuscle] = useState<string>(muscleGroups[0]);
  const [selectedExercise, setSelectedExercise] = useState<string>(
    EXERCISE_LIBRARY[muscleGroups[0]][0].name
  );
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");

  const exercisesForMuscle = EXERCISE_LIBRARY[selectedMuscle] || [];

  const selectedExerciseObject = exercisesForMuscle.find(
    (ex) => ex.name === selectedExercise
  );

  const handleAdd = () => {
    if (!user || !weight || !selectedExercise) return;

    const entry = addWorkout({
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

    toast({
      title: "Workout logged!",
      description: `${selectedExercise} added successfully.`,
    });
  };

  const handleDelete = (id: string) => {
    deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const sorted = [...workouts].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Workout Log</h1>
        <p className="text-muted-foreground">Track your exercises and progress</p>
      </motion.div>

      {/* Log Card */}
      <motion.div variants={item}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Log Exercise
            </CardTitle>
          </CardHeader>
          <CardContent>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
              <div className="space-y-2 lg:col-span-2">
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

            </div>

            {/* Exercise Preview */}
            {selectedExerciseObject && (
              <div className="mt-6 space-y-3">
                <video
                  src={selectedExerciseObject.media}
                  controls
                  className="rounded-lg w-full max-h-64 object-cover"
                />
                <ul className="text-sm text-muted-foreground list-disc pl-5">
                  {selectedExerciseObject.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button className="mt-4" onClick={handleAdd} disabled={!weight || !selectedExercise}>
              <Plus className="h-4 w-4 mr-1" /> Add Entry
            </Button>

          </CardContent>
        </Card>
      </motion.div>

      {/* History */}
      <motion.div variants={item}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" /> History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sorted.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No workouts logged yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Muscle</TableHead>
                      <TableHead>Exercise</TableHead>
                      <TableHead>Sets</TableHead>
                      <TableHead>Reps</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="text-xs">{w.date}</TableCell>
                        <TableCell>{w.muscleGroup}</TableCell>
                        <TableCell>{w.exercise}</TableCell>
                        <TableCell>{w.sets}</TableCell>
                        <TableCell>{w.reps}</TableCell>
                        <TableCell>{w.weight}</TableCell>
                        <TableCell className="text-primary font-medium">
                          {w.sets * w.reps * w.weight}
                        </TableCell>
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