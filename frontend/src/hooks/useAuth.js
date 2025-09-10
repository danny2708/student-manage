import { useEffect, useState } from "react"
import authService from "../services/authService"

export default function useAuth() {
  const [user, setUser] = useState(authService.user)
  const [loading, setLoading] = useState(!authService.user)

  useEffect(() => {
    if (!authService.token) {
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const profile = await authService.getCurrentUser()
        setUser(profile)
      } catch (err) {
        console.error(err)
        authService.logout()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}
