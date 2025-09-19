import api from "./api"
import { EvaluationView } from "./evaluation"

// ===== Types =====
export interface StudentBase {
  user_id: number
  parent_id?: number
}

export interface Student extends StudentBase {
  // các field khác nếu backend trả về
}

export interface StudentCreate extends StudentBase {}
export interface StudentUpdate extends StudentBase {}

export interface Enrollment {
  class_id: number
  class_name: string
  enrollment_date: string
  enrollment_status: string
}

export interface EvaluationSummary {
  total_study_point: number
  total_discipline_point: number
}

export interface TeacherReview {
  id: number
  teacher_name: string
  rating: number
  review_date: string
  review_text: string
}

// ===== CRUD Students =====
export const getStudents = async (): Promise<Student[]> => {
  const res = await api.get("/students/")
  return res.data
}

export const getStudentById = async (userId: number): Promise<Student> => {
  const res = await api.get(`/students/${userId}`)
  return res.data
}

export const createStudent = async (payload: StudentCreate): Promise<Student> => {
  const res = await api.post("/students/", payload)
  return res.data
}

export const updateStudent = async (userId: number, payload: StudentUpdate): Promise<Student> => {
  const res = await api.put(`/students/${userId}`, payload)
  return res.data
}

export const deleteStudent = async (userId: number): Promise<void> => {
  await api.delete(`/students/${userId}`)
}

// ===== Custom APIs =====
export const getEnrollmentsByStudentId = async (studentUserId: number): Promise<Enrollment[]> => {
  const res = await api.get(`/enrollments/student/${studentUserId}`)
  return res.data
}

export const getTotalScoreByStudent = async (studentUserId: number): Promise<EvaluationSummary> => {
  const res = await api.get(`/evaluations/total_score/${studentUserId}`)
  return res.data
}

export const getReviewsByStudentId = async (studentUserId: number): Promise<TeacherReview[]> => {
  const res = await api.get(`/teacher_reviews/by_student/${studentUserId}`)
  return res.data
}

export const getEvaluationsByStudent = async (studentUserId: number): Promise<EvaluationView[]> => {
  const res = await api.get(`/evaluations/student/${studentUserId}`)
  return res.data
}