import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const API_BASE_URL = 'http://9.134.115.68:8170/v1'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // 如果是401错误且没有重试过，尝试刷新token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await authStore.refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // 如果刷新token失��，登出用户
        authStore.logout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance 