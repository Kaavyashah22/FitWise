import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getSession, login as doLogin, signup as doSignup, logout as doLogout } from "@/lib/auth";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => void;
  signup: (email: string, password: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const u = doLogin(email, password);
    setUser(u);
  };

  const signup = (email: string, password: string, name: string) => {
    const u = doSignup(email, password, name);
    setUser(u);
  };

  const logout = () => {
    doLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
