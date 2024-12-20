<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-primary-color">创建文章</h1>
      <div class="flex space-x-4">
        <button
          @click="handleSave"
          class="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-primary-color/90 transition-colors"
          :disabled="store.loading"
        >
          {{ store.loading ? '保存中...' : '保存草稿' }}
        </button>
        <button
          @click="handlePublish"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          :disabled="store.loading"
        >
          {{ store.loading ? '发布中...' : '直接发布' }}
        </button>
      </div>
    </div>

    <form @submit.prevent class="space-y-6">
      <!-- 标题 -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">文章标题</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color"
          placeholder="请输入文章标题"
          required
        />
      </div>

      <!-- 分类 -->
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">文章分类</label>
        <select
          id="category"
          v-model="form.categoryId"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color"
        >
          <option value="">请选择分类</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <!-- 标签 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">文章标签</label>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in availableTags"
            :key="tag.id"
            @click="toggleTag(tag)"
            :class="[
              'px-3 py-1 rounded-full cursor-pointer transition-colors',
              form.tags.includes(tag.slug)
                ? 'bg-secondary-color text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            #{{ tag.name }}
          </span>
        </div>
      </div>

      <!-- Markdown 编辑器 -->
      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 mb-1">文章内容</label>
        <div class="border border-gray-300 rounded-lg overflow-hidden">
          <!-- 工具栏 -->
          <div class="flex items-center space-x-2 px-4 py-2 bg-gray-50 border-b">
            <button
              v-for="tool in editorTools"
              :key="tool.icon"
              @click="insertMarkdown(tool.markdown)"
              class="p-1 hover:bg-gray-200 rounded"
              :title="tool.title"
            >
              <i :class="['fas', tool.icon]"></i>
            </button>
          </div>
          
          <!-- 编辑器 -->
          <div class="grid grid-cols-2 divide-x">
            <!-- 输入区 -->
            <textarea
              id="content"
              v-model="form.content"
              class="p-4 min-h-[500px] resize-none focus:outline-none"
              placeholder="使用 Markdown 编写文章内容..."
            ></textarea>
            
            <!-- 预览区 -->
            <div class="p-4 prose prose-sm max-w-none overflow-auto min-h-[500px]" v-html="renderedContent"></div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const router = useRouter()
const store = useBlogStore()
const authStore = useAuthStore()

// 表单数据
const form = ref({
  title: '',
  content: '',
  categoryId: '',
  tags: [] as string[]
})

// 编辑器工具
const editorTools = [
  { icon: 'fa-heading', title: '标题', markdown: '## ' },
  { icon: 'fa-bold', title: '粗体', markdown: '**粗体文本**' },
  { icon: 'fa-italic', title: '斜体', markdown: '*斜体文本*' },
  { icon: 'fa-quote-left', title: '引用', markdown: '> ' },
  { icon: 'fa-list-ul', title: '无序列表', markdown: '- ' },
  { icon: 'fa-list-ol', title: '有序列表', markdown: '1. ' },
  { icon: 'fa-code', title: '代码块', markdown: '```\n代码块\n```' },
  { icon: 'fa-link', title: '链接', markdown: '[链接文本](链接地址)' },
  { icon: 'fa-image', title: '图片', markdown: '![图片描述](图片地址)' }
]

// 模拟分类和标签数据
const categories = ref([
  { id: 1, name: '动漫' },
  { id: 2, name: '游戏' },
  { id: 3, name: '技术' },
  { id: 4, name: '生活' }
])

const availableTags = ref([
  { id: 1, name: '动漫', slug: 'anime' },
  { id: 2, name: '游戏', slug: 'game' },
  { id: 3, name: '技术', slug: 'tech' },
  { id: 4, name: '生活', slug: 'life' },
  { id: 5, name: '二次元', slug: 'acg' }
])

// 计算属性：Markdown 预览
const renderedContent = computed(() => {
  if (!form.value.content) return ''
  const rawHtml = marked(form.value.content)
  return DOMPurify.sanitize(rawHtml)
})

// 插入 Markdown 语法
const insertMarkdown = (markdown: string) => {
  const textarea = document.getElementById('content') as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value
  
  textarea.value = text.substring(0, start) + markdown + text.substring(end)
  form.value.content = textarea.value
  
  // 设置光标位置
  textarea.focus()
  const cursorPos = start + markdown.length
  textarea.setSelectionRange(cursorPos, cursorPos)
}

// 切换标签
const toggleTag = (tag: { id: number; name: string; slug: string }) => {
  const index = form.value.tags.indexOf(tag.slug)
  if (index === -1) {
    form.value.tags.push(tag.slug)
  } else {
    form.value.tags.splice(index, 1)
  }
}

// 保存文章
const savePost = async (publish = false) => {
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  if (!form.value.content.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  if (form.value.content.length < 100) {
    ElMessage.warning('文章内容至少需要100个字符')
    return
  }

  if (form.value.content.length > 20000) {
    ElMessage.warning('文章内容不能超过20000个字符')
    return
  }

  try {
    // 1. 创建文章基本信息
    const article = await store.createPost(authStore.user!.name, {
      title: form.value.title,
      categoryId: form.value.categoryId ? parseInt(form.value.categoryId) : undefined,
      tags: form.value.tags
    })

    // 2. 创建文章版本
    await store.createArticleVersion(authStore.user!.name, article.slug, form.value.content)

    // 3. 如果需要发布，更新文章状态
    if (publish) {
      await store.updatePostStatus(authStore.user!.name, article.slug, 'publish')
      ElMessage.success('文章已发布')
    } else {
      ElMessage.success('草稿已保存')
    }

    router.push({
      name: 'post-detail',
      params: { userName: authStore.user!.name, slug: article.slug }
    })
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}

const handleSave = () => savePost(false)
const handlePublish = () => savePost(true)
</script>

<style>
/* 编辑器样式 */
.prose img {
  @apply rounded-lg shadow-md;
}

.prose pre {
  @apply bg-gray-900 text-white p-4 rounded-lg;
}

.prose code {
  @apply bg-gray-100 px-1 py-0.5 rounded;
}

.prose blockquote {
  @apply border-l-4 border-secondary-color bg-secondary-color/10 px-4 py-2;
}
</style> 