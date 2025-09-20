"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import api from "../services/api/api";
import { toast } from "react-hot-toast"; // 🆕 thêm toast
import { importUsers, deleteUser } from "../services/api/users";

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
  importFromFile: (file: File) => Promise<ImportResult | null>;
}

export interface ImportResult {
  students: Record<string, number>;
  parents: Record<string, number>;
}


// Tạo Context
export const UsersContext = createContext<UsersContextType | null>(null);

// Provider
export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
      toast.error("Không thể tải danh sách users ❌");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new user
  const addUser = useCallback(async (newUser: Partial<User>) => {
    try {
      const res = await api.post<User>("/users", newUser);
      setUsers((prev) => [...prev, res.data]);
      toast.success("Thêm user thành công 🎉");
    } catch (err: any) {
      setError(err.message || "Failed to create user");
      toast.error("Thêm user thất bại ❌");
    }
  }, []);

  // Update a user
  const editUser = useCallback(async (id: number, data: Partial<User>) => {
    try {
      const res = await api.put<User>(`/users/${id}`, data);
      setUsers((prev) => prev.map((u) => (u.user_id === id ? res.data : u)));
      toast.success("Cập nhật user thành công ✅");
    } catch (err: any) {
      setError(err.message || "Failed to update user");
      toast.error("Cập nhật user thất bại ❌");
    }
  }, []);

  // Delete a user
  const removeUser = useCallback(async (id: number) => {
    try {
      await deleteUser(id)   // ✅ gọi hàm từ users.ts
      setUsers((prev) => prev.filter((u) => u.user_id !== id))
      toast.success("Xóa user thành công 🗑️")
    } catch (err: any) {
      setError(err.message || "Failed to delete user")
      toast.error("Xóa user thất bại ❌")
    }
  }, [])


  const importFromFile = useCallback(
    async (file: File): Promise<ImportResult | null> => {
      try {
        const res = await importUsers(file);

        let importedCount = 0;
        if (res.imported?.students) {
          importedCount += Object.keys(res.imported.students).length;
        }
        if (res.imported?.parents) {
          importedCount += Object.keys(res.imported.parents).length;
        }

        if (importedCount > 0) {
          await fetchUsers();
          toast.success(`Import thành công (${importedCount} user)! 🎉`);
        } else {
          toast.error("Import thành công nhưng không có user mới ⚠️");
        }

        return res.imported;
      } catch (err: any) {
        setError(err.message || "Failed to import users");
        toast.error("Import users thất bại ❌");
        return null;
      }
    },
    [fetchUsers]
  );


  // Chỉ gọi fetchUsers một lần khi component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers,
        addUser,
        editUser,
        removeUser,
        importFromFile,
      }}
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
