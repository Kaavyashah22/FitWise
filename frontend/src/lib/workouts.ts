export interface WorkoutEntry {
  id: string;
  userId: string;
  date: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number; // kg
}

const WORKOUTS_KEY = "fitwise_workouts";

function getAllWorkouts(): WorkoutEntry[] {
  return JSON.parse(localStorage.getItem(WORKOUTS_KEY) || "[]");
}

function saveAllWorkouts(workouts: WorkoutEntry[]) {
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function addWorkout(entry: Omit<WorkoutEntry, "id">): WorkoutEntry {
  const workouts = getAllWorkouts();
  const newEntry = { ...entry, id: crypto.randomUUID() };
  workouts.push(newEntry);
  saveAllWorkouts(workouts);
  return newEntry;
}

export function getUserWorkouts(userId: string): WorkoutEntry[] {
  return getAllWorkouts().filter((w) => w.userId === userId);
}

export function deleteWorkout(id: string) {
  saveAllWorkouts(getAllWorkouts().filter((w) => w.id !== id));
}

export const EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Barbell Row",
  "Pull-Up",
  "Lat Pulldown",
  "Dumbbell Curl",
  "Tricep Pushdown",
  "Leg Press",
  "Leg Curl",
  "Leg Extension",
  "Cable Fly",
  "Dumbbell Lateral Raise",
  "Face Pull",
  "Romanian Deadlift",
  "Hip Thrust",
  "Plank",
  "Crunch",
  "Running",
];

export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weight: number;
}

const WEIGHT_LOG_KEY = "fitwise_weight_log";

export function getWeightLogs(userId: string): WeightLog[] {
  const all: WeightLog[] = JSON.parse(localStorage.getItem(WEIGHT_LOG_KEY) || "[]");
  return all.filter((w) => w.userId === userId).sort((a, b) => a.date.localeCompare(b.date));
}

export function addWeightLog(userId: string, date: string, weight: number): WeightLog {
  const all: WeightLog[] = JSON.parse(localStorage.getItem(WEIGHT_LOG_KEY) || "[]");
  const entry: WeightLog = { id: crypto.randomUUID(), userId, date, weight };
  all.push(entry);
  localStorage.setItem(WEIGHT_LOG_KEY, JSON.stringify(all));
  return entry;
}
