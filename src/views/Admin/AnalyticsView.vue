<script setup>
import { reactive, ref, onMounted, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController
)

const activeMenuItem = ref('Analytics')
const totalRevenue = ref(847650)
const conversionRate = ref(3.24)
const avgOrderValue = ref(186)
const activeSessions = ref(2847)

const menuItems = reactive([
  { name: 'Dashboard', icon: 'home', active: false },
  { name: 'Analytics', icon: 'chart', active: true },
  { name: 'Products', icon: 'package', active: false },
  { name: 'Orders', icon: 'cart', active: false },
  { name: 'Stock', icon: 'archive', active: false },
  { name: 'Client Info', icon: 'users', active: false },
  { name: 'Settings', icon: 'settings', active: false }
])

const productCategories = reactive([
  { name: 'Smartphones', percentage: 35, color: 'bg-[#042EFF]' },
  { name: 'Laptops', percentage: 28, color: 'bg-green-500' },
  { name: 'TVs', percentage: 20, color: 'bg-yellow-500' },
  { name: 'Audio', percentage: 12, color: 'bg-purple-500' },
  { name: 'Accessories', percentage: 5, color: 'bg-red-500' }
])

const topProducts = reactive([
  { id: 1, name: 'iPhone 15 Pro Max', sku: 'IPH-15-PM-256', category: 'Smartphones', sales: 1247, revenue: 152430, growth: 12.3, performance: 92 },
  { id: 2, name: 'MacBook Pro 14"', sku: 'MBP-14-M3-512', category: 'Laptops', sales: 856, revenue: 189640, growth: 8.7, performance: 87 },
  { id: 3, name: 'Samsung QLED 65"', sku: 'SAM-Q65-4K', category: 'TVs', sales: 423, revenue: 84600, growth: -2.1, performance: 76 },
  { id: 4, name: 'AirPods Pro 2', sku: 'APP-2-USB-C', category: 'Audio', sales: 1832, revenue: 91600, growth: 15.2, performance: 94 },
  { id: 5, name: 'Dell XPS 13', sku: 'DELL-XPS-13-I7', category: 'Laptops', sales: 567, revenue: 113400, growth: 5.8, performance: 82 }
])

let cashflowChart = null
let ordersChart = null
let clientsChart = null
let productsChart = null

const handleMenuClick = (menuName) => {
  activeMenuItem.value = menuName
  menuItems.forEach(item => {
    item.active = item.name === menuName
  })
}

const getPerformanceColor = (performance) => {
  if (performance >= 90) return 'bg-green-500'
  if (performance >= 75) return 'bg-yellow-500'
  if (performance >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

const initializeCharts = async () => {
  await nextTick()
  
  
  // Cashflow Chart (Line Chart)
  const cashflowCtx = document.getElementById('cashflowChart')
  if (cashflowCtx) {
    try {
      cashflowChart = new Chart(cashflowCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
          {
            label: 'Revenue',
            data: [45000, 52000, 48000, 61000, 55000, 67000, 73000, 69000, 78000],
            borderColor: '#042EFF',
            backgroundColor: 'rgba(4, 46, 255, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Expenses',
            data: [32000, 38000, 35000, 42000, 39000, 45000, 48000, 46000, 52000],
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#F3F4F6'
            }
          },
          x: {
            grid: {
              color: '#F3F4F6'
            }
          }
        }
      }
    })
    console.log('Cashflow chart created successfully')
    } catch (error) {
      console.error('Error creating cashflow chart:', error)
    }
  } else {
    console.error('Cashflow canvas element not found')
  }

  // Orders Chart (Bar Chart)
  const ordersCtx = document.getElementById('ordersChart')
  console.log('Orders canvas element:', ordersCtx)
  if (ordersCtx) {
    try {
      ordersChart = new Chart(ordersCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [{
          label: 'Orders',
          data: [285, 356, 298, 412, 378, 445, 492, 456, 523],
          backgroundColor: '#042EFF',
          borderRadius: 6,
          maxBarThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#F3F4F6'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })
    console.log('Orders chart created successfully')
    } catch (error) {
      console.error('Error creating orders chart:', error)
    }
  } else {
    console.error('Orders canvas element not found')
  }

  // Clients Chart (Line Chart)
  const clientsCtx = document.getElementById('clientsChart')
  console.log('Clients canvas element:', clientsCtx)
  if (clientsCtx) {
    try {
      clientsChart = new Chart(clientsCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [{
          label: 'New Clients',
          data: [1200, 1450, 1320, 1680, 1520, 1890, 2100, 1980, 2340],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#F3F4F6'
            }
          },
          x: {
            grid: {
              color: '#F3F4F6'
            }
          }
        }
      }
    })
    console.log('Clients chart created successfully')
    } catch (error) {
      console.error('Error creating clients chart:', error)
    }
  } else {
    console.error('Clients canvas element not found')
  }

  // Products Chart (Doughnut Chart)
  const productsCtx = document.getElementById('productsChart')
  console.log('Products canvas element:', productsCtx)
  if (productsCtx) {
    try {
      productsChart = new Chart(productsCtx, {
      type: 'doughnut',
      data: {
        labels: productCategories.map(cat => cat.name),
        datasets: [{
          data: productCategories.map(cat => cat.percentage),
          backgroundColor: ['#042EFF', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
          borderWidth: 0,
          cutout: '70%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
    console.log('Products chart created successfully')
    } catch (error) {
      console.error('Error creating products chart:', error)
    }
  } else {
    console.error('Products canvas element not found')
  }
  
  console.log('All charts initialization completed')
}

onMounted(() => {
  // Initialize charts after component is mounted with longer delay
  setTimeout(initializeCharts, 500)
})
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <div class="w-64 bg-[#042EFF] text-white flex flex-col">
      <!-- Logo/Brand -->
      <div class="p-6 border-b border-blue-600">
        <h1 class="text-xl font-bold">TechStore Admin</h1>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <button
          v-for="item in menuItems"
          :key="item.name"
          @click="handleMenuClick(item.name)"
          :class="[
            'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200',
            item.active 
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
          <!-- Package Icon -->
          <svg v-else-if="item.icon === 'package'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          </svg>
          <!-- Shopping Cart Icon -->
          <svg v-else-if="item.icon === 'cart'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 3H3m4 10v6a1 1 0 001 1h1M9 19a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"/>
          </svg>
          <!-- Archive Icon -->
          <svg v-else-if="item.icon === 'archive'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 8v13H3V8m18 0-2-3H5l-2 3m18 0-2-3H5l-2 3m4 5h8"/>
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
        </button>
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

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Top Navigation -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Search Bar -->
          <div class="flex-1 max-w-md relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search analytics data..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#042EFF] focus:border-[#042EFF]"
            />
          </div>

          <!-- Profile -->
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">Admin User</p>
              <p class="text-xs text-gray-500">admin@techstore.com</p>
            </div>
            <img
              class="h-10 w-10 rounded-full border-2 border-[#042EFF]"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Admin Profile"
            />
          </div>
        </div>
      </header>

      <!-- Analytics Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p class="text-gray-600 mt-2">Comprehensive insights into your e-commerce performance</p>
          </div>

          <!-- Date Range Selector -->
          <div class="mb-6 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <select class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042EFF]">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
              <button class="bg-[#042EFF] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Export Report
              </button>
            </div>
            <div class="text-sm text-gray-500">
              Last updated: {{ new Date().toLocaleString() }}
            </div>
          </div>

          <!-- Key Metrics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total Revenue Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center">
                <div class="p-3 bg-blue-100 rounded-lg">
                  <svg class="h-6 w-6 text-[#042EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">${{ totalRevenue.toLocaleString() }}</p>
                  <p class="text-xs text-green-600 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                    +12.5% from last month
                  </p>
                </div>
              </div>
            </div>

            <!-- Conversion Rate Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p class="text-2xl font-bold text-gray-900">{{ conversionRate }}%</p>
                  <p class="text-xs text-green-600 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                    +2.1% improvement
                  </p>
                </div>
              </div>
            </div>

            <!-- Average Order Value Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 rounded-lg">
                  <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p class="text-2xl font-bold text-gray-900">${{ avgOrderValue }}</p>
                  <p class="text-xs text-red-600 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    -3.2% from last month
                  </p>
                </div>
              </div>
            </div>

            <!-- Active Sessions Card -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center">
                <div class="p-3 bg-yellow-100 rounded-lg">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Active Sessions</p>
                  <p class="text-2xl font-bold text-gray-900">{{ activeSessions.toLocaleString() }}</p>
                  <p class="text-xs text-green-600 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                    +8.3% increase
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Revenue vs Expenses Chart -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Cashflow Analysis</h3>
                <div class="flex items-center space-x-4">
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-[#042EFF] rounded-full mr-2"></div>
                    <span class="text-sm text-gray-600">Revenue</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span class="text-sm text-gray-600">Expenses</span>
                  </div>
                </div>
              </div>
              <div class="h-64">
                <canvas id="cashflowChart"></canvas>
              </div>
            </div>

            <!-- Monthly Orders Chart -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Monthly Orders</h3>
                <div class="text-sm text-gray-500">Last 9 months</div>
              </div>
              <div class="h-64">
                <canvas id="ordersChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Second Row Charts -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- New Clients Chart -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">New Clients Growth</h3>
                <div class="flex items-center">
                  <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm text-gray-600">New Clients</span>
                </div>
              </div>
              <div class="h-64">
                <canvas id="clientsChart"></canvas>
              </div>
            </div>

            <!-- Product Categories Chart -->
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-900">Product Categories</h3>
                <div class="text-sm text-gray-500">Sales distribution</div>
              </div>
              <div class="h-64 flex items-center justify-center">
                <div class="relative w-48 h-48">
                  <canvas id="productsChart"></canvas>
                </div>
                <div class="ml-8 space-y-3">
                  <div v-for="category in productCategories" :key="category.name" class="flex items-center">
                    <div :class="[category.color, 'w-4 h-4 rounded-full mr-3']"></div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-900">{{ category.name }}</span>
                        <span class="text-sm text-gray-600">{{ category.percentage }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Products Performance Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Top Performing Products</h3>
                <button class="bg-[#042EFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  View All Products
                </button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="product in topProducts" :key="product.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ product.sku }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ product.category }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ product.sales.toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${{ product.revenue.toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[
                        'inline-flex items-center text-sm font-medium',
                        product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      ]">
                        <svg v-if="product.growth >= 0" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <svg v-else class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        {{ Math.abs(product.growth) }}%
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            :class="[getPerformanceColor(product.performance), 'h-2 rounded-full transition-all duration-300']"
                            :style="{ width: product.performance + '%' }"
                          ></div>
                        </div>
                        <span class="text-sm text-gray-900 font-medium">{{ product.performance }}%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Chart container responsive behavior */
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

/* Performance bar animation */
.performance-bar {
  transition: width 0.5s ease-in-out;
}
</style>