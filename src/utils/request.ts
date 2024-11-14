import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { store } from '@/store'
import { clearAuth, getStoredTokens } from './auth'
import { ApiResponse } from '@/types/common'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 创建一个专门用于图片请求的实例
export const imageRequest = axios.create({
  baseURL: '/api',
  timeout: 30000,
  responseType: 'blob'
})

// 为图片请求实例添加认证和拦截器
imageRequest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = getStoredTokens()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  }
)

imageRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      message.error('登录已过期，请重新登录')
    }
    return Promise.reject(error)
  }
)

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = getStoredTokens()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    // 增强请求日志
    const logInfo = {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data,
      headers: {
        Authorization: config.headers?.Authorization ? 'Bearer ****' : undefined,
        'Content-Type': config.headers?.['Content-Type'],
      }
    }

    console.group(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`)
    console.log('Headers:', logInfo.headers)
    if (config.params) console.log('Params:', logInfo.params)
    if (config.data) console.log('Body:', logInfo.data)
    console.groupEnd()

    return config
  },
  (error) => {
    console.group('❌ Request Error')
    console.error('Message:', error.message)
    console.error('Config:', error.config)
    console.groupEnd()
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, config, status, headers } = response
    const duration = headers['x-response-time']

    // 增强响应日志
    console.group(`✅ Response: ${config.method?.toUpperCase()} ${config.url}`)
    console.log('Status:', status)
    console.log('Duration:', duration ? `${duration}ms` : 'N/A')
    console.log('Response:', data)
    console.groupEnd()

    // 如果是 blob 类型的响应，直接返回
    if (config.responseType === 'blob') {
      return response
    }

    // 处理 API 响应
    if (data.code === 0) {
      return data
    }

    console.group(`❌ API Error: ${config.method?.toUpperCase()} ${config.url}`)
    console.error('Code:', data.code)
    console.error('Message:', data.message)
    console.groupEnd()

    message.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  async (error) => {
    // 增强错误日志
    console.group('❌ Response Error')
    console.error('URL:', error.config?.url)
    console.error('Method:', error.config?.method?.toUpperCase())
    console.error('Status:', error.response?.status)
    console.error('Status Text:', error.response?.statusText)
    console.error('Message:', error.message)
    console.error('Response Data:', error.response?.data)
    console.error('Request Params:', error.config?.params)
    console.error('Request Body:', error.config?.data)
    console.groupEnd()

    if (error.response?.status === 401) {
      clearAuth()
      message.error('登录已过期，请重新登录')
    } else {
      message.error(error.response?.data?.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default request 