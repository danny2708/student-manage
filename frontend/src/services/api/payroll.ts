import api from "./api"

export interface Payroll {
  id: number
  teacher: string
  base_salary: number
  bonus: number
  total: number
  status: string
  sent_at: string
}

export const getAllPayrolls = async (): Promise<Payroll[]> => {
  const res = await api.get("/payrolls/")
  return res.data
}

export const getPayrollById = async (id: number): Promise<Payroll> => {
  const res = await api.get(`/payrolls/${id}`)
  return res.data
}

export const createPayroll = async (payload: any): Promise<Payroll> => {
  const res = await api.post("/payrolls/", payload)
  return res.data
}

export const updatePayroll = async (id: number, payload: any): Promise<Payroll> => {
  const res = await api.put(`/payrolls/${id}`, payload)
  return res.data
}

export const deletePayroll = async (id: number): Promise<void> => {
  await api.delete(`/payrolls/${id}`)
}
