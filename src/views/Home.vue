<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-12">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-color to-secondary-color bg-clip-text text-transparent mb-4">欢迎来到 Aris Blog</h1>
      <p class="text-gray-600 text-lg">在这里，你可以探索有趣的内容和分享你的见解。</p>
    </div>

    <!-- 主页内容区域 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
        <h2 class="text-2xl font-bold text-primary-color mb-4">最新文章</h2>
        <p class="text-gray-600">探索最新发布的精彩文章。</p>
        <router-link
          to="/posts"
          class="inline-block mt-4 text-primary-color hover:text-secondary-color transition-colors duration-300"
        >
          查看更多 →
        </router-link>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
        <h2 class="text-2xl font-bold text-primary-color mb-4">热门标签</h2>
        <p class="text-gray-600">浏览热门话题和分类标签。</p>
        <router-link
          to="/tag"
          class="inline-block mt-4 text-primary-color hover:text-secondary-color transition-colors duration-300"
        >
          查看更多 →
        </router-link>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
        <h2 class="text-2xl font-bold text-primary-color mb-4">关于我们</h2>
        <p class="text-gray-600">了解更多关于 Aris Blog 的信息。</p>
        <router-link
          to="/about"
          class="inline-block mt-4 text-primary-color hover:text-secondary-color transition-colors duration-300"
        >
          查看更多 →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const refreshData = () => {
  // 这里添加需要刷新的数据逻辑
  console.log('Home page refreshed')
}

onMounted(() => {
  refreshData()
})

onActivated(() => {
  refreshData()
})
</script> 