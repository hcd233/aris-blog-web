<template>
  <div class="category-item">
    <div
      class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-color transition-colors duration-300"
    >
      <div class="flex items-center space-x-2">
        <button
          @click="toggleExpand"
          class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-primary-color transition-colors duration-300"
        >
          <svg
            :class="{ 'rotate-90': isExpanded }"
            class="w-4 h-4 transform transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <span class="text-[15px] font-medium text-gray-800">{{ category.name }}</span>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          @click="handleEdit"
          class="p-2 text-gray-500 hover:text-primary-color transition-colors duration-300"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          v-if="category.parentID !== 0"
          @click="handleDelete"
          class="p-2 text-gray-500 hover:text-danger-color transition-colors duration-300"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-if="isExpanded"
      class="pl-8 mt-2 space-y-2"
    >
      <CategoryTreeItem
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @fetch-sub="$emit('fetch-sub', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Category {
  id: number
  name: string
  parentID?: number
  children?: Category[]
}

const props = defineProps<{
  category: Category
}>()

const emit = defineEmits<{
  (e: 'edit', payload: number): void
  (e: 'delete', payload: number): void
  (e: 'fetch-sub', payload: number): void
}>()

const isExpanded = ref(false)

const toggleExpand = async () => {
  if (!isExpanded.value) {
    emit('fetch-sub', props.category.id)
  }
  isExpanded.value = !isExpanded.value
}

const handleEdit = () => {
  emit('edit', props.category.id)
}

const handleDelete = () => {
  emit('delete', props.category.id)
}
</script> 