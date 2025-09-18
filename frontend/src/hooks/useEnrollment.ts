import { useEffect, useState, useCallback } from "react"
import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  setEnrollmentInactive,
  Enrollment,
  EnrollmentCreate,
  EnrollmentUpdate,
  getEnrollmentById,
  getEnrollmentsByStudentId,
  getEnrollmentsByClassId
} from "../services/api/enrollment"

export function useEnrollment() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch tất cả enrollments
  const fetchAllEnrollments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEnrollments()
      setEnrollments(data)
    } catch (err) {
      console.error("Failed to fetch enrollments:", err)
      setError("Failed to fetch enrollments")
    } finally {
      setLoading(false)
    }
  }, [])

  // Thêm một enrollment mới
  const addEnrollment = async (payload: EnrollmentCreate) => {
    setLoading(true)
    setError(null)
    try {
      await createEnrollment(payload)
      await fetchAllEnrollments(); //Fetch lại để đồng bộ dữ liệu
    } catch (err) {
      console.error("Failed to create enrollment:", err)
      setError("Failed to create enrollment")
    } finally {
      setLoading(false)
    }
  }

  // Cập nhật một enrollment
  const editEnrollment = async (id: number, payload: EnrollmentUpdate) => {
    setLoading(true)
    setError(null)
    try {
      await updateEnrollment(id, payload)
      await fetchAllEnrollments(); // Fetch lại để đồng bộ dữ liệu
    } catch (err) {
      console.error("Failed to update enrollment:", err)
      setError("Failed to update enrollment")
    } finally {
      setLoading(false)
    }
  }

  // Xoá enrollment (set status inactive)
  const removeEnrollment = async (studentId: number, classId: number) => {
    setLoading(true)
    setError(null)
    try {
      await setEnrollmentInactive(studentId, classId)
      await fetchAllEnrollments(); // ⬅️ Fetch lại để đồng bộ dữ liệu
    } catch (err) {
      console.error("Failed to remove enrollment:", err)
      setError("Failed to remove enrollment")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllEnrollments()
  }, [fetchAllEnrollments])

  return {
    enrollments,
    loading,
    error,
    fetchAllEnrollments,
    addEnrollment,
    editEnrollment,
    removeEnrollment,
    getEnrollmentById,
    getEnrollmentsByStudentId,
    getEnrollmentsByClassId,
  }
}