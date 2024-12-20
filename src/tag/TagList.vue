<template>
  <!-- 标签云区域 -->
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-[32px] font-bold text-gray-900 mb-2">热门标签</h2>
        <p class="text-[17px] text-gray-500">发现你感兴趣的话题</p>
      </div>
      <button
        v-if="isAuthenticated && user?.permission === 'creator'"
        @click="showCreateModal = true"
        class="ios-button flex items-center space-x-2"
      >
        <span class="text-[15px]">创建标签</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-color border-t-transparent"></div>
    </div>

    <!-- 标签列表 -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="ios-card group p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-[20px] font-semibold text-gray-900 group-hover:text-primary-color transition-colors duration-300">
              {{ tag.name }}
            </h3>
            <p class="text-[13px] text-gray-500 mt-1">{{ tag.slug }}</p>
          </div>
          <div v-if="isAuthenticated && user?.permission === 'creator'" class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              @click.stop="editTag(tag)"
              class="p-2 text-[15px] text-gray-600 hover:text-primary-color rounded-full hover:bg-gray-100 transition-all duration-300"
            >
              编辑
            </button>
            <button
              @click.stop="deleteTag(tag)"
              class="p-2 text-[15px] text-gray-600 hover:text-red-500 rounded-full hover:bg-red-50 transition-all duration-300"
            >
              删除
            </button>
          </div>
        </div>
        
        <p v-if="tag.description" class="text-[15px] text-gray-600 mb-4 line-clamp-2">
          {{ tag.description }}
        </p>

        <div class="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-100">
          <div class="relative group/avatar">
            <img
              v-if="tag.user?.avatar"
              :src="tag.user.avatar"
              :alt="tag.user?.name"
              class="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            />
            <div v-else class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span class="text-[13px] text-gray-500">{{ tag.user?.name?.[0]?.toUpperCase() || '?' }}</span>
            </div>
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-[13px] rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              {{ tag.user?.name || '未知用户' }}
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-[13px] text-gray-500">创建者</span>
            <span class="text-[15px] text-gray-700">{{ tag.user?.name || '未知用户' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页控制 -->
    <div v-if="pageInfo.total > 0" class="flex justify-center space-x-4 mt-12">
      <button
        :disabled="pageInfo.page === 1"
        @click="changePage(pageInfo.page - 1)"
        class="ios-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上一页
      </button>
      <div class="flex items-center">
        <span class="ios-card px-6 py-3 text-[15px] text-gray-700">
          {{ pageInfo.page }} / {{ Math.ceil(pageInfo.total / pageInfo.pageSize) }}
        </span>
      </div>
      <button
        :disabled="pageInfo.page >= Math.ceil(pageInfo.total / pageInfo.pageSize)"
        @click="changePage(pageInfo.page + 1)"
        class="ios-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        下一页
      </button>
    </div>

    <!-- 创建/编辑标签模态框 -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300">
        <h2 class="text-[24px] font-bold text-gray-900 mb-6">
          {{ showEditModal ? '编辑标签' : '创建标签' }}
        </h2>
        <div class="space-y-6">
          <div>
            <label class="block text-[15px] font-medium text-gray-700 mb-2">标签名称</label>
            <input
              v-model="tagForm.name"
              type="text"
              class="ios-input w-full"
              placeholder="输入标签名称"
            />
          </div>
          <div>
            <label class="block text-[15px] font-medium text-gray-700 mb-2">标签标识</label>
            <input
              v-model="tagForm.slug"
              type="text"
              :disabled="showEditModal"
              class="ios-input w-full disabled:bg-gray-50"
              placeholder="输入标签标识"
            />
          </div>
          <div>
            <label class="block text-[15px] font-medium text-gray-700 mb-2">描述</label>
            <textarea
              v-model="tagForm.description"
              rows="3"
              class="ios-input w-full"
              placeholder="输入标签描述（可选）"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end space-x-4 mt-8">
          <button
            @click="closeModal"
            class="px-6 py-3 text-[15px] font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300"
          >
            取消
          </button>
          <button
            @click="submitTag"
            :disabled="loading"
            class="ios-button"
          >
            {{ loading ? '提交中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useTagStore } from './store'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'

const tagStore = useTagStore()
const authStore = useAuthStore()
const { tags, loading, pageInfo } = storeToRefs(tagStore)
const { isAuthenticated, user } = storeToRefs(authStore)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const tagForm = ref({
  name: '',
  slug: '',
  description: ''
})

const refreshData = () => {
  tagStore.fetchTags(pageInfo.value.page, pageInfo.value.pageSize)
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  tagForm.value = {
    name: '',
    slug: '',
    description: ''
  }
}

const editTag = (tag: any) => {
  tagForm.value = {
    name: tag.name,
    slug: tag.slug,
    description: tag.description || ''
  }
  showEditModal.value = true
}

const deleteTag = async (tag: any) => {
  if (!confirm(`确定要删除标签 "${tag.name}" 吗？`)) return
  try {
    await tagStore.deleteTag(tag.slug)
    await refreshData()
  } catch (error) {
    alert('删除失败：' + error)
  }
}

const submitTag = async () => {
  try {
    if (showEditModal.value) {
      await tagStore.updateTag(tagForm.value.slug, {
        name: tagForm.value.name,
        description: tagForm.value.description
      })
    } else {
      await tagStore.createTag(tagForm.value)
    }
    await refreshData()
    closeModal()
  } catch (error) {
    alert((showEditModal.value ? '编辑' : '创建') + '失败：' + error)
  }
}

const changePage = (page: number) => {
  tagStore.fetchTags(page, pageInfo.value.pageSize)
}

onMounted(() => {
  refreshData()
})

onActivated(() => {
  refreshData()
})
</script> 