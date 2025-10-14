<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'success' }, // success | warning | error | info
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // ms, 0 = no auto close
  zIndex: { type: [Number, String], default: 60 },
})

const emit = defineEmits(['close'])

let timerId = null
onMounted(() => {
  if (props.duration > 0) {
    timerId = setTimeout(() => emit('close'), props.duration)
  }
})
onBeforeUnmount(() => {
  if (timerId) clearTimeout(timerId)
})

const accent = computed(() => {
  switch (props.type) {
    case 'success': {
      return '#10b981' // emerald-500
    }
    case 'warning': {
      return '#f59e0b' // amber-500
    }
    case 'error': {
      return '#ef4444' // red-500
    }
    default: {
      return '#3b82f6' // blue-500 (info)
    }
  }
})

const borderClasses = computed(() => {
  switch (props.type) {
    case 'success': {
      return 'border-green-200 dark:border-green-700'
    }
    case 'warning': {
      return 'border-yellow-200 dark:border-yellow-700'
    }
    case 'error': {
      return 'border-red-200 dark:border-red-700'
    }
    default: {
      return 'border-blue-200 dark:border-blue-700'
    }
  }
})

const titleClasses = computed(() => {
  switch (props.type) {
    case 'success': {
      return 'text-green-800 dark:text-green-300'
    }
    case 'warning': {
      return 'text-yellow-800 dark:text-yellow-300'
    }
    case 'error': {
      return 'text-red-800 dark:text-red-300'
    }
    default: {
      return 'text-blue-800 dark:text-blue-300'
    }
  }
})

const messageClasses = computed(() => {
  switch (props.type) {
    case 'success': {
      return 'text-green-600 dark:text-green-400'
    }
    case 'warning': {
      return 'text-yellow-600 dark:text-yellow-400'
    }
    case 'error': {
      return 'text-red-600 dark:text-red-400'
    }
    default: {
      return 'text-blue-600 dark:text-blue-400'
    }
  }
})
</script>

<template>
  <teleport to="body">
    <div class="toast-wrapper fixed top-6 right-6" :style="{ zIndex: String(zIndex) }" role="status" aria-live="polite">
      <div class="toast-card bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center max-w-md animate-slide-in-right border"
           :class="borderClasses"
           :style="{ borderLeft: `4px solid ${accent}` }">
        <div class="flex-shrink-0">
          <!-- Icons per type -->
          <svg v-if="type==='success'" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="type==='warning'" class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M4.93 19h14.14c1.09 0 1.77-1.18 1.23-2.12L13.24 4.88c-.54-.94-1.9-.94-2.44 0L3.7 16.88C3.16 17.82 3.84 19 4.93 19z" />
          </svg>
          <svg v-else-if="type==='error'" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 18h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p v-if="title" class="text-sm font-medium" :class="titleClasses">{{ title }}</p>
          <p v-if="message" class="text-xs mt-1" :class="messageClasses">{{ message }}</p>
        </div>
        <button class="ml-4 flex-shrink-0 text-current/60 hover:text-current transition-colors" @click="$emit('close')" aria-label="Close notification">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* Match AddProductView animation */
.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out;
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

.toast-wrapper {
   backdrop-filter: blur(10px); 
  }
.toast-card {
   transition: all 0.2s ease-out; 
  }
.toast-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
</style>
