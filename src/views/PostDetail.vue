<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <!-- 加载状态 -->
    <div v-if="store.loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-color border-t-transparent shadow-lg"></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="store.error" class="flex flex-col items-center py-12">
      <div class="text-red-500 mb-4">
        <i class="fas fa-exclamation-circle text-4xl"></i>
      </div>
      <p class="text-red-500 mb-4">{{ store.error }}</p>
      <button
        @click="fetchPost"
        class="px-6 py-2.5 bg-gradient-to-r from-primary-color to-secondary-color text-white rounded-xl hover:shadow-lg transition-all duration-300"
      >
        重试
      </button>
    </div>

    <!-- 文章内容 -->
    <article v-else-if="store.currentPost" class="space-y-8">
      <!-- 文章头部 -->
      <header class="relative overflow-hidden rounded-2xl bg-white p-8">
        <!-- 封面图 -->
        <div v-if="store.currentPost.cover" class="absolute inset-0 -z-10">
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-white"></div>
          <img :src="store.currentPost.cover" :alt="store.currentPost.title" class="w-full h-full object-cover" />
        </div>
        
        <div class="space-y-6">
          <h1 class="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-color to-secondary-color bg-clip-text text-transparent leading-tight">
            {{ store.currentPost.title }}
          </h1>
          
          <div class="flex flex-wrap items-center justify-between gap-4">
            <!-- 作者信息 -->
            <div class="flex items-center gap-4">
              <router-link
                :to="{ name: 'user-posts', params: { userName: store.currentPost.user.name }}"
                class="group flex items-center gap-3 hover:text-primary-color transition-colors duration-300"
              >
                <img
                  :src="store.currentPost.user.avatar"
                  :alt="store.currentPost.user.name"
                  class="w-12 h-12 rounded-full ring-2 ring-white shadow-lg group-hover:ring-primary-color/20 transition-all duration-300"
                />
                <div>
                  <div class="font-medium group-hover:text-primary-color transition-colors duration-300">
                    {{ store.currentPost.user.name }}
                  </div>
                  <div class="text-sm text-gray-500 flex items-center gap-2">
                    <i class="far fa-calendar-alt"></i>
                    <span>{{ formatDate(store.currentPost.publishedAt) }}</span>
                  </div>
                </div>
              </router-link>
            </div>

            <!-- 文章数据 -->
            <div class="flex items-center gap-4">
              <button class="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur hover:bg-primary-color/10 text-gray-600 hover:text-primary-color rounded-xl transition-all duration-300 shadow-sm">
                <i class="far fa-eye"></i>
                <span>{{ store.currentPost.views }}</span>
              </button>
              <button 
                class="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-xl transition-all duration-300 shadow-sm group"
                @click="handleLike"
              >
                <i class="far fa-heart group-hover:fas"></i>
                <span>{{ store.currentPost.likes }}</span>
              </button>
            </div>
          </div>

          <!-- 标签 -->
          <div class="flex flex-wrap gap-2">
            <router-link
              v-for="tag in store.currentPost.tags"
              :key="tag.id"
              :to="{ name: 'tag', query: { slug: tag.slug }}"
              class="px-4 py-1.5 bg-white/80 backdrop-blur hover:bg-primary-color/10 text-gray-600 hover:text-primary-color rounded-xl text-sm transition-all duration-300 shadow-sm"
            >
              #{{ tag.name }}
            </router-link>
          </div>
        </div>
      </header>

      <!-- 文章操作 -->
      <div v-if="isCurrentUserPost" class="sticky top-4 z-10 flex flex-wrap justify-end gap-3 bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm">
        <button
          @click="handleEdit"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-color to-secondary-color text-white rounded-xl hover:shadow-lg hover:shadow-primary-color/20 transition-all duration-300"
        >
          <i class="fas fa-edit"></i>
          <span>编辑文章</span>
        </button>
        <button
          v-if="store.currentPost.status === 'draft'"
          @click="handlePublish"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
        >
          <i class="fas fa-paper-plane"></i>
          <span>发布文章</span>
        </button>
        <button
          v-else
          @click="handleUnpublish"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300"
        >
          <i class="fas fa-archive"></i>
          <span>转为草稿</span>
        </button>
        <button
          @click="handleDelete"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
        >
          <i class="fas fa-trash"></i>
          <span>删除文章</span>
        </button>
      </div>

      <!-- 文章内容 -->
      <div class="prose prose-lg max-w-none bg-white rounded-2xl shadow-sm p-8">
        <div v-html="renderedContent"></div>
      </div>

      <!-- AI 功能区 -->
      <div v-if="isCurrentUserPost" class="mt-12 space-y-6">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary-color to-secondary-color bg-clip-text text-transparent">
          AI 助手
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            @click="handleGenerateSummary"
            class="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-color to-secondary-color flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <i class="fas fa-robot text-xl"></i>
              </div>
              <h3 class="text-lg font-semibold group-hover:text-primary-color transition-colors duration-300">生成摘要</h3>
            </div>
            <p class="text-gray-500">使用 AI 为文章生成简短摘要，帮助读者快速了解文章重点</p>
          </button>
          <button
            @click="handleGenerateQA"
            class="group p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-color to-secondary-color flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <i class="fas fa-comments text-xl"></i>
              </div>
              <h3 class="text-lg font-semibold group-hover:text-primary-color transition-colors duration-300">生成问答</h3>
            </div>
            <p class="text-gray-500">基于文章内容生成相关问答，帮助读者更好地理解文章内容</p>
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'
import { useAuthStore } from '../stores/auth'
import { ElMessageBox, ElMessage } from 'element-plus'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()
const authStore = useAuthStore()

const isCurrentUserPost = computed(() => {
  return (
    authStore.isAuthenticated &&
    store.currentPost &&
    store.currentPost.user.name === authStore.user?.name
  )
})

const renderedContent = computed(() => {
  if (!store.currentVersion?.content) return ''
  const rawHtml = marked(store.currentVersion.content)
  return DOMPurify.sanitize(rawHtml)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchPost = async () => {
  const { userName, slug } = route.params
  await store.fetchPostBySlug(userName as string, slug as string)
}

const handleEdit = () => {
  const { userName, slug } = route.params
  router.push({
    name: 'edit-post',
    params: { userName, slug }
  })
}

const handleDelete = async () => {
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
    
    const { userName, slug } = route.params
    await store.deletePost(userName as string, slug as string)
    ElMessage.success('文章已删除')
    router.push({ name: 'posts' })
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handlePublish = async () => {
  try {
    const { userName, slug } = route.params
    await store.updatePostStatus(userName as string, slug as string, 'publish')
    ElMessage.success('文章已发布')
    fetchPost()
  } catch (error: any) {
    ElMessage.error(error.message || '发布失败')
  }
}

const handleUnpublish = async () => {
  try {
    const { userName, slug } = route.params
    await store.updatePostStatus(userName as string, slug as string, 'draft')
    ElMessage.success('文章已转为草稿')
    fetchPost()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleGenerateSummary = () => {
  // TODO: 实现 AI 生成摘要功能
  ElMessage.info('AI 摘要生成功能即将上线')
}

const handleGenerateQA = () => {
  // TODO: 实现 AI 问答功能
  ElMessage.info('AI 问答功能即将上线')
}

const handleLike = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再点赞')
    return
  }

  try {
    // TODO: 实现点赞功能
    ElMessage.success('点赞成功')
  } catch (error: any) {
    ElMessage.error(error.message || '点赞失败')
  }
}

onMounted(() => {
  fetchPost()
})
</script>

<style>
/* Tailwind Typography 样式覆盖 */
.prose {
  @apply text-gray-800;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  @apply text-gray-900 font-bold;
}

.prose h1 {
  @apply text-3xl sm:text-4xl mb-6;
}

.prose h2 {
  @apply text-2xl sm:text-3xl mt-12 mb-6;
}

.prose h3 {
  @apply text-xl sm:text-2xl mt-8 mb-4;
}

.prose p {
  @apply mb-6 leading-relaxed;
}

.prose a {
  @apply text-primary-color no-underline hover:text-secondary-color transition-colors duration-300;
}

.prose img {
  @apply rounded-2xl shadow-lg my-8;
}

.prose code {
  @apply px-2 py-1 bg-gray-100 text-primary-color rounded-lg text-sm;
}

.prose pre {
  @apply p-4 bg-gray-900 rounded-2xl shadow-lg overflow-x-auto my-8;
}

.prose pre code {
  @apply bg-transparent text-white p-0;
}

.prose blockquote {
  @apply pl-6 border-l-4 border-primary-color/50 bg-primary-color/5 py-2 my-8 rounded-r-xl italic;
}

.prose ul,
.prose ol {
  @apply my-6 pl-6;
}

.prose li {
  @apply mb-2;
}

.prose table {
  @apply w-full my-8 border-collapse;
}

.prose th,
.prose td {
  @apply border border-gray-200 px-4 py-2;
}

.prose th {
  @apply bg-gray-50 font-semibold;
}

.prose hr {
  @apply my-12 border-gray-200;
}
</style> 