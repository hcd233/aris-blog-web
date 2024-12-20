<template>
  <div class="min-h-[calc(100vh-12rem)] flex items-center justify-center">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <svg
          class="animate-spin h-10 w-10 mx-auto text-primary-color"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="text-lg text-gray-600">正在处理登录请求...</p>
      </div>
      <div v-else-if="error" class="space-y-4">
        <div class="text-red-500">
          <svg class="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p class="text-lg text-red-500">{{ error }}</p>
        <button
          @click="$router.push('/login')"
          class="mt-4 px-4 py-2 bg-primary-color text-white rounded-md hover:bg-secondary-color anime-transition"
        >
          返回登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'

const route = useRoute()
const authStore = useAuthStore()
const { loading, error } = storeToRefs(authStore)

onMounted(() => {
  const { code, state } = route.query
  if (code && state) {
    authStore.handleGithubCallback(code as string, state as string)
  } else {
    authStore.error = '无效的回调参数'
  }
})</script> 