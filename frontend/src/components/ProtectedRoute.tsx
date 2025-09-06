"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback = <div>Access Denied</div>,
}) => {
  const { isAuthenticated, hasAnyRole, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    router.replace("/login")
    return null
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default ProtectedRoute
