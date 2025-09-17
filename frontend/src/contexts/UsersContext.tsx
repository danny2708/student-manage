// src/contexts/UsersContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api/api";

export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  roles?: string[];
}

interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  importFromFile: (file: File) => Promise<any>;
}

export const UsersContext = createContext<UsersContextType | null>(null);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const importFromFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/users/import-users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchUsers(); // refresh list after import
    return res.data;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UsersContext.Provider value={{ users, loading, error, fetchUsers, importFromFile }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within <UsersProvider>");
  return ctx;
};
