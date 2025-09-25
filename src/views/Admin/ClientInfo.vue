<script setup>
import { reactive, ref, computed } from 'vue'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'

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

// Client data
const clients = reactive([
  {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    joinDate: '2024-01-15',
    lastOrderDate: '2024-09-10',
    totalOrders: 12,
    totalSpent: 14580.50,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    address: {
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    preferences: {
      newsletter: true,
      smsNotifications: false,
      emailNotifications: true
    },
    orderHistory: [
      { orderId: 'ORD-2024-001', date: '2024-09-10', amount: 1199, status: 'Delivered' },
      { orderId: 'ORD-2024-015', date: '2024-08-22', amount: 2399, status: 'Delivered' },
      { orderId: 'ORD-2024-032', date: '2024-07-15', amount: 899, status: 'Delivered' }
    ],
    loyaltyPoints: 1458,
    accountType: 'Premium'
  },
  {
    id: 'CUST-002',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1 (555) 987-6543',
    joinDate: '2024-02-08',
    lastOrderDate: '2024-09-12',
    totalOrders: 8,
    totalSpent: 8945.25,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=150&h=150&fit=crop&crop=face',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'United States'
    },
    preferences: {
      newsletter: true,
      smsNotifications: true,
      emailNotifications: true
    },
    orderHistory: [
      { orderId: 'ORD-2024-002', date: '2024-09-12', amount: 2828, status: 'Processing' },
      { orderId: 'ORD-2024-018', date: '2024-08-30', amount: 1299, status: 'Delivered' }
    ],
    loyaltyPoints: 894,
    accountType: 'Standard'
  },
  {
    id: 'CUST-003',
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    phone: '+1 (555) 456-7890',
    joinDate: '2024-03-22',
    lastOrderDate: '2024-09-08',
    totalOrders: 5,
    totalSpent: 4567.80,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    address: {
      street: '789 Pine Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'United States'
    },
    preferences: {
      newsletter: false,
      smsNotifications: false,
      emailNotifications: true
    },
    orderHistory: [
      { orderId: 'ORD-2024-003', date: '2024-09-08', amount: 1299, status: 'In Transit' },
      { orderId: 'ORD-2024-025', date: '2024-08-12', amount: 899, status: 'Delivered' }
    ],
    loyaltyPoints: 456,
    accountType: 'Standard'
  },
  {
    id: 'CUST-004',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+1 (555) 321-0987',
    joinDate: '2024-04-10',
    lastOrderDate: '2024-09-14',
    totalOrders: 3,
    totalSpent: 3245.75,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    address: {
      street: '321 Elm Drive',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'United States'
    },
    preferences: {
      newsletter: true,
      smsNotifications: true,
      emailNotifications: true
    },
    orderHistory: [
      { orderId: 'ORD-2024-004', date: '2024-09-14', amount: 1899, status: 'Pending' }
    ],
    loyaltyPoints: 324,
    accountType: 'Standard'
  },
  {
    id: 'CUST-005',
    name: 'David Brown',
    email: 'david.brown@email.com',
    phone: null,
    joinDate: '2024-05-18',
    lastOrderDate: null,
    totalOrders: 0,
    totalSpent: 0,
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    address: {
      street: '654 Maple Court',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'United States'
    },
    preferences: {
      newsletter: false,
      smsNotifications: false,
      emailNotifications: true
    },
    orderHistory: [],
    loyaltyPoints: 0,
    accountType: 'Standard'
  }
])

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
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.id.toLowerCase().includes(query) ||
      (client.phone && client.phone.toLowerCase().includes(query))
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
  <div class="flex h-screen bg-gray-50">
    <!-- Top-right Notification -->
    <transition name="slide-in-right">
      <div v-if="activeNotification" class="fixed top-4 right-4 z-[60] w-80">
        <div :class="[
          'rounded-md shadow-lg border p-4 flex items-start space-x-3',
          activeNotification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          activeNotification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          activeNotification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        ]">
          <div class="mt-0.5">
            <svg v-if="activeNotification.type === 'success'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else-if="activeNotification.type === 'warning'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <svg v-else-if="activeNotification.type === 'error'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 18h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold">{{ activeNotification.title }}</p>
            <p class="text-sm">{{ activeNotification.message }}</p>
          </div>
          <button class="text-current/80 hover:text-current" @click="activeNotification = null">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>
    <admin-sidebar></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header></admin-header>
      
      <!-- Client Info Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Client Information</h1>
            <p class="text-gray-600 mt-2">Manage and view detailed information about your clients</p>
          </div>

          <!-- Client Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center">
                <div class="p-3 bg-[#042EFF] bg-opacity-10 rounded-lg">
                  <svg class="h-6 w-6 text-[#042EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Clients</p>
                  <p class="text-2xl font-bold text-gray-900">{{ clients.length }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center">
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Active Clients</p>
                  <p class="text-2xl font-bold text-gray-900">{{ clients.filter(c => c.status === 'Active').length }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center">
                <div class="p-3 bg-purple-100 rounded-lg">
                  <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Premium Clients</p>
                  <p class="text-2xl font-bold text-gray-900">{{ clients.filter(c => c.accountType === 'Premium').length }}</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center">
                <div class="p-3 bg-yellow-100 rounded-lg">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p class="text-2xl font-bold text-gray-900">${{ clients.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Clients Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">All Clients</h3>
                
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
                      class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                  </div>
                  
                  <select 
                    v-model="statusFilter"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]"
                  >
                    <option v-for="status in statusOptions" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="client in filteredClients" :key="client.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img :src="client.avatar" :alt="client.name" class="h-10 w-10 rounded-full object-cover mr-4">
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ client.name }}</div>
                          <div class="text-sm text-gray-500">{{ client.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ client.email }}</div>
                      <div class="text-sm text-gray-500">{{ client.phone || 'No phone' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ client.totalOrders }}</div>
                      <div class="text-sm text-gray-500">{{ formatDate(client.lastOrderDate) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${{ client.totalSpent.toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getAccountTypeColor(client.accountType)]">
                        {{ client.accountType }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(client.status)]">
                        {{ client.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(client.joinDate) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button @click="viewClientDetails(client)" class="text-[#042EFF] hover:text-blue-600" title="View Details">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button @click="confirmDeleteClient(client)" class="text-red-600 hover:text-red-800" title="Delete Client">
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

    <!-- Client Details Modal (match OrdersView) -->
    <div 
      v-if="showClientDetailsModal && selectedClient"
      class="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm"
      @click.self="closeClientDetailsModal"
    >
      <div class="client-details relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-auto animate-fade-in border border-gray-100 h-[98%]">
        <!-- Sticky Header -->
        <div class="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-5 flex items-start justify-between">
              <div class="flex items-center">
                <img :src="selectedClient.avatar" :alt="selectedClient.name" class="h-16 w-16 rounded-full object-cover mr-4">
                <div>
                  <h3 class="text-2xl leading-6 font-bold text-gray-900">{{ selectedClient.name }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ selectedClient.id }} • Member since {{ formatDate(selectedClient.joinDate) }}</p>
                  <div class="flex items-center space-x-2 mt-2">
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(selectedClient.status)]">
                      {{ selectedClient.status }}
                    </span>
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getAccountTypeColor(selectedClient.accountType)]">
                      {{ selectedClient.accountType }}
                    </span>
                  </div>
                </div>
              </div>
              <button @click="closeClientDetailsModal" class="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Close">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <!-- Content -->
            <div class="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Basic Information -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Contact Information -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-600">Email Address</p>
                      <p class="font-medium">{{ selectedClient.email }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">Phone Number</p>
                      <p class="font-medium">{{ selectedClient.phone || 'Not provided' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Address Information -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
                  <div class="space-y-2">
                    <p class="font-medium">{{ selectedClient.address.street }}</p>
                    <p class="text-gray-600">{{ selectedClient.address.city }}, {{ selectedClient.address.state }} {{ selectedClient.address.zipCode }}</p>
                    <p class="text-gray-600">{{ selectedClient.address.country }}</p>
                  </div>
                </div>

                <!-- Order History -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Recent Order History</h4>
                  <div v-if="selectedClient.orderHistory.length > 0" class="space-y-3">
                    <div v-for="order in selectedClient.orderHistory" :key="order.orderId" class="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p class="font-medium text-gray-900">{{ order.orderId }}</p>
                        <p class="text-sm text-gray-600">{{ formatDate(order.date) }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-medium text-gray-900">${{ order.amount.toLocaleString() }}</p>
                        <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', getOrderStatusColor(order.status)]">
                          {{ order.status }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    <p class="text-gray-500 mt-2">No orders placed yet</p>
                  </div>
                </div>

                <!-- Preferences -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h4>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-700">Newsletter Subscription</span>
                      <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', selectedClient.preferences.newsletter ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                        {{ selectedClient.preferences.newsletter ? 'Enabled' : 'Disabled' }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-700">SMS Notifications</span>
                      <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', selectedClient.preferences.smsNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                        {{ selectedClient.preferences.smsNotifications ? 'Enabled' : 'Disabled' }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-gray-700">Email Notifications</span>
                      <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', selectedClient.preferences.emailNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                        {{ selectedClient.preferences.emailNotifications ? 'Enabled' : 'Disabled' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Statistics and Actions -->
              <div class="space-y-6">
                <!-- Client Statistics -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Client Statistics</h4>
                  <div class="space-y-4">
                    <div class="text-center">
                      <p class="text-3xl font-bold text-[#042EFF]">{{ selectedClient.totalOrders }}</p>
                      <p class="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div class="text-center">
                      <p class="text-3xl font-bold text-green-600">${{ selectedClient.totalSpent.toLocaleString() }}</p>
                      <p class="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div class="text-center">
                      <p class="text-3xl font-bold text-purple-600">{{ selectedClient.loyaltyPoints }}</p>
                      <p class="text-sm text-gray-600">Loyalty Points</p>
                    </div>
                    <div class="text-center">
                      <p class="text-lg font-semibold text-gray-900">{{ formatDate(selectedClient.lastOrderDate) }}</p>
                      <p class="text-sm text-gray-600">Last Order</p>
                    </div>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
                  <div class="space-y-3">
                    <button @click="openSendMessageModal" class="w-full bg-[#042EFF] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      Send Message
                    </button>
                    <button @click="deleteClientFromDetails" class="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
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
      <div class="relative w-full max-w-lg bg-white rounded-2xl text-left overflow-hidden shadow-2xl animate-fade-in border border-gray-100">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Send Message to {{ selectedClient?.name }}</h3>

              <form @submit.prevent="sendMessage" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                  <select
                    v-model="messageForm.priority"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    v-model="messageForm.subject"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    placeholder="Enter message subject"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    v-model="messageForm.message"
                    required
                    rows="6"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
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
      <div class="relative w-full max-w-lg bg-white rounded-2xl text-left overflow-hidden shadow-2xl animate-fade-in border border-gray-100">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Client</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{{ clientToDelete?.name }}</strong>? This action cannot be undone and will remove all associated data including order history and personal information.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="deleteClient" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
              Delete Client
            </button>
            <button @click="closeDeleteConfirmModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#042EFF] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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