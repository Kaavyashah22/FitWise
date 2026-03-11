import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getSession, logout as doLogout, setSession } from "@/lib/auth";
import { clearAccessToken, clearStoredUser, getCurrentUser, getStoredUser, login, register } from "@/lib/apiClient";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = getStoredUser();
        if (stored) {
          const u: User = {
            id: stored.id,
            email: stored.email || "",
            name: stored.display_name,
            createdAt: stored.created_at,
          };
          setSession(u);
          setUser(u);
        } else {
          const session = getSession();
          if (session) setUser(session);
        }

        // If we have a token, confirm session via /auth/me
        try {
          const me = await getCurrentUser();
          const u: User = {
            id: me.id,
            email: me.email || "",
            name: me.display_name,
            createdAt: me.created_at,
          };
          setSession(u);
          setUser(u);
        } catch {
          // token invalid or missing; keep existing local session if any
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const doLogin = async (email: string, password: string) => {
    await login(email, password);
    const me = await getCurrentUser();
    const u: User = {
      id: me.id,
      email: me.email || "",
      name: me.display_name,
      createdAt: me.created_at,
    };
    setSession(u);
    setUser(u);
  };

  const signup = async (email: string, password: string, name: string) => {
    await register(email, password, name);
    const me = await getCurrentUser();
    const u: User = {
      id: me.id,
      email: me.email || "",
      name: me.display_name,
      createdAt: me.created_at,
    };
    setSession(u);
    setUser(u);
  };

  const logout = () => {
    doLogout();
    clearAccessToken();
    clearStoredUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: doLogin, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
