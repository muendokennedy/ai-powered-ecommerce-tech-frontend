<script setup>
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = reactive([
  { name: 'Dashboard', icon: 'home', path: '/admin/dashboard' },
  { name: 'Analytics', icon: 'chart', path: '/admin/analytics' },
  { name: 'Stock', icon: 'archive', path: '/admin/stock' },
  { name: 'Orders', icon: 'cart', path: '/admin/orders' },
  { name: 'Client Info', icon: 'users', path: '/admin/clients' },
  { name: 'Settings', icon: 'settings', path: '/admin/settings' }
])

// Function to check if route is active
const isActiveRoute = (path) => {
  return route.path === path
}

</script>

<template>
      <!-- Sidebar -->
    <div class="w-64 bg-[#042EFF] text-white flex flex-col">
      <!-- Logo/Brand -->
      <div class="px-4 py-5 border-b border-blue-600 flex-shrink-0 text-center">
        <h1 class="text-2xl font-bold">MoTech</h1>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <router-link
          v-for="item in menuItems"
          :key="item.name"
          :to="item.path"
          :class="[
            'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200',
            isActiveRoute(item.path)
              ? 'bg-blue-600 text-white' 
              : 'text-blue-100 hover:bg-blue-600 hover:text-white'
          ]"
        >
          <!-- Home Icon -->
          <svg v-if="item.icon === 'home'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <!-- Chart Icon -->
          <svg v-else-if="item.icon === 'chart'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <!-- Archive Icon -->
          <svg v-else-if="item.icon === 'archive'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 8v13H3V8m18 0-2-3H5l-2 3m18 0-2-3H5l-2 3m4 5h8"/>
          </svg>
          <!-- Shopping Cart Icon -->
          <svg v-else-if="item.icon === 'cart'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h1M9 19a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"/>
          </svg>
          <!-- Users Icon -->
          <svg v-else-if="item.icon === 'users'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <!-- Settings Icon -->
          <svg v-else-if="item.icon === 'settings'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- Logout -->
      <div class="px-4 py-6 border-t border-blue-600">
        <button class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition-colors duration-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
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
</style>