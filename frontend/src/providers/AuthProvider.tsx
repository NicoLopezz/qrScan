"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { fetchApi } from "@/lib/api";
import type { User } from "@/types";

const AUTH_CACHE_KEY = "pickuptime-user";

function getCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_CACHE_KEY);
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  updateUser: (fields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false,
  logout: async () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Init from cache — no loading flash if cached
  const cached = getCachedUser();
  const [user, setUser] = useState<User | null>(cached);
  const [isLoading, setIsLoading] = useState(!cached);

  // Validate with server in background
  useEffect(() => {
    fetchApi<User>("/api/me")
      .then((res) => {
        setUser(res.data);
        setCachedUser(res.data);
      })
      .catch(() => {
        setUser(null);
        setCachedUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Update user in memory + cache (without hitting DB)
  const updateUser = useCallback((fields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...fields };
      setCachedUser(updated);
      return updated;
    });
  }, []);

  const logout = async () => {
    await fetchApi("/api/logout", { method: "POST" });
    setUser(null);
    setCachedUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.permiso === "Admin",
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
