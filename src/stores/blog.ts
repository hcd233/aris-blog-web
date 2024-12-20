import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import axios from '../utils/axios'

interface ArticleVersion {
  id: number
  version: number
  content: string
  description?: string
  summary?: string
  createdAt: string
}

interface Article {
  id: number
  title: string
  slug: string
  status: 'draft' | 'publish'
  publishedAt: string | null
  views: number
  likes: number
  user: {
    id: number
    name: string
    avatar: string
  }
  category?: {
    id: number
    name: string
    parentID: number
  }
  tags: Array<{
    id: number
    name: string
    slug: string
  }>
  comments?: number
  versions?: ArticleVersion[]
}

interface PageInfo {
  page: number
  pageSize: number
  total: number
}

interface ArticleResponse {
  code: number
  message?: string
  data: {
    article?: Article
    articles?: Article[]
    pageInfo?: PageInfo
    articleVersion?: ArticleVersion
  }
}

export const useBlogStore = defineStore('blog', {
  state: () => ({
    posts: [] as Article[],
    currentPost: null as Article | null,
    currentVersion: null as ArticleVersion | null,
    pageInfo: null as PageInfo | null,
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchPosts(page = 1, pageSize = 10) {
      this.loading = true
      try {
        const response = await axios.get<ArticleResponse>('/articles', {
          params: { page, pageSize }
        })
        if (response.data.code === 0) {
          this.posts = response.data.data.articles || []
          this.pageInfo = response.data.data.pageInfo || null
        } else {
          throw new Error(response.data.message)
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserPosts(userName: string, page = 1, pageSize = 10) {
      this.loading = true
      try {
        const response = await axios.get<ArticleResponse>(`/user/${userName}/articles`, {
          params: { page, pageSize }
        })
        if (response.data.code === 0) {
          this.posts = response.data.data.articles || []
          this.pageInfo = response.data.data.pageInfo || null
        } else {
          throw new Error(response.data.message)
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPostBySlug(userName: string, slug: string) {
      this.loading = true
      try {
        const [articleRes, versionRes] = await Promise.all([
          axios.get<ArticleResponse>(`/user/${userName}/article/${slug}`),
          axios.get<ArticleResponse>(`/user/${userName}/article/${slug}/version/latest`)
        ])
        
        if (articleRes.data.code === 0 && articleRes.data.data.article) {
          this.currentPost = articleRes.data.data.article
          if (versionRes.data.code === 0 && versionRes.data.data.articleVersion) {
            this.currentVersion = versionRes.data.data.articleVersion
          }
        } else {
          throw new Error(articleRes.data.message)
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createPost(userName: string, data: {
      title: string
      slug?: string
      categoryId?: number
      tags?: string[]
    }) {
      this.loading = true
      try {
        const response = await axios.post<ArticleResponse>(
          `/user/${userName}/article`,
          data
        )
        if (response.data.code === 0 && response.data.data.article) {
          return response.data.data.article
        } else {
          throw new Error(response.data.message)
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createArticleVersion(userName: string, slug: string, content: string) {
      this.loading = true
      try {
        const response = await axios.post<ArticleResponse>(
          `/user/${userName}/article/${slug}/version`,
          { content }
        )
        if (response.data.code === 0 && response.data.data.articleVersion) {
          return response.data.data.articleVersion
        } else {
          throw new Error(response.data.message)
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePost(userName: string, slug: string, data: {
      title?: string
      newSlug?: string
      categoryId?: number
    }) {
      this.loading = true
      try {
        const response = await axios.put<ArticleResponse>(
          `/user/${userName}/article/${slug}`,
          data
        )
        if (response.data.code === 0 && response.data.data.article) {
          return response.data.data.article
        } else {
          throw new Error(response.data.message)
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePostStatus(userName: string, slug: string, status: 'draft' | 'publish') {
      this.loading = true
      try {
        const response = await axios.put<ArticleResponse>(
          `/user/${userName}/article/${slug}/status`,
          { status }
        )
        if (response.data.code === 0 && response.data.data.article) {
          return response.data.data.article
        } else {
          throw new Error(response.data.message)
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deletePost(userName: string, slug: string) {
      this.loading = true
      try {
        const response = await axios.delete<ArticleResponse>(
          `/user/${userName}/article/${slug}`
        )
        if (response.data.code === 0) {
          return true
        } else {
          throw new Error(response.data.message)
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 