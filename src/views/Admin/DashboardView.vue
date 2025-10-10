
<script setup>
import {  reactive } from 'vue'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'

const dashboardStats = reactive({
  products: { count: 1247, change: 12.5, trend: 'up' },
  clients: { count: 8943, change: 8.2, trend: 'up' },
  orders: { count: 456, change: -3.1, trend: 'down' },
  revenue: { count: '$125,430', change: 15.7, trend: 'up' }
})

const recentOrders = reactive([
  { id: 'ORD-001', customer: 'John Doe', product: 'iPhone 15 Pro', amount: '$1,199', status: 'Delivered', date: '2024-09-10' },
  { id: 'ORD-002', customer: 'Jane Smith', product: 'MacBook Pro 14"', amount: '$2,399', status: 'Processing', date: '2024-09-09' },
  { id: 'ORD-003', customer: 'Mike Johnson', product: 'Samsung Galaxy S24', amount: '$899', status: 'Shipped', date: '2024-09-08' },
  { id: 'ORD-004', customer: 'Sarah Wilson', product: 'Apple Watch Series 9', amount: '$399', status: 'Pending', date: '2024-09-07' }
])

const lowStockProducts = reactive([
  { name: 'iPhone 15 Pro Max', stock: 5, category: 'Smartphones' },
  { name: 'Sony WH-1000XM5', stock: 8, category: 'Audio' },
  { name: 'Dell XPS 13', stock: 3, category: 'Laptops' },
  { name: 'Samsung QLED 65"', stock: 2, category: 'TVs' }
])


const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
    case 'Processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
    case 'Shipped':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <admin-sidebar></admin-sidebar>
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header></admin-header>
      <!-- Dashboard Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          </div>

          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <!-- Tables Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Orders Table -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
                <button class="bg-[#042EFF] cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
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
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ order.id }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ order.customer }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ order.amount }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="['inline-flex px-2 py-1 text-xs font-semibold rounded-full', getStatusColor(order.status)]">
                          {{ order.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div class="flex space-x-2">
                          <button class="text-[#042EFF] hover:text-blue-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </button>
                          <button class="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <!-- Low Stock Products Table -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Low Stock Alert</h2>
                <button class="bg-[#042EFF] cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
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
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
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
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div class="flex space-x-2">
                          <button class="text-[#042EFF] hover:text-blue-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                          </button>
                          <button class="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
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