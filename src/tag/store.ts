import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const API_BASE_URL = 'http://9.134.115.68:8170/v1'

interface Tag {
  id: number
  name: string
  slug: string
  description?: string
  creator?: string
  user?: {
    id: number
    name: string
    avatar: string
  }
}

interface TagState {
  tags: Tag[]
  currentTag: Tag | null
  loading: boolean
  error: string | null
  pageInfo: {
    page: number
    pageSize: number
    total: number
  }
}

export const useTagStore = defineStore('tag', {
  state: (): TagState => ({
    tags: [],
    currentTag: null,
    loading: false,
    error: null,
    pageInfo: {
      page: 1,
      pageSize: 12,
      total: 0
    }
  }),

  actions: {
    async fetchTags(page = 1, pageSize = 12) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const headers = authStore.isAuthenticated ? {
          Authorization: `Bearer ${authStore.accessToken}`
        } : undefined

        // 1. 首先获取标签列表
        const response = await axios.get(`${API_BASE_URL}/tags`, {
          params: { page, pageSize },
          headers
        })
        const tags = response.data.data.tags
        
        // 2. 获取每个标签的详细信息和创建者信息
        const detailedTags = await Promise.all(
          tags.map(async (tag: Tag) => {
            try {
              // 获取标签详情
              const detailResponse = await axios.get(`${API_BASE_URL}/tag/${tag.slug}`, {
                headers
              })
              const detailedTag = detailResponse.data.data.tag

              // 如果标签详情中有 creator，获取创建者信息
              if (detailedTag.creator) {
                try {
                  // 获取用户信息
                  const userResponse = await axios.get(`${API_BASE_URL}/user/${detailedTag.creator}`, {
                    headers
                  })
                  const userData = userResponse.data.data.user

                  // 更新标签的用户信息
                  detailedTag.user = {
                    id: userData.id,
                    name: userData.name,
                    avatar: userData.avatar
                  }
                } catch (error) {
                  console.error('Failed to fetch user info:', error)
                }
              }
              
              return detailedTag
            } catch (error) {
              console.error('Failed to fetch tag details:', error)
              return tag
            }
          })
        )

        this.tags = detailedTags
        this.pageInfo = response.data.data.pageInfo
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchUserTags(userName: string, page = 1, pageSize = 12) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const headers = authStore.isAuthenticated ? {
          Authorization: `Bearer ${authStore.accessToken}`
        } : undefined

        const response = await axios.get(`${API_BASE_URL}/user/${userName}/tags`, {
          params: { page, pageSize },
          headers
        })
        this.tags = response.data.data.tags
        this.pageInfo = response.data.data.pageInfo
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchTagBySlug(slug: string) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const headers = authStore.isAuthenticated ? {
          Authorization: `Bearer ${authStore.accessToken}`
        } : undefined

        const response = await axios.get(`${API_BASE_URL}/tag/${slug}`, {
          headers
        })
        this.currentTag = response.data.data.tag
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createTag(data: { name: string; slug: string; description?: string }) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const response = await axios.post(`${API_BASE_URL}/tag`, data, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        })
        return response.data.data.tag
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTag(slug: string, data: { name?: string; description?: string }) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        const response = await axios.put(`${API_BASE_URL}/tag/${slug}`, data, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        })
        return response.data.data.tag
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTag(slug: string) {
      this.loading = true
      try {
        const authStore = useAuthStore()
        await axios.delete(`${API_BASE_URL}/tag/${slug}`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        })
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 