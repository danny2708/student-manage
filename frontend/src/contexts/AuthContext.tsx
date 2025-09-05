"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import authService from "../services/authService"

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
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs once to set the initial state from authService
    setUser(authService.user);
    setLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    const result = await authService.login(credentials);
    if (result.success) {
      setUser(result.user as User);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Function to check if the user has any of the required roles
  const hasAnyRole = (requiredRoles: string[]): boolean => {
    if (!user) return false;
    return requiredRoles.some(role => user.roles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading, hasAnyRole }}>
      {children}
    </AuthContext.Provider>
  );
};
