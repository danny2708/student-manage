// hooks/useSchedules.ts
import { useEffect, useState } from "react"
import {
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../services/api/schedule"

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedules = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSchedules()
      setSchedules(data)
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách lịch học")
    } finally {
      setLoading(false)
    }
  }

  const addSchedule = async (data: ScheduleCreate) => {
    try {
      const newItem = await createSchedule(data)
      setSchedules((prev) => [...prev, newItem])
      return newItem
    } catch (err: any) {
      throw new Error(err.message || "Không thể tạo lịch học")
    }
  }

  const editSchedule = async (id: number, data: ScheduleUpdate) => {
    try {
      const updated = await updateSchedule(id, data)
      setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)))
      return updated
    } catch (err: any) {
      throw new Error(err.message || "Không thể cập nhật lịch học")
    }
  }

  const removeSchedule = async (id: number) => {
    try {
      await deleteSchedule(id)
      setSchedules((prev) => prev.filter((s) => s.id !== id))
    } catch (err: any) {
      throw new Error(err.message || "Không thể xóa lịch học")
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    addSchedule,
    editSchedule,
    removeSchedule,
  }
}
