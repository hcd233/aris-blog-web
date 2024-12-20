<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-primary-color">博客文章</h1>
    
    <div class="grid gap-6">
      <article v-for="i in 5" :key="i" class="bg-white rounded-lg shadow-md p-6 anime-transition hover:shadow-xl">
        <h2 class="text-2xl font-semibold mb-2 text-primary-color">文章标题</h2>
        <div class="text-sm text-gray-500 mb-4">
          <span>发布于 2024-01-01</span>
          <span class="mx-2">·</span>
          <span>分类: 动漫</span>
        </div>
        <p class="text-gray-600 mb-4">
          这是文章的摘要内容，简短介绍文章的主要内容和亮点...
        </p>
        <div class="flex items-center justify-between">
          <div class="flex space-x-2">
            <span class="px-2 py-1 bg-secondary-color/20 text-secondary-color rounded-full text-sm">
              #动漫
            </span>
            <span class="px-2 py-1 bg-secondary-color/20 text-secondary-color rounded-full text-sm">
              #二次元
            </span>
          </div>
          <button class="text-primary-color hover:text-secondary-color">
            阅读全文 →
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBlogStore } from '../stores/blog'

const store = useBlogStore()

onMounted(() => {
  store.fetchPosts()
})</script> 