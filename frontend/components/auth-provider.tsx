"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";
import { clearSession, readSession, writeSession } from "@/lib/auth-storage";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = readSession();

    if (!session) {
      setLoading(false);
      return;
    }

    setUser(session.user);
    setToken(session.token);
    setLoading(false);
  }, []);

  const setSession = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    writeSession({ token: nextToken, user: nextUser });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearSession();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const profile = await api.profile(token);
      setSession(token, profile);
    } catch {
      logout();
    }
  }, [logout, setSession, token]);

  const value = useMemo(
    () => ({ user, token, loading, setSession, logout, refreshProfile }),
    [loading, logout, refreshProfile, setSession, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
