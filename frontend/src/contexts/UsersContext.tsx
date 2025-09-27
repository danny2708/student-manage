"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "react-hot-toast";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  importUsers,
  updateUserPassword,
  UserViewDetails,
  UserCreate as UserCreateType,
  UserUpdate as UserUpdateType,
  UpdatePasswordRequest,
  ImportUsersResponse,
} from "../services/api/users";
import { useAuth } from "./AuthContext"; // <-- guard auth

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
  getUserDetails: (id: number) => Promise<UserViewDetails | null>;
  addUser: (newUser: UserCreateType) => Promise<void>;
  editUser: (id: number, data: UserUpdateType) => Promise<void>;
  updatePassword: (id: number, data: UpdatePasswordRequest) => Promise<void>;
  removeUser: (id: number) => Promise<void>;
  importFromFile: (file: File) => Promise<ImportUsersResponse | null>;
}

// Tạo Context
const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Provider
export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // auth guard from AuthContext
  const { loading: authLoading, isAuthenticated } = useAuth();

  // Fetch all users; safe to call only when authenticated
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) {
      // don't call API if not authenticated
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      setUsers(res ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch users");
      toast.error("Không thể tải danh sách users ❌");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Get user details by ID
  const getUserDetails = useCallback(
    async (id: number) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để xem thông tin user.");
        return null;
      }
      setLoading(true);
      try {
        return await getUserById(id);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch user details");
        toast.error("Không thể tải thông tin user ❌");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Create a new user
  const addUser = useCallback(
    async (newUser: UserCreateType) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        throw new Error("Unauthorized");
      }
      try {
        const res = await createUser(newUser);
        setUsers((prev) => [...prev, res]);
        toast.success("Thêm user thành công 🎉");
      } catch (err: any) {
        setError(err?.message || "Failed to create user");
        toast.error("Thêm user thất bại ❌");
        throw err;
      }
    },
    [isAuthenticated]
  );

  // Update a user
  const editUser = useCallback(
    async (id: number, data: UserUpdateType) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        throw new Error("Unauthorized");
      }
      try {
        const res = await updateUser(id, data);
        setUsers((prev) => prev.map((u) => (u.user_id === id ? res : u)));
        toast.success("Cập nhật user thành công ✅");
      } catch (err: any) {
        setError(err?.message || "Failed to update user");
        toast.error("Cập nhật user thất bại ❌");
        throw err;
      }
    },
    [isAuthenticated]
  );

  // Update user password
  const updatePassword = useCallback(
    async (id: number, data: UpdatePasswordRequest) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        throw new Error("Unauthorized");
      }
      try {
        await updateUserPassword(id, data);
        toast.success("Cập nhật mật khẩu thành công ✅");
      } catch (err: any) {
        setError(err?.message || "Failed to update password");
        toast.error("Cập nhật mật khẩu thất bại ❌");
        throw err;
      }
    },
    [isAuthenticated]
  );

  // Delete a user
  const removeUser = useCallback(
    async (id: number) => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        throw new Error("Unauthorized");
      }
      try {
        await deleteUser(id);
        setUsers((prev) => prev.filter((u) => u.user_id !== id));
        toast.success("Xóa user thành công 🗑️");
      } catch (err: any) {
        setError(err?.message || "Failed to delete user");
        toast.error("Xóa user thất bại ❌");
        throw err;
      }
    },
    [isAuthenticated]
  );

  // Import users from file
  const importFromFile = useCallback(
    async (file: File): Promise<ImportUsersResponse | null> => {
      if (!isAuthenticated) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này.");
        return null;
      }
      try {
        const res = await importUsers(file);
        const importedCount = Object.keys(res.imported).length;

        if (importedCount > 0) {
          await fetchUsers();
          toast.success(`Import thành công (${importedCount} user)! 🎉`);
        } else {
          toast.error("Import thành công nhưng không có user mới ⚠️");
        }

        return res;
      } catch (err: any) {
        setError(err?.message || "Failed to import users");
        toast.error("Import users thất bại ❌");
        return null;
      }
    },
    [fetchUsers, isAuthenticated]
  );

  // ---------- AUTH GUARD ----------
  // Only fetch users when auth has finished initializing and user is authenticated.
  // If auth init done but NOT authenticated -> clear users & don't fetch.
  useEffect(() => {
    if (authLoading) {
      // auth still initializing -> do nothing
      return;
    }

    if (!isAuthenticated) {
      // not logged in: clear state and don't call API
      setUsers([]);
      setError(null);
      setLoading(false);
      return;
    }

    // auth ready and authenticated -> safe to fetch
    fetchUsers();
  }, [authLoading, isAuthenticated, fetchUsers]);

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers,
        getUserDetails,
        addUser,
        editUser,
        updatePassword,
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
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
};
