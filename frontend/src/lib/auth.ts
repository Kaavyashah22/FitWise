export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "cut" | "bulk" | "maintain";
}

const SESSION_KEY = "fitwise_session";
const PROFILES_KEY = "fitwise_profiles";

export function setSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

/* ---------------- PROFILES ---------------- */

export function saveProfile(profile: UserProfile) {
  const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
  profiles[profile.userId] = profile;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getProfile(userId: string): UserProfile | null {
  const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}");
  return profiles[userId] || null;
}