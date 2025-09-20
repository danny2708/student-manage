import api from "./api"

export interface User {
  user_id: number
  username: string
  roles: string[] 
  full_name: string
  email: string
}

export async function getUsers(): Promise<User[]> {
  const res = await api.get<User[]>("/users")
  return res.data
}

export async function getUserById(id: number): Promise<User> {
  const res = await api.get<User>(`/users/${id}`)
  return res.data
}

export async function createUser(data: Partial<User>) {
  const res = await api.post<User>("/users", data)
  return res.data
}

export async function updateUser(id: number, data: Partial<User>) {
  const res = await api.put<User>(`/users/${id}`, data)
  return res.data
}

export async function deleteUser(id: number) {
  const res = await api.delete(`/users/${id}`)
  return res.data
}

export async function importUsers(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const res = await api.post("/users/import-users", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return res.data as { status: string; imported: { students: Record<string, number>; parents: Record<string, number> } }
}


