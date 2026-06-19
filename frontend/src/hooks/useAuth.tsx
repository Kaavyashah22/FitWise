import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getSession, logout as doLogout, setSession } from "@/lib/auth";
import { clearAccessToken, clearStoredUser, getCurrentUser, getStoredUser, login, register, loginWithGoogleAPI, updateUserNameAPI } from "@/lib/apiClient";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  isLoggingIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
  useEffect(() => {
    const handleUnauthorized = () => {
      
      doLogout();
      clearAccessToken();
      clearStoredUser();
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const doLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
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
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoggingIn(true);
    try {
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
    } finally {
      setIsLoggingIn(false);
    }
  };

  const doLoginWithGoogle = async (token: string) => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogleAPI(token);
      const me = await getCurrentUser();
      const u: User = {
        id: me.id,
        email: me.email || "",
        name: me.display_name,
        createdAt: me.created_at,
      };
      setSession(u);
      setUser(u);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const updateName = async (name: string) => {
    const updatedApiUser = await updateUserNameAPI(name);
    const u: User = {
      id: updatedApiUser.id,
      email: updatedApiUser.email || "",
      name: updatedApiUser.display_name,
      createdAt: updatedApiUser.created_at,
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
    <AuthContext.Provider value={{ user, loading, isLoggingIn, login: doLogin, signup, logout, loginWithGoogle: doLoginWithGoogle, updateName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
