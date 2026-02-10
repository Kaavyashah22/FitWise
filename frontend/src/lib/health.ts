import type { UserProfile } from "./auth";

export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "hsl(45, 80%, 55%)" };
  if (bmi < 25) return { label: "Normal", color: "hsl(152, 60%, 45%)" };
  if (bmi < 30) return { label: "Overweight", color: "hsl(30, 80%, 55%)" };
  return { label: "Obese", color: "hsl(0, 72%, 51%)" };
}

export function calculateBMR(profile: UserProfile): number {
  // Mifflin-St Jeor
  if (profile.gender === "male") {
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  }
  return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(profile: UserProfile): number {
  return calculateBMR(profile) * (ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.2);
}

export function getCalorieTarget(tdee: number, goal: string): number {
  if (goal === "cut") return Math.round(tdee - 500);
  if (goal === "bulk") return Math.round(tdee + 400);
  return Math.round(tdee);
}

export function validateGoal(bmi: number, goal: string): { valid: boolean; message: string } {
  if (goal === "bulk" && bmi >= 30) {
    return { valid: false, message: "Bulking is not recommended at your current BMI (Obese). Consider maintaining or cutting first." };
  }
  if (goal === "cut" && bmi < 18.5) {
    return { valid: false, message: "Cutting is not recommended at your current BMI (Underweight). Consider maintaining or bulking first." };
  }
  return { valid: true, message: "" };
}
