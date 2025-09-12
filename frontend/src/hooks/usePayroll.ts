import { useEffect, useState } from "react"
import {
  getAllPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
  Payroll
} from "../services/api/payroll"

export function usePayrolls() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPayrolls = async () => {
    setLoading(true)
    try {
      const data = await getAllPayrolls()
      setPayrolls(data)
    } catch (err) {
      setError("Failed to fetch payrolls")
    } finally {
      setLoading(false)
    }
  }

  const addPayroll = async (payload: any) => {
    try {
      const newPayroll = await createPayroll(payload)
      setPayrolls(prev => [...prev, newPayroll])
    } catch {
      setError("Failed to create payroll")
    }
  }

  const editPayroll = async (id: number, payload: any) => {
    try {
      const updated = await updatePayroll(id, payload)
      setPayrolls(prev => prev.map(p => (p.id === id ? updated : p)))
    } catch {
      setError("Failed to update payroll")
    }
  }

  const removePayroll = async (id: number) => {
    try {
      await deletePayroll(id)
      setPayrolls(prev => prev.filter(p => p.id !== id))
    } catch {
      setError("Failed to delete payroll")
    }
  }

  useEffect(() => {
    fetchPayrolls()
  }, [])

  return { payrolls, loading, error, fetchPayrolls, addPayroll, editPayroll, removePayroll }
}
