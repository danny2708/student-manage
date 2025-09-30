"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import authService from "../services/authService";

/** Local user shape */
interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  roles: string[];
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; user?: User | null; error?: string }>;
  logout: () => void;
  hasAnyRole: (roles: string[]) => boolean;
  refresh: () => Promise<void>;
  // NEW: expose setAuthUser to allow trusted callers to update the current user directly
  setAuthUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>((authService as any).user ?? null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        if (typeof (authService as any).init === "function") {
          await (authService as any).init();
        }
      } catch (err) {
        console.error("authService.init() failed:", err);
      } finally {
        if (!mounted) return;
        setUser((authService as any).user ?? null);
        setLoading(false);
      }
    })();

    const handleAuthUpdate = () => {
      try {
        (authService as any).reloadFromStorage?.();
      } catch (err) {
        console.error("reloadFromStorage error:", err);
      }
      setUser((authService as any).user ?? null);
      setLoading(false);
    };

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      const relevantKeys = ["app_auth_event", "access_token", "user"];
      if (!relevantKeys.includes(e.key)) return;
      handleAuthUpdate();
    };

    const onFocus = async () => {
      try {
        await (authService as any).init?.();
      } catch {
        /* ignore */
      }
      setUser((authService as any).user ?? null);
      setLoading(false);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        onFocus();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const bc: BroadcastChannel | null =
      typeof window !== "undefined" && "BroadcastChannel" in window
        ? new BroadcastChannel("app_auth_channel")
        : null;

    const onBc = () => handleAuthUpdate();
    bc?.addEventListener("message", onBc);

    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      bc?.removeEventListener("message", onBc);
      bc?.close();
    };
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success) {
        setUser((authService as any).user ?? (res.user ?? null));
        setLoading(false);
        return { success: true, user: (authService as any).user ?? (res.user ?? null) };
      } else {
        setUser(null);
        setLoading(false);
        return { success: false, error: res.error || "Login failed" };
      }
    } catch (err: any) {
      setUser(null);
      setLoading(false);
      return { success: false, error: err?.message || "Login failed" };
    }
  };

  const logout = () => {
    try {
      authService.logout();
    } catch (e) {
      console.error("logout error:", e);
    }
    setUser(null);
  };

  const hasAnyRole = (requiredRoles: string[]) => {
    if (!user) return false;
    return requiredRoles.some((r) => user.roles.includes(r));
  };

  const refresh = async () => {
    await (authService as any).init?.();
    setUser((authService as any).user ?? null);
  };

  // Expose a safe setter so other trusted providers can update current user
  const setAuthUser = (u: User | null) => {
    setUser(u);
    try {
      // persist to authService if available
      if (typeof (authService as any).setUser === "function") {
        (authService as any).setUser(u);
      } else {
        // optional fallback persist
        if (u === null) {
          localStorage.removeItem("user");
        } else {
          localStorage.setItem("user", JSON.stringify(u));
        }
      }
    } catch (e) {
      console.warn("setAuthUser: persist failed", e);
    }

    // broadcast to other tabs/listeners (and to any listeners that rely on storage event)
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("app_auth_channel");
        bc.postMessage({ type: "auth_update", ts: Date.now() });
        bc.close();
      } else {
        // fallback: trigger a storage key change (storage event will fire in other tabs)
        localStorage.setItem("app_auth_event", String(Date.now()));
      }
    } catch (e) {
      // ignore
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !loading && !!user && !!(authService as any).token,
    loading,
    login,
    logout,
    hasAnyRole,
    refresh,
    setAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
