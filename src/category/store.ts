import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const API_BASE_URL = 'http://9.134.115.68:8170/v1'

interface Category {
  id: number
  name: string
  parentID: number
  user?: {
    id: number
    name: string
    avatar: string
  }
  children?: Category[]
  articles?: any[]
}

interface CategoryState {
  categories: Category[]
  currentCategory: Category | null
  rootCategory: Category | null
  loading: boolean
  error: string | null
  pageInfo: {
    page: number
    pageSize: number
    total: number
  }
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
    currentCategory: null,
    rootCategory: null,
    loading: false,
    error: null,
    pageInfo: {
      page: 1,
      pageSize: 12,
      total: 0
    }
  }),

  actions: {
    async fetchRootCategory() {
      this.loading = true
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('需要登录')
        }

        const response = await axios.get(`${API_BASE_URL}/user/${authStore.user?.name}/rootCategory`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        })
        this.rootCategory = response.data.data.category
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCategoryInfo(categoryId: number) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('需要登录')
        }

        const response = await axios.get(
          `${API_BASE_URL}/user/${authStore.user?.name}/category/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`
            }
          }
        )
        this.currentCategory = response.data.data.category
        return response.data.data.category
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSubCategories(categoryId: number, page = 1, pageSize = 12) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('需要登录')
        }

        const response = await axios.get(
          `${API_BASE_URL}/user/${authStore.user?.name}/category/${categoryId}/subCategories`,
          {
            params: { page, pageSize },
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`
            }
          }
        )
        this.categories = response.data.data.categories
        this.pageInfo = response.data.data.pageInfo
        return response.data.data
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCategoryArticles(categoryId: number, page = 1, pageSize = 12) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('需要登录')
        }

        const response = await axios.get(
          `${API_BASE_URL}/user/${authStore.user?.name}/category/${categoryId}/subArticles`,
          {
            params: { page, pageSize },
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`
            }
          }
        )
        return response.data.data
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createCategory(data: { parentID?: number; name: string }) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('需要登录')
        }

        const response = await axios.post(
          `${API_BASE_URL}/user/${authStore.user?.name}/category`,
          data,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`
            }
          }
        )
        return response.data.data
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCategory(categoryId: number, data: { name?: string; parentID?: number }) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('需要登录')
        }

        const response = await axios.put(
          `${API_BASE_URL}/user/${authStore.user?.name}/category/${categoryId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`
            }
          }
        )
        return response.data.data
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteCategory(categoryId: number) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('需要登录')
        }

        await axios.delete(
          `${API_BASE_URL}/user/${authStore.user?.name}/category/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`
            }
          }
        )
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 