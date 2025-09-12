// hooks/useUsers.ts
import { useState, useEffect } from "react"
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  importUsers,
  User,
} from "../services/api/user"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // load danh sách users ban đầu
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addUser = async (newUser: Partial<User>) => {
    const created = await createUser(newUser)
    setUsers((prev) => [...prev, created])
  }

  const editUser = async (id: number, data: Partial<User>) => {
    const updated = await updateUser(id, data)
    setUsers((prev) => prev.map((u) => (u.user_id === id ? updated : u)))
  }

  const removeUser = async (id: number) => {
    await deleteUser(id)
    setUsers((prev) => prev.filter((u) => u.user_id !== id))
  }

  const getUser = async (id: number) => {
    return await getUserById(id)
  }

  const importFromFile = async (file: File) => {
    return await importUsers(file)
  }

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
  }
}
