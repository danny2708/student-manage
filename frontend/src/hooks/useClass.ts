// hooks/useClasses.ts
import { useEffect, useState } from "react"
import {
  Class,
  ClassCreate,
  ClassUpdate,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} from "../services/api/class"

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Gọi API lấy danh sách lớp học
  const fetchClasses = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getClasses()
      setClasses(data)
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách lớp học")
    } finally {
      setLoading(false)
    }
  }

  // Thêm mới lớp học
  const addClass = async (data: ClassCreate) => {
    try {
      const newClass = await createClass(data)
      setClasses((prev) => [...prev, newClass])
      return newClass
    } catch (err: any) {
      throw new Error(err.message || "Không thể tạo lớp học")
    }
  }

  // Cập nhật lớp học
  const editClass = async (id: number, data: ClassUpdate) => {
    try {
      const updated = await updateClass(id, data)
      setClasses((prev) => prev.map((c) => (c.class_id === id ? updated : c)))
      return updated
    } catch (err: any) {
      throw new Error(err.message || "Không thể cập nhật lớp học")
    }
  }

  // Xoá lớp học
  const removeClass = async (id: number) => {
    try {
      await deleteClass(id)
      setClasses((prev) => prev.filter((c) => c.class_id !== id))
    } catch (err: any) {
      throw new Error(err.message || "Không thể xóa lớp học")
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  return {
    classes,
    loading,
    error,
    fetchClasses,
    addClass,
    editClass,
    removeClass,
  }
}
