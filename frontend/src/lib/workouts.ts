import {
  createWorkout,
  apiDeleteWorkout,
  getWorkouts as apiGetWorkouts,
  createWeightLog,
  getWeightLogs as apiGetWeightLogs,
  invalidateInjuryRiskCache,
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
const OFFLINE_WORKOUTS_QUEUE_KEY = "fitwise_offline_workout_queue";

export function getOfflineWorkoutsQueue(): Omit<WorkoutEntry, "id">[] {
  try {
    const raw = localStorage.getItem(OFFLINE_WORKOUTS_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(entry: Omit<WorkoutEntry, "id">) {
  try {
    const queue = getOfflineWorkoutsQueue();
    queue.push(entry);
    localStorage.setItem(OFFLINE_WORKOUTS_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* ignore */
  }
}

export async function syncOfflineWorkouts(): Promise<number> {
  if (typeof window === "undefined" || (navigator && !navigator.onLine)) return 0;
  const queue = getOfflineWorkoutsQueue();
  if (queue.length === 0) return 0;

  const remaining: Omit<WorkoutEntry, "id">[] = [];
  let syncedCount = 0;

  for (const entry of queue) {
    try {
      await createWorkout({
        date: entry.date,
        name: entry.exercise,
        notes: encodeNotes(entry),
      });
      syncedCount++;
    } catch {
      remaining.push(entry);
    }
  }

  try {
    localStorage.setItem(OFFLINE_WORKOUTS_QUEUE_KEY, JSON.stringify(remaining));
  } catch {
    /* ignore */
  }

  if (syncedCount > 0) {
    await getUserWorkouts(undefined, true).catch(() => {});
  }

  return syncedCount;
}

// Auto-sync whenever internet connectivity is restored
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    syncOfflineWorkouts().catch(() => {});
  });
}

export function getCachedWorkouts(): WorkoutEntry[] {
  if (workoutsCache) return workoutsCache;
  try {
    const raw = localStorage.getItem(WORKOUTS_CACHE_KEY);
    if (raw) {
      workoutsCache = JSON.parse(raw);
      return workoutsCache || [];
    }
  } catch {
    /* ignore */
  }
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
  } catch {
    /* ignore */
  }
  return [];
}

export async function addWorkout(entry: Omit<WorkoutEntry, "id">): Promise<WorkoutEntry> {
  let newEntry: WorkoutEntry;

  try {
    const data = await createWorkout({
      date: entry.date,
      name: entry.exercise,
      notes: encodeNotes(entry),
    });
    newEntry = {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      muscleGroup: entry.muscleGroup,
      exercise: entry.exercise,
      sets: entry.sets,
      reps: entry.reps,
      weight: entry.weight
    };
  } catch (networkErr) {
    console.warn("Network error creating workout. Saving optimistically to offline queue:", networkErr);
    newEntry = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: entry.userId,
      date: entry.date,
      muscleGroup: entry.muscleGroup,
      exercise: entry.exercise,
      sets: entry.sets,
      reps: entry.reps,
      weight: entry.weight
    };
    addToOfflineQueue(entry);
  }

  const current = getCachedWorkouts();
  const updated = [newEntry, ...current];
  workoutsCache = updated;
  try {
    localStorage.setItem(WORKOUTS_CACHE_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }

  invalidateInjuryRiskCache();
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
    } catch {
      /* ignore */
    }

    return mapped;
  } catch (err) {
    if (workoutsCache && workoutsCache.length > 0) return workoutsCache;
    const local = getCachedWorkouts();
    if (local.length > 0) return local;
    throw err;
  }
}

export async function deleteWorkout(id: string) {
  try {
    await apiDeleteWorkout(id);
  } catch (e) {
    console.error("Failed to delete workout on server:", e);
  }
  const current = getCachedWorkouts().filter((w) => w.id !== id);
  workoutsCache = current;
  try {
    localStorage.setItem(WORKOUTS_CACHE_KEY, JSON.stringify(current));
  } catch {
    /* ignore */
  }
  invalidateInjuryRiskCache();
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
    } catch {
      /* ignore */
    }

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
  } catch {
    /* ignore */
  }

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