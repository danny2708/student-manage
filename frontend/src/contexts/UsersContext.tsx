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
  User as UserType,
  UserViewDetails,
  UserCreate as UserCreateType,
  UserUpdate as UserUpdateType,
  UpdatePasswordRequest,
  ImportUsersResponse,
} from "../services/api/users";

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
      const res = await getUsers();
      setUsers(res);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
      toast.error("Không thể tải danh sách users ❌");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get user details by ID
  const getUserDetails = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const userDetails = await getUserById(id);
      return userDetails;
    } catch (err: any) {
      setError(err.message || "Failed to fetch user details");
      toast.error("Không thể tải thông tin user ❌");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new user
  const addUser = useCallback(async (newUser: UserCreateType) => {
    try {
      const res = await createUser(newUser);
      setUsers((prev) => [...prev, res]);
      toast.success("Thêm user thành công 🎉");
    } catch (err: any) {
      setError(err.message || "Failed to create user");
      toast.error("Thêm user thất bại ❌");
    }
  }, []);

  // Update a user
  const editUser = useCallback(async (id: number, data: UserUpdateType) => {
    try {
      const res = await updateUser(id, data);
      setUsers((prev) => prev.map((u) => (u.user_id === id ? res : u)));
      toast.success("Cập nhật user thành công ✅");
    } catch (err: any) {
      setError(err.message || "Failed to update user");
      toast.error("Cập nhật user thất bại ❌");
    }
  }, []);

  // Update user password
  const updatePassword = useCallback(async (id: number, data: UpdatePasswordRequest) => {
    try {
      await updateUserPassword(id, data);
      toast.success("Cập nhật mật khẩu thành công ✅");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
      toast.error("Cập nhật mật khẩu thất bại ❌");
    }
  }, []);

  // Delete a user
  const removeUser = useCallback(async (id: number) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
      toast.success("Xóa user thành công 🗑️");
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
      toast.error("Xóa user thất bại ❌");
    }
  }, []);


  const importFromFile = useCallback(
    async (file: File): Promise<ImportUsersResponse | null> => {
      try {
        const res = await importUsers(file);

        let importedCount = Object.keys(res.imported).length;

        if (importedCount > 0) {
          await fetchUsers();
          toast.success(`Import thành công (${importedCount} user)! 🎉`);
        } else {
          toast.error("Import thành công nhưng không có user mới ⚠️");
        }

        return res;
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
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within <UsersProvider>");
  return ctx;
};
