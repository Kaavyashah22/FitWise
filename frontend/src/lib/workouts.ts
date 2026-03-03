export interface WorkoutEntry {
  id: string;
  userId: string;
  date: string;
  muscleGroup: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
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
export const EXERCISES = [
  "Bench Press",
  "Incline Bench Press",
  "Machine Pec Fly",
  "Push-Up",
  "Deadlift",
  "Barbell Row",
  "Lat Pulldown",
  "Pull-Up",
  "Seated Cable Row",
  "Face Pull",
  "Squat",
  "Leg Press",
  "Romanian Deadlift",
  "Leg Curl",
  "Leg Extension",
  "Calf Raises",
  "Overhead Press",
  "Dumbbell Shoulder Press",
  "Dumbbell Lateral Raise",
  "Front Raise",
  "Rear Delt Fly",
  "Barbell Curl",
  "Dumbbell Curl",
  "Hammer Curl",
  "Tricep Pushdown",
  "Close Grip Bench Press"
];
