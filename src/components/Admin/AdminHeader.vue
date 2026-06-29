<script setup>
import {computed, watch } from 'vue'

const { admin } = defineProps({
  admin: { type: Object, default: null }
})

// const displayImage
</script>
<template>
      <!-- Top Navigation -->
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div class="flex justify-center flex-col items-end">
          <!-- Profile -->
          <div class="flex items-center space-x-4">
            <div v-if="!admin" class="flex items-center space-x-4">
              <div class="h-10 w-10 rounded-full bg-gray-200 skeleton-shimmer"></div>
              <div class="text-right">
                <div class="h-4 bg-gray-200 skeleton-shimmer rounded w-32 mb-2"></div>
                <div class="h-3 bg-gray-200 skeleton-shimmer rounded w-20"></div>
              </div>
            </div>
            <div v-else class="flex items-center space-x-4">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ admin.fullName }}</p>
              </div>
              <img v-if="admin.profileImg"
                class="h-10 w-10 rounded-full border-2 border-[#042EFF]"
                :src="`http://localhost:8000${admin.profileImg}`"
                alt="Admin Profile"
              />
            </div>
          </div>
        </div>
      </header>
</template>
