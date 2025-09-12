// hooks/useTuitions.ts
import { useEffect, useState } from "react"
import { getTuitions, Tuition, createTuition, updateTuition, deleteTuition, updateTuitionStatus } from "../services/api/tuition"

export function useTuitions() {
  const [tuitions, setTuitions] = useState<Tuition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchTuitions() {
    try {
      setLoading(true)
      const data = await getTuitions()
      setTuitions(data)
    } catch (err) {
      setError("Failed to fetch tuitions")
    } finally {
      setLoading(false)
    }
  }

  async function addTuition(newData: any) {
    const created = await createTuition(newData)
    setTuitions((prev) => [...prev, created])
  }

  async function editTuition(id: number, updatedData: any) {
    const updated = await updateTuition(id, updatedData)
    setTuitions((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function changeStatus(id: number, status: "paid" | "pending" | "overdue") {
    const updated = await updateTuitionStatus(id, status)
    setTuitions((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function removeTuition(id: number) {
    await deleteTuition(id)
    setTuitions((prev) => prev.filter((t) => t.id !== id))
  }

  useEffect(() => {
    fetchTuitions()
  }, [])

  return { tuitions, loading, error, addTuition, editTuition, removeTuition, changeStatus, refetch: fetchTuitions }
}
