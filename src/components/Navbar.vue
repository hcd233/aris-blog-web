<template>
  <nav class="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- 左侧导航链接 -->
        <div class="flex items-center space-x-8">
          <router-link
            to="/"
            class="text-[15px] font-medium text-gray-800 hover:text-primary-color transition-colors duration-300"
            active-class="text-primary-color"
          >
            首页
          </router-link>
          <router-link
            to="/posts"
            class="text-[15px] font-medium text-gray-800 hover:text-primary-color transition-colors duration-300"
            active-class="text-primary-color"
          >
            文章
          </router-link>
          <router-link
            to="/tag"
            class="text-[15px] font-medium text-gray-800 hover:text-primary-color transition-colors duration-300"
            active-class="text-primary-color"
          >
            标签
          </router-link>
          <router-link
            to="/about"
            class="text-[15px] font-medium text-gray-800 hover:text-primary-color transition-colors duration-300"
            active-class="text-primary-color"
          >
            关于
          </router-link>
        </div>

        <!-- 右侧用户信息 -->
        <div class="flex items-center space-x-4">
          <template v-if="isAuthenticated">
            <div class="relative" ref="dropdownRef">
              <button
                @click="toggleDropdown"
                class="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors duration-300"
              >
                <img
                  :src="user?.avatar"
                  :alt="user?.name"
                  class="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                />
                <span class="text-[15px] font-medium text-gray-800">{{ user?.name }}</span>
              </button>

              <!-- 下拉菜单 -->
              <div
                v-if="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100"
              >
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                >
                  退出登录
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="ios-button text-[15px]"
            >
              登录
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)

const dropdownRef = ref<HTMLElement | null>(null)
const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  showDropdown.value = false
  router.push('/')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 