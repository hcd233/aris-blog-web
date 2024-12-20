<template>
  <nav class="bg-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-xl font-bold text-gray-800">
              Aris Blog
            </router-link>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              to="/"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-500 border-b-2 border-blue-500"
            >
              首页
            </router-link>
            <router-link
              to="/posts"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-500 border-b-2 border-blue-500"
            >
              文章
            </router-link>
            <router-link
              v-if="authStore.isCreator"
              to="/tag"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-500 border-b-2 border-blue-500"
            >
              标签管理
            </router-link>
            <router-link
              v-if="authStore.isCreator"
              to="/category"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              active-class="text-blue-500 border-b-2 border-blue-500"
            >
              目录管理
            </router-link>
          </div>
        </div>

        <div class="flex items-center">
          <template v-if="!authStore.isAuthenticated">
            <a
              href="/api/v1/oauth2/github/login"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              登录
            </a>
          </template>
          <template v-else>
            <div class="ml-3 relative">
              <div>
                <button
                  @click="showDropdown = !showDropdown"
                  class="flex text-sm rounded-full focus:outline-none"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <img
                    class="h-8 w-8 rounded-full"
                    :src="authStore.user?.avatar"
                    :alt="authStore.user?.name"
                  />
                </button>
              </div>

              <div
                v-if="showDropdown"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
                @click.stop
              >
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  @click="handleLogout"
                >
                  退出登录
                </a>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const showDropdown = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  showDropdown.value = false
}

// 点击页面其他地方关闭下拉菜单
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('#user-menu')) {
    showDropdown.value = false
  }
}

window.addEventListener('click', closeDropdown)
</script> 