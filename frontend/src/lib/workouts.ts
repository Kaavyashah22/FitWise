import {
  createWorkout,
  getWorkouts as apiGetWorkouts,
  createWeightLog,
  getWeightLogs as apiGetWeightLogs,
} from "@/lib/apiClient";

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

type WorkoutNotes = {
  muscleGroup: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
};

function encodeNotes(entry: Omit<WorkoutEntry, "id">): string {
  const notes: WorkoutNotes = {
    muscleGroup: entry.muscleGroup,
    exercise: entry.exercise,
    sets: entry.sets,
    reps: entry.reps,
    weight: entry.weight,
  };
  return JSON.stringify(notes);
}

function decodeNotes(notes: string | null | undefined): WorkoutNotes | null {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes) as Partial<WorkoutNotes>;
    if (
      typeof parsed.muscleGroup === "string" &&
      typeof parsed.exercise === "string" &&
      typeof parsed.sets === "number" &&
      typeof parsed.reps === "number" &&
      typeof parsed.weight === "number"
    ) {
      return parsed as WorkoutNotes;
    }
    return null;
  } catch {
    return null;
  }
}

let workoutsCache: WorkoutEntry[] | null = null;
let lastWorkoutsFetch = 0;
let weightLogsCache: WeightLog[] | null = null;
let lastWeightLogsFetch = 0;

const WORKOUTS_CACHE_KEY = "fitwise_cached_workouts";
const WEIGHT_CACHE_KEY = "fitwise_cached_weight_logs";

export function getCachedWorkouts(): WorkoutEntry[] {
  if (workoutsCache) return workoutsCache;
  try {
    const raw = localStorage.getItem(WORKOUTS_CACHE_KEY);
    if (raw) {
      workoutsCache = JSON.parse(raw);
      return workoutsCache || [];
    }
  } catch {}
  return [];
}

export function getCachedWeightLogs(): WeightLog[] {
  if (weightLogsCache) return weightLogsCache;
  try {
    const raw = localStorage.getItem(WEIGHT_CACHE_KEY);
    if (raw) {
      weightLogsCache = JSON.parse(raw);
      return weightLogsCache || [];
    }
  } catch {}
  return [];
}

export async function addWorkout(entry: Omit<WorkoutEntry, "id">): Promise<WorkoutEntry> {
  const data = await createWorkout({
    date: entry.date,
    name: entry.exercise,
    notes: encodeNotes(entry),
  });
  const newEntry: WorkoutEntry = {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    muscleGroup: entry.muscleGroup,
    exercise: entry.exercise,
    sets: entry.sets,
    reps: entry.reps,
    weight: entry.weight
  };

  const current = getCachedWorkouts();
  const updated = [newEntry, ...current];
  workoutsCache = updated;
  try {
    localStorage.setItem(WORKOUTS_CACHE_KEY, JSON.stringify(updated));
  } catch {}

  return newEntry;
}

export async function getUserWorkouts(_userId?: string, forceRefresh = false): Promise<WorkoutEntry[]> {
  if (!forceRefresh && workoutsCache && Date.now() - lastWorkoutsFetch < 30000) {
    return workoutsCache;
  }

  try {
    const data = await apiGetWorkouts();
    const mapped = data.map((w) => {
      const decoded = decodeNotes(w.notes);
      return {
        id: w.id,
        userId: w.user_id,
        date: w.date,
        muscleGroup: decoded?.muscleGroup || "Unknown",
        exercise: decoded?.exercise || w.name || "Workout",
        sets: decoded?.sets ?? 0,
        reps: decoded?.reps ?? 0,
        weight: decoded?.weight ?? 0,
      };
    });

    workoutsCache = mapped;
    lastWorkoutsFetch = Date.now();
    try {
      localStorage.setItem(WORKOUTS_CACHE_KEY, JSON.stringify(mapped));
    } catch {}

    return mapped;
  } catch (err) {
    if (workoutsCache && workoutsCache.length > 0) return workoutsCache;
    const local = getCachedWorkouts();
    if (local.length > 0) return local;
    throw err;
  }
}

export async function deleteWorkout(id: string) {
  console.warn("Delete not implemented yet:", id);
}

export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weight: number;
}

export async function getWeightLogs(_userId?: string, forceRefresh = false): Promise<WeightLog[]> {
  if (!forceRefresh && weightLogsCache && Date.now() - lastWeightLogsFetch < 30000) {
    return weightLogsCache;
  }

  try {
    const data = await apiGetWeightLogs();
    const mapped = data.map((w) => ({
      id: w.id,
      userId: w.user_id,
      date: w.date,
      weight: w.weight_kg,
    }));

    weightLogsCache = mapped;
    lastWeightLogsFetch = Date.now();
    try {
      localStorage.setItem(WEIGHT_CACHE_KEY, JSON.stringify(mapped));
    } catch {}

    return mapped;
  } catch (err) {
    if (weightLogsCache && weightLogsCache.length > 0) return weightLogsCache;
    const local = getCachedWeightLogs();
    if (local.length > 0) return local;
    throw err;
  }
}

export async function addWeightLog(_userId: string, date: string, weight: number): Promise<WeightLog> {
  const data = await createWeightLog(date, weight);
  const newLog: WeightLog = {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    weight: data.weight_kg
  };

  const current = getCachedWeightLogs();
  const updated = [newLog, ...current];
  weightLogsCache = updated;
  try {
    localStorage.setItem(WEIGHT_CACHE_KEY, JSON.stringify(updated));
  } catch {}

  return newLog;
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