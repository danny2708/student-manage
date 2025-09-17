"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api/api"; // axios instance với baseURL đã set sẵn

// Interface User
export interface User {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  roles?: string[];
}

// Context type
interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (newUser: Partial<User>) => Promise<void>;
  editUser: (id: number, data: Partial<User>) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
  importFromFile: (file: File) => Promise<User[]>;
}

// Tạo Context
export const UsersContext = createContext<UsersContextType | null>(null);

// Provider
export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Create a new user
  const addUser = async (newUser: Partial<User>) => {
    try {
      const res = await api.post<User>("/users", newUser);
      setUsers((prev) => [...prev, res.data]);
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
  };

  // Update a user
  const editUser = async (id: number, data: Partial<User>) => {
    try {
      const res = await api.put<User>(`/users/${id}`, data);
      setUsers((prev) => prev.map((u) => (u.user_id === id ? res.data : u)));
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    }
  };

  // Delete a user
  const removeUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  // Import users from file
  const importFromFile = async (file: File): Promise<User[]> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<User[]>("/users/import-users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUsers((prev) => [...prev, ...res.data]);
      return res.data;
    } catch (err: any) {
      setError(err.message || "Failed to import users");
      return [];
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UsersContext.Provider
      value={{ users, loading, error, fetchUsers, addUser, editUser, removeUser, importFromFile }}
    >
      {children}
    </UsersContext.Provider>
  );
};

// Hook để sử dụng context
export const useUsers = (): UsersContextType => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within <UsersProvider>");
  return ctx;
};

