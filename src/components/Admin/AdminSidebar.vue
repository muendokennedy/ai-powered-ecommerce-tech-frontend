<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Collapsible sidebar state with persistence
const collapsed = ref(false)
function toggleCollapsed() {
  collapsed.value = !collapsed.value
}
onMounted(() => {
  try {
    const saved = localStorage.getItem('adminSidebarCollapsed')
    if (saved === '1') collapsed.value = true
  } catch {}
  window.addEventListener('keydown', onKeyDown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})
watch(collapsed, v => {
  try { localStorage.setItem('adminSidebarCollapsed', v ? '1' : '0') } catch {}
})
function onKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
    e.preventDefault()
    toggleCollapsed()
  }
}

const menuItems = reactive([
  { name: 'Dashboard', icon: 'home', path: '/admin/dashboard', section: 'Overview' },
  { name: 'Analytics', icon: 'chart', path: '/admin/analytics', section: 'Overview' },
  { name: 'Stock', icon: 'archive', path: '/admin/stock', section: 'Management' },
  { name: 'Orders', icon: 'cart', path: '/admin/orders', section: 'Management' },
  { name: 'Client Info', icon: 'users', path: '/admin/clients', section: 'Management' },
  { name: 'Settings', icon: 'settings', path: '/admin/settings', section: 'System' }
])

// Group menu by section for visual organization
const groupedMenu = computed(() => {
  const groups = {}
  for (const item of menuItems) {
    const key = item.section || 'Other'
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  }
  return Object.entries(groups).map(([title, items]) => ({ title, items }))
})

const isActiveRoute = (path) => route.path === path

// Tooltip (global, to avoid clipping)
const tooltipVisible = ref(false)
const tooltipText = ref('')
const tooltipPos = reactive({ top: 0, left: 0 })

function onItemEnter(e, text) {
  if (!collapsed.value) return
  const el = e.currentTarget
  if (!el) return
  const r = el.getBoundingClientRect()
  tooltipText.value = text
  tooltipPos.top = Math.round(r.top + r.height / 2)
  tooltipPos.left = Math.round(r.right + 12)
  tooltipVisible.value = true
}

function hideTooltip() {
  tooltipVisible.value = false
}

</script>

<template>
      <!-- Sidebar -->
  <div :class="['relative z-[999] isolate overflow-visible flex flex-col text-gray-800 dark:text-gray-100 transition-all duration-300', collapsed ? 'w-20' : 'w-72']">
      <!-- Decorative background layers for creativity -->
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-black"></div>
      <div class="absolute inset-0 -z-[9] opacity-20 dark:opacity-30" aria-hidden="true" style="background-image: radial-gradient(circle at 20% 10%, rgba(0,0,0,.06) 0, transparent 50%), radial-gradient(circle at 80% 30%, rgba(0,0,0,.05) 0, transparent 50%), radial-gradient(circle at 30% 70%, rgba(0,0,0,.04) 0, transparent 45%);"></div>

      <!-- Top: Brand and collapse toggle -->
      <div class="px-3 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-2 overflow-hidden">
          <div class="h-10 w-9 rounded-xl bg-white/90 text-[#042EFF] grid place-items-center font-extrabold shadow-sm dark:bg-white text-sm">M</div>
          <transition name="fade">
            <h1 v-if="!collapsed" class="text-xl font-bold tracking-tight drop-shadow-sm">MoTech</h1>
          </transition>
        </div>
        <button @click="toggleCollapsed" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" :title="collapsed ? 'Expand (Ctrl+B)' : 'Collapse (Ctrl+B)'"><svg :class="['w-5 h-5 transition-transform', collapsed ? '' : 'rotate-180']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7"/></svg></button>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-2 py-4 space-y-6 overflow-y-auto custom-scroll">
        <div v-for="group in groupedMenu" :key="group.title" class="space-y-2">
          <div class="px-2">
            <transition name="fade">
              <p v-if="!collapsed" class="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400">{{ group.title }}</p>
            </transition>
          </div>
          <div class="space-y-1">
            <router-link
              v-for="item in group.items"
              :key="item.name"
              :to="item.path"
              class="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 focus:outline-none"
              :class="[ isActiveRoute(item.path) ? 'bg-blue-50 dark:bg-white/5' : 'hover:bg-gray-100 dark:hover:bg-white/10', isActiveRoute(item.path) ? 'focus:ring-2 focus:ring-blue-200 dark:focus:ring-white/20' : 'focus:ring-2 focus:ring-blue-200 dark:focus:ring-white/20' ]"
              :aria-current="isActiveRoute(item.path) ? 'page' : undefined"
              :title="collapsed ? item.name : undefined"
              @mouseenter="(e) => onItemEnter(e, item.name)"
              @mouseleave="hideTooltip"
            >
              <!-- Active indicator -->
              <span :class="['absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full transition-all', isActiveRoute(item.path) ? 'bg-[#042EFF] dark:bg-white shadow-lg' : 'bg-transparent']"></span>

              <!-- Icon -->
              <div :class="['grid place-items-center rounded-md p-1.5 transition-colors', isActiveRoute(item.path) ? 'bg-[#042EFF] text-white dark:bg-white dark:text-[#042EFF]' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white']">
                <svg v-if="item.icon === 'home'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                <svg v-else-if="item.icon === 'chart'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <svg v-else-if="item.icon === 'archive'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 8v13H3V8m18 0-2-3H5l-2 3m18 0-2-3H5l-2 3m4 5h8"/>
                </svg>
                <svg v-else-if="item.icon === 'cart'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h1M9 19a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"/>
                </svg>
                <svg v-else-if="item.icon === 'users'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <svg v-else-if="item.icon === 'settings'" class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>

              <!-- Label -->
              <transition name="fade">
                <span v-if="!collapsed" class="text-sm font-medium truncate">{{ item.name }}</span>
              </transition>

              <!-- Inline tooltip removed; global Teleport used instead -->
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Bottom: Profile & Logout -->
    <div class="px-3 py-4 border-t border-gray-200 dark:border-white/10">
        <div class="flex items-center gap-3 mb-3 overflow-hidden">
      <img class="h-9 w-9 rounded-full ring-2 ring-gray-300 dark:ring-white/40" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face" alt="Admin" />
          <transition name="fade">
            <div v-if="!collapsed" class="leading-tight">
        <p class="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
        <p class="text-[11px] text-gray-500 dark:text-white/70">Online</p>
            </div>
          </transition>
        </div>
    <button class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span v-if="!collapsed">Logout</span>
        </button>
      </div>
    </div>

    <!-- Global tooltip for collapsed sidebar (avoids clipping) -->
    <teleport to="body">
      <div v-if="tooltipVisible"
           class="fixed pointer-events-none z-[10000]"
           :style="{ top: tooltipPos.top + 'px', left: tooltipPos.left + 'px', transform: 'translateY(-50%)' }">
        <div class="relative px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap select-none
                    bg-white text-gray-900 ring-1 ring-gray-200 shadow-md
                    dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:shadow-xl">
          <span class="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rotate-45
                        bg-white ring-1 ring-gray-200
                        dark:bg-gray-800 dark:ring-gray-700"></span>
          {{ tooltipText }}
        </div>
      </div>
    </teleport>
</template>

<style scoped>
/* Remove default router-link styling */
a {
  text-decoration: none;
}

a:hover {
  text-decoration: none;
}

/* Ensure router-link-active styling */
.router-link-active {
  background-color: rgb(37 99 235) !important; /* bg-blue-600 */
  color: white !important;
}
.custom-scroll::-webkit-scrollbar{
  width: 0;
}
</style>