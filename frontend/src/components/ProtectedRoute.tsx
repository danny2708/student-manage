"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

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

  useEffect(() => {
    // Chỉ chuyển hướng nếu không trong trạng thái loading và chưa được xác thực
    if (!loading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return <div>Loading...</div>
  }

  // Nếu người dùng chưa được xác thực, không cần hiển thị gì thêm
  // useEffect sẽ xử lý việc chuyển hướng
  if (!isAuthenticated) {
    return null
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default ProtectedRoute