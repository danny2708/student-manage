// hooks/useTuitions.ts
import { useEffect, useState } from "react"
import { getTuitions, Tuition, createTuition, updateTuition, deleteTuition, updateTuitionStatus } from "../services/api/tuition"

export function useTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hàm fetch data ban đầu
  async function fetchTuitions() {
    setLoading(true)
    setError(null)
    try {
      const data = await getTuitions()
      setTuitions(data)
    } catch (err) {
      setError("Không thể tải danh sách học phí.")
    } finally {
      setLoading(false)
    }
  }

  // Hàm thêm học phí với xử lý lỗi
  async function addTuition(newData: any) {
    try {
      setLoading(true)
      const created = await createTuition(newData)
      setTuitions((prev) => [...prev, created])
      setError(null) // Xóa lỗi nếu thao tác thành công
    } catch (err) {
      setError("Thêm học phí thất bại.")
    } finally {
      setLoading(false)
    }
  }

  // Hàm chỉnh sửa học phí với xử lý lỗi
  async function editTuition(id: number, updatedData: any) {
    try {
      setLoading(true)
      const updated = await updateTuition(id, updatedData)
      setTuitions((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setError(null)
    } catch (err) {
      setError("Chỉnh sửa học phí thất bại.")
    } finally {
      setLoading(false)
    }
  }

  // Hàm thay đổi trạng thái với xử lý lỗi
  async function changeStatus(id: number, status: "paid" | "pending" | "overdue") {
    try {
      setLoading(true)
      const updated = await updateTuitionStatus(id, { payment_status: status })
      setTuitions((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setError(null)
    } catch (err) {
      setError("Cập nhật trạng thái thất bại.")
    } finally {
      setLoading(false)
    }
  }

  // Hàm xóa học phí với xử lý lỗi
  async function removeTuition(id: number) {
    try {
      setLoading(true)
      await deleteTuition(id)
      setTuitions((prev) => prev.filter((t) => t.id !== id))
      setError(null)
    } catch (err) {
      setError("Xóa học phí thất bại.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch dữ liệu khi component được mount
  useEffect(() => {
    fetchTuitions()
  }, [])

  // Trả về state và các hàm thao tác
  // hooks/useTuitions.ts

  return { 
    tuitions, 
    loading, 
    error, 
    addTuition, 
    editTuition, 
    removeTuition, 
    changeStatus, 
    fetchTuitions, 
  }
}