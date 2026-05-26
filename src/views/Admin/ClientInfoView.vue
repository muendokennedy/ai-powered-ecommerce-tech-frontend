<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import axiosClient from '@/axiosClient'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'
import AdminToast from '@/components/Admin/AdminToast.vue'

const showClientDetailsModal = ref(false)
const showDeleteConfirmModal = ref(false)
const showSendMessageModal = ref(false)
const selectedClient = ref(null)
const clientToDelete = ref(null)
const searchQuery = ref('')
const statusFilter = ref('All')

// Notification state (slide-in-right)
const activeNotification = ref(null)
let notificationTimeoutId = null
const showNotification = ({ type = 'info', title = '', message = '', duration = 3500 } = {}) => {
  // clear any existing timeout to avoid race conditions
  if (notificationTimeoutId) {
    clearTimeout(notificationTimeoutId)
    notificationTimeoutId = null
  }
  activeNotification.value = { type, title, message }
  notificationTimeoutId = setTimeout(() => {
    activeNotification.value = null
    notificationTimeoutId = null
  }, duration)
}

// Message form data
const messageForm = reactive({
  subject: '',
  message: '',
  priority: 'Normal'
})

// Client data (loaded from server)
const clients = reactive([])

function formatCurrencyKSH(n) {
  const num = Number(n) || 0
  return `KSH ${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function formatDateShort(dateString) {
  if (!dateString) return 'Never'
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return 'Never'
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')} ${d.getFullYear()}`
}

async function loadClients() {
  try {
    const res = await axiosClient.get('/api/admin/clients')
    const payload = res.data
    const list = Array.isArray(payload.allClients) ? payload.allClients : Array.isArray(payload) ? payload : []
    // Map server objects directly, compute lastOrderDate and totals when needed
    clients.splice(0, clients.length, ...list.map(c => {
      const copy = { ...c }
      const orders = Array.isArray(c.orders) ? c.orders : []
      copy.totalOrders = orders.length
      // determine latest order created_at
      if (orders.length) {
        const latest = orders.reduce((a,b) => (new Date(a.created_at) > new Date(b.created_at) ? a : b))
        copy.lastOrderDate = latest.created_at || latest.date || null
      } else {
        copy.lastOrderDate = null
      }
      // compute totalSpent from orders shipping_cost if total not provided
      if (copy.totalSpent === undefined || copy.totalSpent === null) {
        const sum = orders.reduce((s,o) => s + (Number(o.total || o.total_price || o.shipping_cost || 0) || 0), 0)
        copy.totalSpent = sum
      }
      // join date from created_at
      copy.joinDate = c.created_at || c.joinDate || null
      // map orders -> orderHistory for the UI
      copy.orderHistory = orders.map(o => ({
        orderId: o.order_tracking_number || o.order_tracking || o.order_tracking_number || o.id,
        date: o.created_at || o.date || null,
        amount: Number(o.total || o.total_price || o.shipping_cost || 0) || 0,
        status: o.status || ''
      }))
      // ensure address object exists (derive from latest order if not provided)
      if (!copy.address) {
        const src = orders.length ? orders.reduce((a,b) => (new Date(a.created_at) > new Date(b.created_at) ? a : b)) : null
        copy.address = src ? {
          street: src.street_address || '',
          city: src['city/town'] || src.city || '',
          state: src.region || '',
          zipCode: src.postal_code || '',
          country: src.country || ''
        } : { street: '', city: '', state: '', zipCode: '', country: '' }
      }
      return copy
    }))
  } catch (e) {
    console.error('Failed to load clients', e)
  }
}

onMounted(() => { loadClients() })

const statusOptions = ['All', 'Active', 'Inactive']

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800'
    case 'Inactive': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getAccountTypeColor = (type) => {
  switch (type) {
    case 'Premium': return 'bg-purple-100 text-purple-800'
    case 'Standard': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const filteredClients = computed(() => {
  let filtered = clients
  
  if (statusFilter.value !== 'All') {
    filtered = filtered.filter(client => client.status === statusFilter.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(client => 
      String(client.name || '').toLowerCase().includes(query) ||
      String(client.email || '').toLowerCase().includes(query) ||
      String(client.id || '').toLowerCase().includes(query) ||
      (client.phone && String(client.phone).toLowerCase().includes(query))
    )
  }
  
  return filtered
})

const viewClientDetails = (client) => {
  selectedClient.value = client
  showClientDetailsModal.value = true
}

const confirmDeleteClient = (client) => {
  clientToDelete.value = client
  showDeleteConfirmModal.value = true
}

const deleteClient = () => {
  if (clientToDelete.value) {
    const index = clients.findIndex(c => c.id === clientToDelete.value.id)
    if (index > -1) {
      clients.splice(index, 1)
    }
    showDeleteConfirmModal.value = false
    clientToDelete.value = null
  }
}

const closeClientDetailsModal = () => {
  showClientDetailsModal.value = false
  selectedClient.value = null
}

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false
  clientToDelete.value = null
}

const openSendMessageModal = () => {
  showSendMessageModal.value = true
}

const closeSendMessageModal = () => {
  showSendMessageModal.value = false
  resetMessageForm()
}

const resetMessageForm = () => {
  messageForm.subject = ''
  messageForm.message = ''
  messageForm.priority = 'Normal'
}

const isSendingMessage = ref(false)
const sendMessage = () => {
  if (!messageForm.subject || !messageForm.message) {
    showNotification({ type: 'warning', title: 'Missing fields', message: 'Please fill in both subject and message.' })
    return
  }
  if (isSendingMessage.value) return
  isSendingMessage.value = true
  // simulate async send
  setTimeout(() => {
    isSendingMessage.value = false
    closeSendMessageModal()
    showNotification({
      type: 'success',
      title: 'Message sent',
      message: `Your message to ${selectedClient.value?.name || 'client'} was sent.`
    })
  }, 900)
}

const deleteClientFromDetails = () => {
  if (selectedClient.value) {
    confirmDeleteClient(selectedClient.value)
    closeClientDetailsModal()
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getOrderStatusColor = (status) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-800'
    case 'Processing': return 'bg-blue-100 text-blue-800'
    case 'In Transit': return 'bg-purple-100 text-purple-800'
    case 'Pending': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Top-right Notification -->
    <AdminToast
      v-if="activeNotification"
      :type="activeNotification.type"
      :title="activeNotification.title"
      :message="activeNotification.message"
      :zIndex="60"
      @close="activeNotification = null"
    />
    <admin-sidebar></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header></admin-header>
      
      <!-- Client Info Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-5xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Client Information</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Manage and view detailed information about your clients</p>
          </div>

          <!-- Client Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center">
                <div class="p-3 bg-[#042EFF] bg-opacity-10 rounded-lg">
                  <svg class="h-6 w-6 text-[#042EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ clients.length }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ clients.filter(c => c.status === 'Active').length }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 rounded-lg">
                  <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Premium Clients</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ clients.filter(c => c.accountType === 'Premium').length }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center">
                <div class="p-3 bg-yellow-100 rounded-lg">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatCurrencyKSH(clients.reduce((sum, c) => sum + (Number(c.totalSpent)||0), 0)) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Clients Table -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">All Clients</h3>
                
                <!-- Search and Filter -->
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search clients..."
                      class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    >
                  </div>
                  
                  <select 
                    v-model="statusFilter"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option v-for="status in statusOptions" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Spent</th>
                     <!-- Account Type column removed per request -->
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Join Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="client in filteredClients" :key="client.id" @click.stop="viewClientDetails(client)" class="hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                          <div>
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ client.name }}</div>
                            <div class="text-sm text-gray-500">{{ client.id }}</div>
                          </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900 dark:text-gray-100">{{ client.email }}</div>
                      <div class="text-sm text-gray-500">{{ client.phone || 'No phone' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ client.totalOrders }}</div>
                      <div class="text-sm text-gray-500">{{ formatDateShort(client.lastOrderDate) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ formatCurrencyKSH(client.totalSpent) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(client.status)]">
                        {{ client.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDateShort(client.joinDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button @click.stop="viewClientDetails(client)" class="text-[#042EFF] hover:text-blue-600" title="View Details">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button @click.stop="confirmDeleteClient(client)" class="text-red-600 hover:text-red-800" title="Delete Client">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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
      </main>
    </div>
  </div>

    <!-- Client Details Modal (match OrdersView styles) -->
    <div 
      v-if="showClientDetailsModal && selectedClient"
      class="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm"
      @click.self="closeClientDetailsModal"
    >
      <div class="client-details relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-auto animate-fade-in border border-gray-100 dark:border-gray-700 h-[98%]">
        <!-- Sticky Header -->
        <div class="sticky top-0 z-20 bg-white dark:bg-gray-900 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-start justify-between">
          <div class="flex items-center">
            <img v-if="selectedClient.avatar" :src="selectedClient.avatar" :alt="selectedClient.name" class="h-16 w-16 rounded-full object-cover mr-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm">
            <div>
              <div class="flex items-center space-x-3 mb-1">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{{ selectedClient.name }}</h3>
                <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', getStatusColor(selectedClient.status)]">{{ selectedClient.status }}</span>
                <!-- account type removed from details header -->
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                <span>ID: {{ selectedClient.id }}</span>
                <span>Member since: {{ formatDateShort(selectedClient.joinDate) }}</span>
                <span v-if="selectedClient.lastOrderDate">Last Order: {{ formatDateShort(selectedClient.lastOrderDate) }}</span>
              </div>
            </div>
          </div>
          <button @click="closeClientDetailsModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Close">
            <svg class="w-6 h-6 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left: Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Contact Card -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Contact</h4>
                <span class="text-xs text-gray-400 font-mono">Primary</span>
              </div>
              <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-xs uppercase font-semibold text-gray-500">Email</p>
                  <p class="font-medium text-gray-900 dark:text-gray-100 break-all">{{ selectedClient.email }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase font-semibold text-gray-500">Phone</p>
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedClient.phone || 'Not provided' }}</p>
                </div>
              </div>
            </div>

            <!-- Address Card -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Address</h4>
                <span class="text-xs text-gray-400 font-mono">Shipping</span>
              </div>
              <div class="p-5 space-y-2 text-sm">
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedClient.address.street }}</p>
                <p class="text-gray-600 dark:text-gray-400">{{ selectedClient.address.city }}, {{ selectedClient.address.state }} {{ selectedClient.address.zipCode }}</p>
                <p class="text-gray-600 dark:text-gray-400">{{ selectedClient.address.country }}</p>
              </div>
            </div>

            <!-- Order History Card -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Recent Orders</h4>
                <span class="text-xs text-gray-400 font-mono">{{ selectedClient.orderHistory.length }} entr{{ selectedClient.orderHistory.length === 1 ? 'y' : 'ies' }}</span>
              </div>
              <div v-if="selectedClient.orderHistory.length > 0" class="divide-y divide-gray-100 dark:divide-gray-700">
                <div v-for="order in selectedClient.orderHistory" :key="order.orderId" class="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-gray-100 font-mono truncate">{{ order.orderId }}</p>
                    <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Date: {{ formatDateShort(order.date) }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrencyKSH(order.amount) }}</p>
                    <span :class="['items-center px-2 py-1 rounded-full text-[10px] font-semibold', getOrderStatusColor(order.status)]">{{ order.status }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="p-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">No orders placed yet</p>
              </div>
            </div>

            

            <!-- Preferences Card -->
            <!-- <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3">
                <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Communication Preferences</h4>
              </div>
              <div class="p-5 text-sm">
                <dl class="divide-y divide-gray-100 dark:divide-gray-700">
                  <div class="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                    <dt class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Newsletter</dt>
                    <dd>
                      <span :class="['px-2 py-1 rounded-md text-[10px] font-semibold', selectedClient.preferences.newsletter ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200']">{{ selectedClient.preferences.newsletter ? 'Enabled' : 'Disabled' }}</span>
                    </dd>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <dt class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">SMS Notifications</dt>
                    <dd>
                      <span :class="['px-2 py-1 rounded-md text-[10px] font-semibold', selectedClient.preferences.smsNotifications ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200']">{{ selectedClient.preferences.smsNotifications ? 'Enabled' : 'Disabled' }}</span>
                    </dd>
                  </div>
                  <div class="flex items-center justify-between py-2 last:pb-0">
                    <dt class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Email Notifications</dt>
                    <dd>
                      <span :class="['px-2 py-1 rounded-md text-[10px] font-semibold', selectedClient.preferences.emailNotifications ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200']">{{ selectedClient.preferences.emailNotifications ? 'Enabled' : 'Disabled' }}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div> -->
          </div>

          <!-- Right: Stats & Actions -->
          <div class="space-y-6">
            <!-- Stats Card -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3">
                <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Client Metrics</h4>
              </div>
              <div class="p-5 grid grid-cols-2 gap-4 text-center">
                <div class="bg-white dark:bg-gray-900 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 p-4">
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ selectedClient.totalOrders }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">Orders</p>
                </div>
                <div class="bg-white dark:bg-gray-900 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 p-4">
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ formatCurrencyKSH(selectedClient.totalSpent) }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">Spent</p>
                </div>
                <div class="bg-white dark:bg-gray-900 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 p-4">
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ selectedClient.loyaltyPoints }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">Points</p>
                </div>
                <div class="bg-white dark:bg-gray-900 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 p-4">
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatDateShort(selectedClient.lastOrderDate) }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">Last Order</p>
                </div>
              </div>
            </div>

            <!-- Actions Card -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3">
                <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Actions</h4>
              </div>
              <div class="p-5 space-y-3">
                <button @click="openSendMessageModal" class="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#042EFF] text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Send Message
                </button>
                <button @click="deleteClientFromDetails" class="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Message Modal (match OrdersView backdrop) -->
    <div
      v-if="showSendMessageModal"
      class="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeSendMessageModal"
    >
      <div class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-700">
        <div class="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">Send Message to {{ selectedClient?.name }}</h3>

              <form @submit.prevent="sendMessage" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority Level</label>
                  <select
                    v-model="messageForm.priority"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                  <input
                    v-model="messageForm.subject"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter message subject"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                  <textarea
                    v-model="messageForm.message"
                    required
                    rows="6"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100 dark:border-gray-700">
          <button
            @click="sendMessage"
            :disabled="isSendingMessage"
            :class="[
              'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
              isSendingMessage ? 'bg-blue-400 text-white cursor-not-allowed focus:ring-[#042EFF]' : 'bg-[#042EFF] text-white hover:bg-blue-600 focus:ring-[#042EFF]'
            ]"
          >
            <svg v-if="isSendingMessage" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>{{ isSendingMessage ? 'Sending...' : 'Send Message' }}</span>
          </button>
          <button @click="closeSendMessageModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#042EFF] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal (match OrdersView backdrop) -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-700">
          <div class="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Delete Client</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete <strong>{{ clientToDelete?.name }}</strong>? This action cannot be undone and will remove all associated data including order history and personal information.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100 dark:border-gray-700">
            <button @click="deleteClient" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
              Delete Client
            </button>
            <button @click="closeDeleteConfirmModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#042EFF] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
</template>

<style scoped>
/* Slide-in-right notification */
.slide-in-right-enter-from,
.slide-in-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.slide-in-right-enter-active,
.slide-in-right-leave-active {
  transition: all 200ms ease;
}
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

.client-details::-webkit-scrollbar{
  width: 0;
}

/* Animations */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in { animation: fade-in .4s cubic-bezier(.4,0,.2,1); }
.animate-scale-in { animation: scale-in .35s cubic-bezier(.4,0,.2,1); }

/* Additional custom styles */
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