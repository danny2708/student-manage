import { useEffect, useState } from "react"
import api from "../../src/services/api/api"

export interface TeacherReview {
  id: number
  teacher_name: string
  student_name: string
  rating: number
  review_date: string
  review_text: string
}

export function useTeacherReviews() {
  const [reviews, setReviews] = useState<TeacherReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await api.get<TeacherReview[]>("/teacher_reviews/")
        setReviews(res.data)
      } catch (err: any) {
        setError(err.message || "Failed to load reviews")
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  return { reviews, loading, error }
}
