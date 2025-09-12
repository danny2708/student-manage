// services/api/tuition.ts
import api from "./api"

export interface Tuition {
  id: number
  student: string
  amount: number
  term: number
  status: "paid" | "pending" | "overdue"
  due_date: string
}

export interface TuitionCreate {
  student_user_id: number
  amount: number
  term: number
  due_date: string
}

export interface TuitionUpdate {
  amount?: number
  term?: number
  due_date?: string
}

export async function getTuitions(): Promise<Tuition[]> {
  const res = await api.get<Tuition[]>("/tuitions")
  return res.data
}

export async function getTuitionById(id: number): Promise<Tuition> {
  const res = await api.get<Tuition>(`/tuitions/${id}`)
  return res.data
}

export async function createTuition(data: TuitionCreate): Promise<Tuition> {
  const res = await api.post<Tuition>("/tuitions", data)
  return res.data
}

export async function updateTuition(id: number, data: TuitionUpdate): Promise<Tuition> {
  const res = await api.put<Tuition>(`/tuitions/${id}`, data)
  return res.data
}

export async function updateTuitionStatus(id: number, status: "paid" | "pending" | "overdue"): Promise<Tuition> {
  const res = await api.patch<Tuition>(`/tuitions/${id}/status`, { payment_status: status })
  return res.data
}

export async function deleteTuition(id: number): Promise<void> {
  await api.delete(`/tuitions/${id}`)
}
