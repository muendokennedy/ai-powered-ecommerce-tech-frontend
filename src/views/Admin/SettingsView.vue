<script setup>
import { reactive, ref } from 'vue'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'

const showEditProfileModal = ref(false)
const showAdminDetailsModal = ref(false)
const showDeleteConfirmModal = ref(false)
const selectedAdmin = ref(null)
const adminToDelete = ref(null)

// Current logged in admin (simulated)
const currentAdmin = reactive({
  id: 'ADM-001',
  name: 'Alex Thompson',
  email: 'alex.thompson@admin.com',
  phone: '+1 (555) 123-4567',
  role: 'Primary Admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  joinDate: '2023-01-15',
  lastLogin: '2024-09-26 10:30 AM',
  department: 'Operations',
  location: 'New York, NY',
  permissions: {
    userManagement: true,
    orderManagement: true,
    productManagement: true,
    systemSettings: true,
    financialReports: true,
    analytics: true
  },
  preferences: {
    theme: 'Light',
    language: 'English',
    timezone: 'EST (UTC-5)',
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true
  }
})

// Edit profile form
const editForm = reactive({
  name: '',
  email: '',
  phone: '',
  department: '',
  location: ''
})

// All admins data
const admins = reactive([
  {
    id: 'ADM-001',
    name: 'Alex Thompson',
    email: 'alex.thompson@admin.com',
    phone: '+1 (555) 123-4567',
    role: 'Primary Admin',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-01-15',
    lastLogin: '2024-09-26 10:30 AM',
    department: 'Operations',
    location: 'New York, NY',
    permissions: {
      userManagement: true,
      orderManagement: true,
      productManagement: true,
      systemSettings: true,
      financialReports: true,
      analytics: true
    },
    activityLog: [
      { action: 'Updated product inventory', date: '2024-09-26 09:15 AM' },
      { action: 'Processed order refund', date: '2024-09-25 03:22 PM' },
      { action: 'Added new admin user', date: '2024-09-24 11:45 AM' }
    ],
    totalActions: 1247,
    accountCreated: '2023-01-15'
  },
  {
    id: 'ADM-002',
    name: 'Sarah Chen',
    email: 'sarah.chen@admin.com',
    phone: '+1 (555) 987-6543',
    role: 'Secondary Admin',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-03-22',
    lastLogin: '2024-09-26 08:45 AM',
    department: 'Customer Service',
    location: 'Los Angeles, CA',
    permissions: {
      userManagement: true,
      orderManagement: true,
      productManagement: false,
      systemSettings: false,
      financialReports: false,
      analytics: true
    },
    activityLog: [
      { action: 'Resolved customer complaint', date: '2024-09-26 08:30 AM' },
      { action: 'Updated client information', date: '2024-09-25 04:15 PM' },
      { action: 'Processed order cancellation', date: '2024-09-25 02:10 PM' }
    ],
    totalActions: 856,
    accountCreated: '2023-03-22'
  },
  {
    id: 'ADM-003',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@admin.com',
    phone: '+1 (555) 456-7890',
    role: 'Secondary Admin',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-06-10',
    lastLogin: '2024-09-25 06:22 PM',
    department: 'Inventory',
    location: 'Chicago, IL',
    permissions: {
      userManagement: false,
      orderManagement: true,
      productManagement: true,
      systemSettings: false,
      financialReports: false,
      analytics: true
    },
    activityLog: [
      { action: 'Updated stock levels', date: '2024-09-25 06:00 PM' },
      { action: 'Added new products', date: '2024-09-25 02:30 PM' },
      { action: 'Generated inventory report', date: '2024-09-24 10:15 AM' }
    ],
    totalActions: 623,
    accountCreated: '2023-06-10'
  },
  {
    id: 'ADM-004',
    name: 'Emily Johnson',
    email: 'emily.johnson@admin.com',
    phone: '+1 (555) 321-0987',
    role: 'Secondary Admin',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-08-18',
    lastLogin: '2024-09-20 02:15 PM',
    department: 'Marketing',
    location: 'Miami, FL',
    permissions: {
      userManagement: false,
      orderManagement: false,
      productManagement: false,
      systemSettings: false,
      financialReports: false,
      analytics: true
    },
    activityLog: [
      { action: 'Updated marketing campaign', date: '2024-09-20 02:00 PM' },
      { action: 'Generated analytics report', date: '2024-09-19 11:30 AM' },
      { action: 'Updated client newsletter', date: '2024-09-18 09:45 AM' }
    ],
    totalActions: 234,
    accountCreated: '2023-08-18'
  }
])

const getRoleColor = (role) => {
  switch (role) {
    case 'Primary Admin': return 'bg-purple-100 text-purple-800'
    case 'Secondary Admin': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800'
    case 'Inactive': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const openEditProfile = () => {
  editForm.name = currentAdmin.name
  editForm.email = currentAdmin.email
  editForm.phone = currentAdmin.phone
  editForm.department = currentAdmin.department
  editForm.location = currentAdmin.location
  showEditProfileModal.value = true
}

const closeEditProfileModal = () => {
  showEditProfileModal.value = false
}

const saveProfile = () => {
  currentAdmin.name = editForm.name
  currentAdmin.email = editForm.email
  currentAdmin.phone = editForm.phone
  currentAdmin.department = editForm.department
  currentAdmin.location = editForm.location
  
  // Also update in admins array
  const adminIndex = admins.findIndex(a => a.id === currentAdmin.id)
  if (adminIndex > -1) {
    Object.assign(admins[adminIndex], {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      department: editForm.department,
      location: editForm.location
    })
  }
  
  alert('Profile updated successfully!')
  closeEditProfileModal()
}

const viewAdminDetails = (admin) => {
  selectedAdmin.value = admin
  showAdminDetailsModal.value = true
}

const closeAdminDetailsModal = () => {
  showAdminDetailsModal.value = false
  selectedAdmin.value = null
}

const confirmDeleteAdmin = (admin) => {
  if (admin.role === 'Primary Admin') {
    alert('Primary Admin cannot be deleted!')
    return
  }
  adminToDelete.value = admin
  showDeleteConfirmModal.value = true
}

const deleteAdmin = () => {
  if (adminToDelete.value) {
    const index = admins.findIndex(a => a.id === adminToDelete.value.id)
    if (index > -1) {
      admins.splice(index, 1)
    }
    showDeleteConfirmModal.value = false
    adminToDelete.value = null
  }
}

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false
  adminToDelete.value = null
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const updatePreference = (key, value) => {
  currentAdmin.preferences[key] = value
  alert(`${key} preference updated!`)
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <admin-sidebar></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header></admin-header>
      
      <!-- Settings Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
            <p class="text-gray-600 mt-2">Manage your profile and system administrators</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Profile Section -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Current Admin Profile -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900">My Profile</h3>
                  <button @click="openEditProfile" class="bg-[#042EFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                    Edit Profile
                  </button>
                </div>
                
                <div class="p-6">
                  <div class="flex items-start space-x-6">
                    <img :src="currentAdmin.avatar" :alt="currentAdmin.name" class="h-20 w-20 rounded-full object-cover">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-2">
                        <h2 class="text-2xl font-bold text-gray-900">{{ currentAdmin.name }}</h2>
                        <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getRoleColor(currentAdmin.role)]">
                          {{ currentAdmin.role }}
                        </span>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p class="text-sm text-gray-600">Email</p>
                          <p class="font-medium">{{ currentAdmin.email }}</p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Phone</p>
                          <p class="font-medium">{{ currentAdmin.phone }}</p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Department</p>
                          <p class="font-medium">{{ currentAdmin.department }}</p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Location</p>
                          <p class="font-medium">{{ currentAdmin.location }}</p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Join Date</p>
                          <p class="font-medium">{{ formatDate(currentAdmin.joinDate) }}</p>
                        </div>
                        <div>
                          <p class="text-sm text-gray-600">Last Login</p>
                          <p class="font-medium">{{ currentAdmin.lastLogin }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- System Administrators Table -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-900">System Administrators</h3>
                </div>
                
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="admin in admins" :key="admin.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <img :src="admin.avatar" :alt="admin.name" class="h-10 w-10 rounded-full object-cover mr-4">
                            <div>
                              <div class="text-sm font-medium text-gray-900">{{ admin.name }}</div>
                              <div class="text-sm text-gray-500">{{ admin.id }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900">{{ admin.email }}</div>
                          <div class="text-sm text-gray-500">{{ admin.phone }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getRoleColor(admin.role)]">
                            {{ admin.role }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ admin.department }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(admin.status)]">
                            {{ admin.status }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ admin.lastLogin }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div class="flex space-x-2">
                            <button @click="viewAdminDetails(admin)" class="text-[#042EFF] hover:text-blue-600" title="View Details">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                            </button>
                            <button 
                              @click="confirmDeleteAdmin(admin)" 
                              :class="[
                                'hover:text-red-800',
                                admin.role === 'Primary Admin' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'
                              ]" 
                              :disabled="admin.role === 'Primary Admin'"
                              :title="admin.role === 'Primary Admin' ? 'Primary Admin cannot be deleted' : 'Delete Admin'"
                            >
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

            <!-- Preferences Section -->
            <div class="space-y-6">
              <!-- Account Preferences -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-900">Preferences</h3>
                </div>
                
                <div class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select 
                      :value="currentAdmin.preferences.theme"
                      @change="updatePreference('theme', $event.target.value)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                      <option value="Light">Light</option>
                      <option value="Dark">Dark</option>
                      <option value="Auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select 
                      :value="currentAdmin.preferences.language"
                      @change="updatePreference('language', $event.target.value)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select 
                      :value="currentAdmin.preferences.timezone"
                      @change="updatePreference('timezone', $event.target.value)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                      <option value="EST (UTC-5)">EST (UTC-5)</option>
                      <option value="CST (UTC-6)">CST (UTC-6)</option>
                      <option value="PST (UTC-8)">PST (UTC-8)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Notification Preferences -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Email Notifications</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        :checked="currentAdmin.preferences.emailNotifications"
                        @change="updatePreference('emailNotifications', $event.target.checked)"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#042EFF]"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">SMS Notifications</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        :checked="currentAdmin.preferences.smsNotifications"
                        @change="updatePreference('smsNotifications', $event.target.checked)"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#042EFF]"></div>
                    </label>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Weekly Reports</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        :checked="currentAdmin.preferences.weeklyReports"
                        @change="updatePreference('weeklyReports', $event.target.checked)"
                        class="sr-only peer"
                      >
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#042EFF]"></div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Permissions Overview -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-900">My Permissions</h3>
                </div>
                
                <div class="p-6 space-y-3">
                  <div v-for="(hasPermission, permission) in currentAdmin.permissions" :key="permission" class="flex items-center justify-between">
                    <span class="text-sm text-gray-700 capitalize">{{ permission.replace(/([A-Z])/g, ' $1').trim() }}</span>
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', hasPermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                      {{ hasPermission ? 'Granted' : 'Denied' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditProfileModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Profile</h3>
                
                <form @submit.prevent="saveProfile" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      v-model="editForm.name"
                      type="text" 
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                      v-model="editForm.email"
                      type="email" 
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      v-model="editForm.phone"
                      type="tel" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input 
                      v-model="editForm.department"
                      type="text" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input 
                      v-model="editForm.location"
                      type="text" 
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="saveProfile" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#042EFF] text-base font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#042EFF] sm:ml-3 sm:w-auto sm:text-sm">
              Save Changes
            </button>
            <button @click="closeEditProfileModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#042EFF] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Details Modal -->
    <div v-if="showAdminDetailsModal && selectedAdmin" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeAdminDetailsModal"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-6 py-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center">
                <img :src="selectedAdmin.avatar" :alt="selectedAdmin.name" class="h-16 w-16 rounded-full object-cover mr-4">
                <div>
                  <h3 class="text-2xl leading-6 font-bold text-gray-900">{{ selectedAdmin.name }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ selectedAdmin.id }} • {{ selectedAdmin.department }}</p>
                  <div class="flex items-center space-x-2 mt-2">
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getRoleColor(selectedAdmin.role)]">
                      {{ selectedAdmin.role }}
                    </span>
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(selectedAdmin.status)]">
                      {{ selectedAdmin.status }}
                    </span>
                  </div>
                </div>
              </div>
              <button @click="closeAdminDetailsModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Admin Information -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Contact Information -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-600">Email Address</p>
                      <p class="font-medium">{{ selectedAdmin.email }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">Phone Number</p>
                      <p class="font-medium">{{ selectedAdmin.phone }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">Department</p>
                      <p class="font-medium">{{ selectedAdmin.department }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">Location</p>
                      <p class="font-medium">{{ selectedAdmin.location }}</p>
                    </div>
                  </div>
                </div>

                <!-- Account Information -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Account Information</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-600">Join Date</p>
                      <p class="font-medium">{{ formatDate(selectedAdmin.joinDate) }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">Last Login</p>
                      <p class="font-medium">{{ selectedAdmin.lastLogin }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">Total Actions</p>
                      <p class="font-medium">{{ selectedAdmin.totalActions.toLocaleString() }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600">Account Status</p>
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(selectedAdmin.status)]">
                        {{ selectedAdmin.status }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Permissions -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">System Permissions</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="(hasPermission, permission) in selectedAdmin.permissions" :key="permission" class="flex items-center justify-between">
                      <span class="text-sm text-gray-700 capitalize">{{ permission.replace(/([A-Z])/g, ' $1').trim() }}</span>
                      <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', hasPermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                        {{ hasPermission ? 'Granted' : 'Denied' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                  <div class="space-y-3">
                    <div v-for="activity in selectedAdmin.activityLog" :key="activity.date" class="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p class="font-medium text-gray-900">{{ activity.action }}</p>
                        <p class="text-sm text-gray-600">{{ activity.date }}</p>
                      </div>
                      <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Statistics and Actions -->
              <div class="space-y-6">
                <!-- Admin Statistics -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Admin Statistics</h4>
                  <div class="space-y-4">
                    <div class="text-center">
                      <p class="text-3xl font-bold text-[#042EFF]">{{ selectedAdmin.totalActions }}</p>
                      <p class="text-sm text-gray-600">Total Actions</p>
                    </div>
                    <div class="text-center">
                      <p class="text-lg font-semibold text-gray-900">{{ formatDate(selectedAdmin.accountCreated) }}</p>
                      <p class="text-sm text-gray-600">Account Created</p>
                    </div>
                    <div class="text-center">
                      <p class="text-lg font-semibold text-gray-900">{{ selectedAdmin.lastLogin }}</p>
                      <p class="text-sm text-gray-600">Last Activity</p>
                    </div>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                  <div class="space-y-3">
                    <button class="w-full bg-[#042EFF] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      Send Message
                    </button>
                    <button class="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Generate Report
                    </button>
                    <button class="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      {{ selectedAdmin.status === 'Active' ? 'Suspend Account' : 'Activate Account' }}
                    </button>
                    <button 
                      v-if="selectedAdmin.role !== 'Primary Admin'"
                      @click="confirmDeleteAdmin(selectedAdmin)"
                      class="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Delete Admin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Administrator</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{{ adminToDelete?.name }}</strong>? This action cannot be undone and will revoke all administrative access and permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="deleteAdmin" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
              Delete Administrator
            </button>
            <button @click="closeDeleteConfirmModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#042EFF] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
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

/* Toggle switch styles */
.peer:checked + div {
  background-color: #042EFF;
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