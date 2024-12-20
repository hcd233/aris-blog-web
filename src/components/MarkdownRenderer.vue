<template>
  <div class="markdown-renderer">
    <Viewer :value="content" :plugins="plugins" />
  </div>
</template>

<script setup lang="ts">
import { Viewer } from '@bytemd/vue-next'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'

// 导入样式
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github.css'

const plugins = [
  gfm(),
  highlight()
]

defineProps<{
  content: string
}>()
</script>

<style scoped>
.markdown-renderer {
  @apply w-full max-w-4xl mx-auto px-4 py-6;
}

:deep(.markdown-body) {
  @apply prose prose-lg prose-slate max-w-none;
}

:deep(.markdown-body pre) {
  @apply bg-gray-50 rounded-lg p-4;
}

:deep(.markdown-body code) {
  @apply text-sm;
}

:deep(.markdown-body img) {
  @apply rounded-lg shadow-md max-w-full h-auto;
}

:deep(.markdown-body blockquote) {
  @apply border-l-4 border-gray-200 pl-4 italic text-gray-600;
}

:deep(.markdown-body table) {
  @apply border-collapse w-full;
}

:deep(.markdown-body th),
:deep(.markdown-body td) {
  @apply border border-gray-300 px-4 py-2;
}

:deep(.markdown-body th) {
  @apply bg-gray-50;
}
</style> 