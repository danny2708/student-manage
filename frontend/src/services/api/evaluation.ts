// services/api/evaluation.ts
import api from "./api"

export interface Evaluation {
  id: number
  teacher: string
  student: string
  type: string
  date: string
}

export async function getEvaluations(): Promise<Evaluation[]> {
  const res = await api.get<Evaluation[]>("/evaluations")
  return res.data
}
