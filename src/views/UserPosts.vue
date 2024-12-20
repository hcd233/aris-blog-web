<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-primary-color">{{ userName }}的文章</h1>
        <p class="text-gray-500 mt-2">共 {{ store.pageInfo?.total || 0 }} 篇文章</p>
      </div>
      <div v-if="isCurrentUser" class="flex space-x-4">
        <button
          @click="handleCreatePost"
          class="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-primary-color/90 transition-colors"
        >
          写文章
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="store.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-color border-t-transparent"></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="store.error" class="text-center py-12">
      <p class="text-red-500">{{ store.error }}</p>
      <button
        @click="fetchPosts"
        class="mt-4 px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-primary-color/90"
      >
        ��试
      </button>
    </div>

    <!-- 文章列表 -->
    <div v-else-if="store.posts.length > 0" class="space-y-6">
      <article
        v-for="post in store.posts"
        :key="post.id"
        class="bg-white rounded-lg shadow-md p-6 anime-transition hover:shadow-xl"
      >
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-semibold mb-2">
              <router-link
                :to="{ name: 'post-detail', params: { userName, slug: post.slug }}"
                class="text-primary-color hover:text-secondary-color"
              >
                {{ post.title }}
              </router-link>
            </h2>
            <div class="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span>{{ formatDate(post.publishedAt) }}</span>
              <div class="flex items-center space-x-1">
                <i class="fas fa-eye"></i>
                <span>{{ post.views }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <i class="fas fa-heart"></i>
                <span>{{ post.likes }}</span>
              </div>
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-xs',
                  post.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ post.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </div>
          </div>

          <!-- 文章操作 -->
          <div v-if="isCurrentUser" class="flex space-x-2">
            <button
              @click="handleEditPost(post)"
              class="p-2 text-gray-600 hover:text-primary-color"
              title="编辑"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              @click="handleDeletePost(post)"
              class="p-2 text-gray-600 hover:text-red-500"
              title="删除"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <p v-if="post.summary" class="text-gray-600 mb-4">
          {{ post.summary }}
        </p>

        <div class="flex items-center justify-between">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in post.tags"
              :key="tag.id"
              class="px-2 py-1 bg-secondary-color/20 text-secondary-color rounded-full text-sm"
            >
              #{{ tag.name }}
            </span>
          </div>
          <router-link
            :to="{ name: 'post-detail', params: { userName, slug: post.slug }}"
            class="text-primary-color hover:text-secondary-color inline-flex items-center space-x-1"
          >
            <span>阅读全文</span>
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12">
      <i class="fas fa-file-alt text-4xl text-gray-400 mb-4"></i>
      <p class="text-gray-500">还没有发布任何文章</p>
      <button
        v-if="isCurrentUser"
        @click="handleCreatePost"
        class="mt-4 px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-primary-color/90"
      >
        开始写作
      </button>
    </div>

    <!-- 分页 -->
    <div v-if="store.pageInfo && store.pageInfo.total > 0" class="flex justify-center space-x-2 mt-8">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="handlePageChange(page)"
        :class="[
          'px-4 py-2 rounded-lg',
          currentPage === page
            ? 'bg-primary-color text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'
import { useAuthStore } from '../stores/auth'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()
const authStore = useAuthStore()

const currentPage = ref(1)
const pageSize = 10

const userName = computed(() => route.params.userName as string)
const isCurrentUser = computed(() => {
  return authStore.isAuthenticated && userName.value === authStore.user?.name
})

const totalPages = computed(() => {
  if (!store.pageInfo) return 1
  return Math.ceil(store.pageInfo.total / pageSize)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchPosts = async (page = 1) => {
  currentPage.value = page
  await store.fetchUserPosts(userName.value, page, pageSize)
}

const handlePageChange = (page: number) => {
  fetchPosts(page)
}

const handleCreatePost = () => {
  router.push({
    name: 'create-post',
    params: { userName: userName.value }
  })
}

const handleEditPost = (post: any) => {
  router.push({
    name: 'edit-post',
    params: { userName: userName.value, slug: post.slug }
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
    
    await store.deletePost(userName.value, post.slug)
    ElMessage.success('文章已删除')
    fetchPosts(currentPage.value)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 监听路由参数变化
watch(
  () => route.params.userName,
  () => {
    currentPage.value = 1
    fetchPosts()
  }
)

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.anime-transition {
  transition: all 0.3s ease;
}
</style> 