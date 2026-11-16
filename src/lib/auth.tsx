import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { LoginInput } from "../shared";
import { http, refreshSession, setAccessToken, setOnUnauthorized } from "./api";

type User = { sub?: string; id?: string; email: string; role: string };
type AuthState = {
  user: User | null;
  ready: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOnUnauthorized(() => {
      setAccessToken(null);
      setUser(null);
    });
    // Restore the session from the refresh cookie on page load
    refreshSession()
      .then(async (ok) => {
        if (ok) setUser((await http.get<{ user: User }>("/auth/me")).user);
      })
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const res = await http.post<{ accessToken: string; user: User }>("/auth/login", input);
    setAccessToken(res.accessToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await http.post("/auth/logout").catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
