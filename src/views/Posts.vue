<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- 顶部区域 -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-color to-secondary-color bg-clip-text text-transparent">
        博客文章
      </h1>
      <div class="flex w-full sm:w-auto gap-4">
        <div class="relative flex-1 sm:flex-none">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索文章..."
            class="w-full px-4 py-2.5 pl-10 bg-white/50 backdrop-blur border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-color/50 transition-all duration-300"
          />
          <i class="fas fa-search absolute left-3.5 top-3.5 text-gray-400"></i>
        </div>
        <button
          v-if="isLoggedIn"
          @click="handleCreatePost"
          class="px-6 py-2.5 bg-gradient-to-r from-primary-color to-secondary-color text-white rounded-xl hover:shadow-lg hover:shadow-primary-color/20 transition-all duration-300 whitespace-nowrap"
        >
          <i class="fas fa-pen-to-square mr-2"></i>写文章
        </button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="store.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-color border-t-transparent"></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="store.error" class="flex flex-col items-center py-12 px-4">
      <div class="text-red-500 mb-4">
        <i class="fas fa-exclamation-circle text-4xl"></i>
      </div>
      <p class="text-red-500 mb-4">{{ store.error }}</p>
      <button
        @click="fetchPosts"
        class="px-6 py-2.5 bg-gradient-to-r from-primary-color to-secondary-color text-white rounded-xl hover:shadow-lg transition-all duration-300"
      >
        重试
      </button>
    </div>

    <!-- 文章列表 -->
    <div v-else class="grid gap-6">
      <article
        v-for="post in store.posts"
        :key="post.id"
        class="group bg-white rounded-2xl shadow-sm hover:shadow-xl p-6 transition-all duration-300 relative overflow-hidden"
      >
        <!-- 文章封面图（如果有） -->
        <div v-if="post.cover" class="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div v-if="post.cover" class="absolute inset-0 -z-10">
          <img :src="post.cover" :alt="post.title" class="w-full h-full object-cover" />
        </div>
        
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold mb-3 text-gray-900 group-hover:text-primary-color transition-colors duration-300 truncate">
              <router-link
                :to="{ name: 'post-detail', params: { userName: post.user.name, slug: post.slug }}"
              >
                {{ post.title }}
              </router-link>
            </h2>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <router-link 
                :to="{ name: 'user-posts', params: { userName: post.user.name }}"
                class="flex items-center gap-2 hover:text-primary-color transition-colors duration-300"
              >
                <img
                  :src="post.user.avatar"
                  :alt="post.user.name"
                  class="w-8 h-8 rounded-full ring-2 ring-white shadow-md"
                />
                <span>{{ post.user.name }}</span>
              </router-link>
              <div class="flex items-center gap-1">
                <i class="far fa-calendar-alt"></i>
                <span>{{ formatDate(post.publishedAt) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="far fa-eye"></i>
                <span>{{ post.views }}</span>
              </div>
              <div class="flex items-center gap-1">
                <i class="far fa-heart"></i>
                <span>{{ post.likes }}</span>
              </div>
            </div>
          </div>
          
          <!-- 文章操作按钮 -->
          <div v-if="isCurrentUserPost(post)" class="flex gap-2">
            <button
              @click="handleEditPost(post)"
              class="p-2 text-gray-400 hover:text-primary-color transition-colors duration-300"
              title="编辑"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              @click="handleDeletePost(post)"
              class="p-2 text-gray-400 hover:text-red-500 transition-colors duration-300"
              title="删除"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <p v-if="post.summary" class="text-gray-600 mb-4 line-clamp-2">
          {{ post.summary }}
        </p>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap gap-2">
            <router-link
              v-for="tag in post.tags"
              :key="tag.id"
              :to="{ name: 'tag', query: { slug: tag.slug }}"
              class="px-3 py-1 bg-white/80 backdrop-blur hover:bg-primary-color/10 text-gray-600 hover:text-primary-color rounded-full text-sm transition-colors duration-300 shadow-sm"
            >
              #{{ tag.name }}
            </router-link>
          </div>
          <router-link
            :to="{ name: 'post-detail', params: { userName: post.user.name, slug: post.slug }}"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur text-primary-color hover:text-white hover:bg-primary-color rounded-full transition-all duration-300 group/link shadow-sm"
          >
            <span>阅读全文</span>
            <i class="fas fa-arrow-right transform group-hover/link:translate-x-1 transition-transform duration-300"></i>
          </router-link>
        </div>
      </article>
    </div>

    <!-- 分页 -->
    <div v-if="store.pageInfo && store.pageInfo.total > 0" class="flex justify-center gap-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="handlePageChange(page)"
        :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
          currentPage === page
            ? 'bg-gradient-to-r from-primary-color to-secondary-color text-white shadow-lg shadow-primary-color/20'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'
import { useAuthStore } from '../stores/auth'
import { ElMessageBox, ElMessage } from 'element-plus'

const store = useBlogStore()
const authStore = useAuthStore()
const router = useRouter()

const currentPage = ref(1)
const searchQuery = ref('')
const pageSize = 10

const isLoggedIn = computed(() => authStore.isAuthenticated)

const totalPages = computed(() => {
  if (!store.pageInfo) return 1
  return Math.ceil(store.pageInfo.total / pageSize)
})

const isCurrentUserPost = (post: any) => {
  return isLoggedIn.value && post.user.name === authStore.user?.name
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchPosts = async (page = 1) => {
  currentPage.value = page
  await store.fetchPosts(page, pageSize)
}

const handlePageChange = (page: number) => {
  fetchPosts(page)
}

const handleSearch = () => {
  // TODO: 实现搜索功能
  console.log('Search:', searchQuery.value)
}

const handleCreatePost = () => {
  router.push({ name: 'create-post' })
}

const handleEditPost = (post: any) => {
  router.push({
    name: 'edit-post',
    params: { userName: post.user.name, slug: post.slug }
  })
}

const handleDeletePost = async (post: any) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这篇文章吗？此操作不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await store.deletePost(post.user.name, post.slug)
    ElMessage.success('文章已删除')
    fetchPosts(currentPage.value)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.anime-transition {
  transition: all 0.3s ease;
}

/* 添加渐变文字悬停效果 */
.hover-gradient-text:hover {
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style> 