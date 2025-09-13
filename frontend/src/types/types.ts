// src/types.ts

export type EntityType =
  | "user"
  | "class"
  | "payroll"
  | "tuition"
  | "subject"
  | "schedule"
  | "evaluation"
  | "teacherReview"

// ----- Entities -----
export interface User {
  id: string
  fullName: string
  email: string
  role: string
}

export interface Class {
  class_id: string
  class_name: string
  teacher_name?: string
  max_students?: number
  fee?: number
}

export interface Payroll {
  id: string
  teacher: string
  amount: number
  date: string
}

export interface Tuition {
  id: string
  studentName: string
  amount: number
  dueDate: string
}

export interface Subject {
  id: string
  name: string
  description?: string
}

export interface Schedule {
  id: string
  className: string
  dayOfWeek: string
  time: string
}

export interface Evaluation {
  id: string
  studentName: string
  subject: string
  score: number
}

export interface TeacherReview {
  id: string
  teacherName: string
  rating: number
  comment?: string
}

export interface ActionModalProps<T = any> {
  type: EntityType
  data: T
  onClose: () => void
  onShowInfo: (type: EntityType, data: T) => void
  onDelete: (type: EntityType, data: T) => void
}
