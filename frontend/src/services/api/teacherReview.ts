import api from "./api"

export interface TeacherReview {
  id: number
  rating: number
  review_text: string
  teacher_full_name?: string
  student_full_name?: string
}

export const getTeacherReviews = async (): Promise<TeacherReview[]> => {
  const res = await api.get<TeacherReview[]>("/teacher_reviews")
  return res.data
}
