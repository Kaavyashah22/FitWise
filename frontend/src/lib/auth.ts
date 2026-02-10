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

const USERS_KEY = "fitdash_users";
const SESSION_KEY = "fitdash_session";
const PROFILES_KEY = "fitdash_profiles";

/* ---------------- USERS ---------------- */

function getUsers(): Record<string, { user: User; password: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function signup(email: string, password: string, name: string): User {
  email = email.trim().toLowerCase();
  password = password.trim();

  const users = getUsers();

  if (users[email]) {
    throw new Error("User already exists");
  }

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    createdAt: new Date().toISOString(),
  };

  users[email] = { user, password };

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));

  return user;
}

export function login(email: string, password: string): User {
  email = email.trim().toLowerCase();
  password = password.trim();

  const users = getUsers();
  const entry = users[email];

  if (!entry || entry.password !== password) {
    throw new Error("Invalid credentials");
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(entry.user));

  return entry.user;
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