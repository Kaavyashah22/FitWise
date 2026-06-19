const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const TOKEN_KEY = "fitwise_access_token";
const SESSION_KEY = "fitwise_session_user";

export type ApiUser = {
  id: string;
  email?: string | null;
  display_name: string;
  created_at: string;
};

type TokenResponse = {
  access_token: string;
  token_type: "bearer" | string;
};

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): ApiUser | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as ApiUser) : null;
}

export function setStoredUser(user: ApiUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(SESSION_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = false, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };

  if (!finalHeaders["Content-Type"] && rest.body) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...rest,
    headers: finalHeaders,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = (isJson ? await res.json() : await res.text()) as any;

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    const msg =
      (data && typeof data === "object" && "detail" in data && (data.detail as string)) ||
      (typeof data === "string" ? data : "Request failed");
    throw new Error(msg);
  }

  return data as T;
}

export async function register(email: string, password: string, display_name: string) {
  const token = await request<TokenResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, display_name }),
  });
  setAccessToken(token.access_token);
  return token;
}

export async function login(email: string, password: string) {
  const token = await request<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(token.access_token);
  return token;
}

export async function loginWithGoogleAPI(token: string) {
  const tokenResp = await request<TokenResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  setAccessToken(tokenResp.access_token);
  return tokenResp;
}

export async function getCurrentUser() {
  const user = await request<ApiUser>("/auth/me", { auth: true });
  setStoredUser(user);
  return user;
}

export async function updateUserNameAPI(displayName: string) {
  const user = await request<ApiUser>("/auth/me", {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ display_name: displayName }),
  });
  setStoredUser(user);
  return user;
}

export type ApiWorkout = {
  id: string;
  user_id: string;
  date: string;
  name: string | null;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function getWorkouts() {
  return request<ApiWorkout[]>("/workouts", { auth: true });
}

export async function createWorkout(workout: { date: string; name?: string | null; notes?: string | null }) {
  return request<ApiWorkout>("/workouts", {
    method: "POST",
    auth: true,
    body: JSON.stringify(workout),
  });
}

export type ApiWeightLog = {
  id: string;
  user_id: string;
  date: string;
  weight_kg: number;
  created_at?: string | null;
};

export async function getWeightLogs() {
  return request<ApiWeightLog[]>("/weight-logs", { auth: true });
}

export async function createWeightLog(date: string, weight: number) {
  return request<ApiWeightLog>("/weight-logs", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ date, weight_kg: weight }),
  });
}


export interface PredictPayload {
  age: number;
  height: number;
  weight: number;
  gender: string;
  activity: string;
  goal: string;
  food_type?: string;
  medical_history?: string;
}

export async function createPlan(payload: PredictPayload) {
  return request<any>("/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ApiProfile = {
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  gender?: string;
  activity_level?: string;
  goal?: string;
  food_preference?: string;
  medical_history?: string;
};

export async function getProfileAPI() {
  return request<ApiProfile>("/api/v1/profile", { auth: true });
}

export async function saveProfileAPI(profile: ApiProfile) {
  return request<ApiProfile>("/api/v1/profile", {
    method: "POST",
    auth: true,
    body: JSON.stringify(profile),
  });
}

export type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
};

export async function getCoachHistory() {
  return request<ChatMessage[]>("/api/v1/coach/history", { auth: true });
}

export async function clearChatAPI() {
  return request<{ status: string; message: string }>("/api/v1/coach/history", {
    method: "DELETE",
    auth: true,
  });
}

export async function chatWithCoach(message: string) {
  return request<{ reply: string }>("/api/v1/coach/chat", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ message }),
  });
}

