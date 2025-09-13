// File: src/hooks/useAuth.ts
"use client"

import { useState, useEffect } from "react"
import { login as loginApi, LoginResponse } from "../services/api/auth"

export function useAuth() {
  const [user, setUser] = useState<LoginResponse | null | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const rawUserInfo = localStorage.getItem("user_info")
    if (rawUserInfo) {
      try {
        const parsedUser = JSON.parse(rawUserInfo) as LoginResponse
        setUser(parsedUser)
      } catch (e) {
        console.error("Error parsing user_info from localStorage:", e)
        localStorage.removeItem("user_info")
        localStorage.removeItem("access_token")
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const data: LoginResponse = await loginApi({ username, password })
      setUser(data)
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("user_info", JSON.stringify(data))
      return data
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_info")
  }

  const isAuthenticated = user !== undefined && user !== null

  return { user, loading, error, login, logout, isAuthenticated }
}
