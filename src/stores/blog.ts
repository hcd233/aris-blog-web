import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://9.134.115.68:8170/v1'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    posts: [],
    currentPost: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchPosts() {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/articles`)
        this.posts = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchPostById(id: string) {
      this.loading = true
      try {
        const response = await axios.get(`${API_BASE_URL}/article/${id}`)
        this.currentPost = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
}) 