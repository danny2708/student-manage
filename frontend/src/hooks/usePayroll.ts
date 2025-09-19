import { useState, useCallback } from "react"
import {
  getPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
  getTeacherPayrolls,
  Payroll,
  PayrollCreate, 
  PayrollUpdate
} from "../services/api/payroll"

export function usePayrolls() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPayrolls = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPayrolls()
      setPayrolls(data)
      return data; // Thêm dòng này để trả về dữ liệu
    } catch (err: any) {
      console.error("Failed to fetch payrolls:", err)
      setError("Failed to fetch all payrolls.")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTeacherPayrolls = useCallback(async (teacherUserId: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTeacherPayrolls(teacherUserId)
      setPayrolls(data)
      return data; // **Sửa: Trả về dữ liệu để có thể sử dụng bên ngoài hook**
    } catch (err: any) {
      console.error("Failed to fetch teacher's payrolls:", err)
      setError("Failed to fetch teacher's payrolls.")
    } finally {
      setLoading(false)
    }
  }, [])

  const addPayroll = useCallback(async (payload: PayrollCreate) => {
    setLoading(true)
    setError(null)
    try {
      const newPayroll = await createPayroll(payload)
      setPayrolls(prev => [...prev, newPayroll])
    } catch (err: any) {
      console.error("Failed to create payroll:", err)
      setError(err.response?.data?.detail || "Failed to create payroll.")
    } finally {
      setLoading(false)
    }
  }, [])

  const editPayroll = useCallback(async (id: number, payload: PayrollUpdate) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await updatePayroll(id, payload)
      setPayrolls(prev => prev.map(p => (p.id === id ? updated : p)))
    } catch (err: any) {
      console.error("Failed to update payroll:", err)
      setError(err.response?.data?.detail || "Failed to update payroll.")
    } finally {
      setLoading(false)
    }
  }, [])

  const removePayroll = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await deletePayroll(id)
      setPayrolls(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      console.error("Failed to delete payroll:", err)
      setError(err.response?.data?.detail || "Failed to delete payroll.")
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    payrolls,
    loading,
    error,
    fetchPayrolls,
    fetchTeacherPayrolls,
    addPayroll,
    editPayroll,
    removePayroll
  }
}
