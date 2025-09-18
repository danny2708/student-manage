import { useEffect, useState, useCallback } from "react"
import {
  getPayrolls,
  createPayroll,
  updatePayroll,
  deletePayroll,
  Payroll
} from "../services/api/payroll"

export function usePayrolls() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPayrolls = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPayrolls()
      setPayrolls(data)
    } catch (err) {
      console.error("Failed to fetch payrolls:", err)
      setError("Failed to fetch payrolls")
    } finally {
      setLoading(false)
    }
  }, [])

  const addPayroll = async (payload: any) => {
    try {
      const newPayroll = await createPayroll(payload)
      setPayrolls(prev => [...prev, newPayroll])
    } catch (err) {
      console.error("Failed to create payroll:", err)
      setError("Failed to create payroll")
    }
  }

  const editPayroll = async (id: number, payload: any) => {
    try {
      const updated = await updatePayroll(id, payload)
      setPayrolls(prev => prev.map(p => (p.id === id ? updated : p)))
    } catch (err) {
      console.error("Failed to update payroll:", err)
      setError("Failed to update payroll")
    }
  }

  const removePayroll = async (id: number) => {
    try {
      await deletePayroll(id)
      setPayrolls(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error("Failed to delete payroll:", err)
      setError("Failed to delete payroll")
    }
  }

  useEffect(() => {
    fetchPayrolls()
  }, [fetchPayrolls])

  return {
    payrolls,
    loading,
    error,
    fetchPayrolls,
    addPayroll,
    editPayroll,
    removePayroll
  }
}
