import axios from 'axios'

// API base URL: configurable via VITE_API_URL env var
// Fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3902/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor — normalize error format
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errData = error.response?.data?.error
    const message =
      (typeof errData === 'object' ? errData?.message : errData) ||
      error.response?.data?.message ||
      error.message ||
      'Unknown error'
    return Promise.reject(new Error(message))
  }
)

export default api
