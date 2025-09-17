"use client"

import { useState, useEffect } from "react"
import authService, { IUser } from "../services/authService"

export function useAuth() {
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ✅ đọc user từ authService (localStorage)
    const currentUser = authService.user
    setUser(currentUser)
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const result = await authService.login({ username, password })
      if (result.success && result.user) {
        setUser(result.user)
        return result.user
      } else {
        throw new Error(result.error || "Login failed")
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  // ✅ Fix: Chuyển isAuthenticated thành một hàm
  const isAuthenticated = (): boolean => {
    return !!user
  }

  return { user, loading, error, login, logout, isAuthenticated }
}