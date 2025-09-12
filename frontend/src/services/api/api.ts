import axios from "axios"
import AuthService from "../authService" 

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"

// Tạo instance axios dùng chung
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor: tự động gắn token nếu có
api.interceptors.request.use(
  (config) => {
    const token = AuthService.token
    if (token) {
      (config.headers as Record<string, string>) = {
        ...(config.headers as Record<string, string>),
        Authorization: `Bearer ${token}`,
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor: xử lý lỗi 401 tự động logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

export default api
