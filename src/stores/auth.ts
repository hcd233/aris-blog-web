import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://9.134.115.68:8170/v1'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: any | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },

  actions: {
    async loginWithGithub() {
      try {
        const response = await axios.get(`${API_BASE_URL}/oauth2/github/login`)
        const { redirectURL } = response.data.data
        window.location.href = redirectURL
      } catch (error: any) {
        this.error = error.message
      }
    },

    async handleGithubCallback(code: string, state: string) {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/oauth2/github/callback`, {
          params: { code, state }
        })
        
        const { accessToken, refreshToken } = response.data.data
        
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        // 获取用户信息
        await this.fetchUserInfo()
        
        // 登录成功后跳转到首页
        window.location.href = '/'
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        throw new Error('No refresh token available')
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/token/refresh`, {
          refreshToken: this.refreshToken
        })
        
        const { accessToken, refreshToken } = response.data.data
        
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        
        return accessToken
      } catch (error: any) {
        this.error = error.message
        this.logout()
        throw error
      }
    },

    async fetchUserInfo() {
      if (!this.accessToken) return

      try {
        const response = await axios.get(`${API_BASE_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
        this.user = response.data.data.user
      } catch (error: any) {
        if (error.response?.status === 401) {
          try {
            await this.refreshAccessToken()
            // 重试获取用户信息
            const response = await axios.get(`${API_BASE_URL}/user/me`, {
              headers: {
                Authorization: `Bearer ${this.accessToken}`
              }
            })
            this.user = response.data.data.user
          } catch (refreshError) {
            this.error = refreshError.message
            this.logout()
          }
        } else {
          this.error = error.message
        }
      }
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/'
    }
  }
}) 