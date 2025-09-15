// services/api/class.ts
import api from "./api"

export interface Class {
  class_id: number
  class_name: string
  teacher_name?: string
  subject_id?: number
  capacity?: number
  fee?: number
}

export interface ClassCreate {
  class_name: string
  teacher_user_id?: number
  subject_id?: number
  capacity?: number
  fee?: number
}

export interface ClassUpdate {
  class_name?: string
  teacher_user_id?: number
  subject_id?: number
  capacity?: number
  fee?: number
}

// Lấy danh sách tất cả lớp học
export async function getClasses(): Promise<Class[]> {
  const res = await api.get<Class[]>("/classes")
  return res.data
}

// Lấy chi tiết 1 lớp học
export async function getClassById(id: number): Promise<Class> {
  const res = await api.get<Class>(`/classes/${id}`)
  return res.data
}

// Tạo mới lớp học
export async function createClass(data: ClassCreate): Promise<Class> {
  const res = await api.post<Class>("/classes", data)
  return res.data
}

// Cập nhật lớp học
export async function updateClass(id: number, data: ClassUpdate): Promise<Class> {
  const res = await api.put<Class>(`/classes/${id}`, data)
  return res.data
}

// Xoá lớp học
export async function deleteClass(id: number): Promise<void> {
  await api.delete(`/classes/${id}`)
}
