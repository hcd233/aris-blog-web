<template>
  <div class="min-h-screen bg-[#F2F2F7]">
    <nav class="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 z-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- 左侧导航链接 -->
          <div class="flex items-center space-x-8">
            <router-link to="/" class="flex items-center space-x-2">
              <span class="text-xl font-bold text-gray-900">Aris Blog</span>
            </router-link>
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
                    v-if="user?.avatar"
                    :src="user.avatar"
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

    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { storeToRefs } from 'pinia'

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
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  if (isAuthenticated.value) {
    authStore.fetchUserInfo()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
:root {
  --primary-color: #007AFF;
  --secondary-color: #5856D6;
  --success-color: #34C759;
  --warning-color: #FF9500;
  --danger-color: #FF3B30;
  --background-primary: #F2F2F7;
  --background-secondary: #FFFFFF;
  --text-primary: #000000;
  --text-secondary: #6C6C6C;
  --text-tertiary: #8E8E93;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.ios-card {
  background: var(--background-secondary);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ios-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.ios-button {
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.ios-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.ios-button:active {
  transform: translateY(0);
}

.ios-input {
  background: var(--background-primary);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.ios-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
