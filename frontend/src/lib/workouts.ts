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

export async function addWorkout(entry: Omit<WorkoutEntry, "id">): Promise<WorkoutEntry> {
  const data = await createWorkout({
    date: entry.date,
    name: entry.exercise,
    notes: encodeNotes(entry),
  });
  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    muscleGroup: entry.muscleGroup,
    exercise: entry.exercise,
    sets: entry.sets,
    reps: entry.reps,
    weight: entry.weight
  };
}

export async function getUserWorkouts(_userId?: string): Promise<WorkoutEntry[]> {
  const data = await apiGetWorkouts();

  return data.map((w) => {
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

export async function getWeightLogs(_userId?: string): Promise<WeightLog[]> {
  const data = await apiGetWeightLogs();
  return data.map((w) => ({
    id: w.id,
    userId: w.user_id,
    date: w.date,
    weight: w.weight_kg,
  }));
}

export async function addWeightLog(_userId: string, date: string, weight: number): Promise<WeightLog> {
  const data = await createWeightLog(date, weight);
  return {
    id: data.id,
    userId: data.user_id,
    date: data.date,
    weight: data.weight_kg
  };
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