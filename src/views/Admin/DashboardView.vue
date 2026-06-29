
<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'
import axiosClient from '@/axiosClient'

const dashboardStats = reactive({
  products: { count: 0, change: 0, trend: 'up' },
  clients: { count: 0, change: 0, trend: 'up' },
  orders: { count: 0, change: 0, trend: 'up' },
  revenue: { count: 'KSH 0', change: 0, trend: 'up' }
})
const recentOrders = reactive([])
const lowStockProducts = reactive([])
const authenticatedAdmin = ref(null)
const isLoading = ref(true)
const router = useRouter()
const THEME_KEY = 'theme'

// Currency formatting (KSH)
const formatCurrency = (n) => {
  const num = Number(n) || 0
  return `KSH ${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}


function getOrderTotal(order) {
  if (!order) return 0
  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = items.reduce((s, p) => s + (Number(p.total_price || 0) || (Number(p.price_at_purchase || 0) * Number(p.quantity || 0) || 0)), 0)
  const shipping = Number(order.shipping_cost || 0)
  return subtotal + shipping
}

function formatDate(input) {
  if (!input) return ''
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  const Y = d.getFullYear()
  const M = pad(d.getMonth() + 1)
  const D = pad(d.getDate())
  return `${Y}-${M}-${D}`
}

async function loadDashboard() {
  isLoading.value = true
  try {
    const res = await axiosClient.get('/api/admin/dashboard')
    const data = res.data || {}

    // authenticated admin comes with this payload — use it and redirect if missing
    authenticatedAdmin.value = data.authenticatedAdmin || null
    if (!authenticatedAdmin.value) {
      router.push('/admin/login')
      return
    }

    dashboardStats.products.count = data.totalProducts || 0
    dashboardStats.clients.count = data.totalClients || 0
    dashboardStats.orders.count = data.totalOrders || 0
    dashboardStats.revenue.count = formatCurrency(data.totalRevenue || 0)

    // compute simple month-over-month change for revenue
    const thisM = Number(data.revenueThisMonth || 0)
    const lastM = Number(data.revenueLastMonth || 0)
    const change = lastM ? ((thisM - lastM) / lastM) * 100 : 0
    dashboardStats.revenue.change = Math.round(change * 10) / 10
    dashboardStats.revenue.trend = change >= 0 ? 'up' : 'down'

    // recent orders and low stock
    recentOrders.splice(0, recentOrders.length, ...(Array.isArray(data.recentOrders) ? data.recentOrders : []))
    lowStockProducts.splice(0, lowStockProducts.length, ...(Array.isArray(data.lowStock) ? data.lowStock.map(p => ({ name: p.name, stock: p.stock_quantity ?? p.stock ?? p.stockQty ?? 0, category: p.category })) : []))
  } catch (e) {
    console.error('Failed to load dashboard data', e)
    if (e?.response?.status === 401) {
      router.push('/admin/login')
      return
    }
  } finally {
    isLoading.value = false
  }
}

let systemDarkQuery = null

function setDarkMode(enabled) {
  const root = document.documentElement
  const body = document.body

  if (enabled) {
    root.classList.add('dark')
    body.classList.add('dark')
  } else {
    root.classList.remove('dark')
    body.classList.remove('dark')
  }
}


function applyTheme(theme) {
  // Clean up previous system listener when switching away from Auto
  if (systemDarkQuery && systemDarkQuery.removeEventListener) {
    systemDarkQuery.removeEventListener('change', handleSystemThemeChange)
  }

  if (theme === 'Dark') {
    setDarkMode(true)
    return
  }

  if (theme === 'Light') {
    setDarkMode(false)
    return
  }
}



onMounted(() => {
   loadDashboard() 

     let initial = 'Light'
        const saved = localStorage.getItem(THEME_KEY)
        if (saved) {
          initial = saved 
        } 
      applyTheme(initial)
  })


function getStatusColor(status) {
  const s = String(status || '').toLowerCase()
  switch (s) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'in transit':
    case 'in_transit':
    case 'intransit':
      return 'bg-purple-100 text-purple-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
    case 'canceled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <admin-sidebar :admin="authenticatedAdmin"></admin-sidebar>
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header :admin="authenticatedAdmin"></admin-header>
      <!-- Dashboard Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p v-if="authenticatedAdmin" class="mt-1 text-sm text-gray-600 dark:text-gray-300">Welcome, {{ authenticatedAdmin.fullName }}</p>
          </div>

          <!-- Stats Cards -->
          <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Products Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Products In Stock</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ dashboardStats.products.count }}</p>
                </div>
                <div class="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-full">
                  <svg class="h-6 w-6 text-[#042EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                  </svg>
                </div>
              </div>
              <div class="mt-4 flex items-center">
                <svg v-if="dashboardStats.products.trend === 'up'" class="h-4 w-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <svg v-else class="h-4 w-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                </svg>
                <span :class="[
                  'text-sm font-medium',
                  dashboardStats.products.trend === 'up' ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ dashboardStats.products.change }}%
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
              </div>
            </div>

            <!-- Clients Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Clients</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ dashboardStats.clients.count }}</p>
                </div>
                <div class="p-3 bg-green-100 dark:bg-green-500/20 rounded-full">
                  <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
              </div>
              <div class="mt-4 flex items-center">
                <svg v-if="dashboardStats.clients.trend === 'up'" class="h-4 w-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <span class="text-sm font-medium text-green-600">{{ dashboardStats.clients.change }}%</span>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
              </div>
            </div>

            <!-- Orders Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Orders</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ dashboardStats.orders.count }}</p>
                </div>
                <div class="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-full">
                  <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h1M9 19a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"/>
                  </svg>
                </div>
              </div>
              <div class="mt-4 flex items-center">
                <svg class="h-4 w-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                </svg>
                <span class="text-sm font-medium text-red-600">{{ Math.abs(dashboardStats.orders.change) }}%</span>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
              </div>
            </div>

            <!-- Revenue Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Total Revenue</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ dashboardStats.revenue.count }}</p>
                </div>
                <div class="p-3 bg-yellow-100 dark:bg-yellow-500/20 rounded-full">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
              <div class="mt-4 flex items-center">
                <svg class="h-4 w-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
                <span class="text-sm font-medium text-green-600">{{ dashboardStats.revenue.change }}%</span>
                <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
              </div>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div v-for="i in 4" :key="i" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
              <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>

          <!-- Tables Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Orders Table -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
              <div v-if="isLoading" class="p-6">
                <div class="space-y-3">
                  <div v-for="i in 4" :key="i" class="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div v-else>
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
                <button  @click="router.push({ name: 'admin-orders' })" class="bg-[#042EFF] cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  View All Orders
                </button>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ order.order_tracking_number }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ order.user?.name || order.user?.fullName || 'Unknown' }}</td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(getOrderTotal(order)) }}</td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getStatusColor(order.status)]">
                              {{ order.status }}
                            </span>
                          </td>
                        </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
            <!-- Low Stock Products Table -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
              <div v-if="isLoading" class="p-6">
                <div class="space-y-3">
                  <div v-for="i in 6" :key="i" class="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div v-else>
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Low Stock Alert</h2>
                <button @click="router.push({ name: 'admin-stock' })" class="bg-[#042EFF] cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  Manage Stock
                </button>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="(product, index) in lowStockProducts" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ product.name }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ product.category }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300">
                          {{ product.stock }} left
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>

        </div>
        
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
.bg-\[\#042EFF\] {
  background-color: #042EFF;
}

.text-\[\#042EFF\] {
  color: #042EFF;
}

.border-\[\#042EFF\] {
  border-color: #042EFF;
}

.ring-\[\#042EFF\] {
  --tw-ring-color: #042EFF;
}

.focus\:ring-\[\#042EFF\]:focus {
  --tw-ring-color: #042EFF;
}

.focus\:border-\[\#042EFF\]:focus {
  border-color: #042EFF;
}
</style>