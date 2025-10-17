<<<<<<< HEAD
﻿"use client";
=======
<<<<<<< HEAD
"use client";
=======
﻿"use client";
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge

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
<<<<<<< HEAD
=======
<<<<<<< HEAD
  logout: () => void;
  hasAnyRole: (roles: string[]) => boolean;
  refresh: () => Promise<void>;
  // NEW: expose setAuthUser to allow trusted callers to update the current user directly
  setAuthUser: (u: User | null) => void;
=======
>>>>>>> temp-merge
  loginWithGoogle: (code: string) => Promise<{ success: boolean; user?: User | null; error?: string }>;
  logout: () => void;
  hasAnyRole: (roles: string[]) => boolean;
  refresh: () => Promise<void>;
  setAuthUser: (u: User | null) => void;
  handleLoginSuccess: (roles: string[], router: any) => void;
  
<<<<<<< HEAD
=======
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
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

<<<<<<< HEAD
    const initAuth = async () => {
=======
<<<<<<< HEAD
    (async () => {
=======
    const initAuth = async () => {
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
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
<<<<<<< HEAD
    };

    initAuth();
=======
<<<<<<< HEAD
    })();
=======
    };

    initAuth();
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge

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
<<<<<<< HEAD
      } catch {}
=======
<<<<<<< HEAD
      } catch {
        /* ignore */
      }
=======
      } catch {}
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
      setUser((authService as any).user ?? null);
      setLoading(false);
    };

    const onVisibility = () => {
<<<<<<< HEAD
      if (document.visibilityState === "visible") onFocus();
=======
<<<<<<< HEAD
      if (document.visibilityState === "visible") {
        onFocus();
      }
=======
      if (document.visibilityState === "visible") onFocus();
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
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

<<<<<<< HEAD
  // login bằng username/password
=======
<<<<<<< HEAD
=======
  // login bằng username/password
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      if (res.success) {
<<<<<<< HEAD
        setUser(res.user ?? null);
        setLoading(false);
        return { success: true, user: res.user ?? null };
=======
<<<<<<< HEAD
        setUser((authService as any).user ?? (res.user ?? null));
        setLoading(false);
        return { success: true, user: (authService as any).user ?? (res.user ?? null) };
=======
        setUser(res.user ?? null);
        setLoading(false);
        return { success: true, user: res.user ?? null };
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> temp-merge
  // login bằng Google SSO
  const loginWithGoogle = async (code: string) => {
    setLoading(true);
    try {
      const res = await authService.loginWithGoogle(code);
      if (res.success) {
        setUser(res.user ?? null);
        setLoading(false);
        return { success: true, user: res.user ?? null };
      } else {
        setUser(null);
        setLoading(false);
        return { success: false, error: res.error || "Google login failed" };
      }
    } catch (err: any) {
      setUser(null);
      setLoading(false);
      return { success: false, error: err?.message || "Google login failed" };
    }
  };

  const handleLoginSuccess = (roles: string[], router: any) => {
  if (roles.length === 1) {
    router.push(`/${roles[0]}-dashboard`);
  } else if (roles.length > 1) {
    router.push("/select-role"); // có thể tuỳ chỉnh
  } else {
    router.push("/login");
  }
};

<<<<<<< HEAD
=======
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
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

<<<<<<< HEAD
=======
<<<<<<< HEAD
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
=======
>>>>>>> temp-merge
  const setAuthUser = (u: User | null) => {
    setUser(u);
    try {
      if (typeof (authService as any).setUser === "function") {
        (authService as any).setUser(u);
      } else {
        if (u === null) localStorage.removeItem("user");
        else localStorage.setItem("user", JSON.stringify(u));
<<<<<<< HEAD
=======
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
      }
    } catch (e) {
      console.warn("setAuthUser: persist failed", e);
    }

<<<<<<< HEAD
=======
<<<<<<< HEAD
    // broadcast to other tabs/listeners (and to any listeners that rely on storage event)
=======
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("app_auth_channel");
        bc.postMessage({ type: "auth_update", ts: Date.now() });
        bc.close();
      } else {
<<<<<<< HEAD
        localStorage.setItem("app_auth_event", String(Date.now()));
      }
    } catch {}
=======
<<<<<<< HEAD
        // fallback: trigger a storage key change (storage event will fire in other tabs)
        localStorage.setItem("app_auth_event", String(Date.now()));
      }
    } catch (e) {
      // ignore
    }
=======
        localStorage.setItem("app_auth_event", String(Date.now()));
      }
    } catch {}
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !loading && !!user && !!(authService as any).token,
    loading,
    login,
<<<<<<< HEAD
    loginWithGoogle,
=======
<<<<<<< HEAD
=======
    loginWithGoogle,
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
    logout,
    hasAnyRole,
    refresh,
    setAuthUser,
<<<<<<< HEAD
    handleLoginSuccess,
=======
<<<<<<< HEAD
=======
    handleLoginSuccess,
>>>>>>> bb0dd92 (add gg auth)
>>>>>>> temp-merge
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
