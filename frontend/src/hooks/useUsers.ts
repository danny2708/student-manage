// hooks/useUsers.ts
import { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  importUsers,
  User,
} from "../services/api/users";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gói fetchUsers trong useCallback để đảm bảo nó chỉ được tạo một lần
  // và không thay đổi giữa các lần render
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // Mảng dependencies rỗng, hàm sẽ không bao giờ thay đổi

  // load danh sách users ban đầu
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Bây giờ [fetchUsers] sẽ hoạt động đúng

  const addUser = async (newUser: Partial<User>) => {
    const created = await createUser(newUser);
    setUsers((prev) => [...prev, created]);
  };

  const editUser = async (id: number, data: Partial<User>) => {
    const updated = await updateUser(id, data);
    setUsers((prev) => prev.map((u) => (u.user_id === id ? updated : u)));
  };

  const removeUser = async (id: number) => {
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.user_id !== id));
  };

  const getUser = async (id: number) => {
    return await getUserById(id);
  };

  const importFromFile = async (file: File) => {
    return await importUsers(file);
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    editUser,
    removeUser,
    getUser,
    importFromFile,
  };
}