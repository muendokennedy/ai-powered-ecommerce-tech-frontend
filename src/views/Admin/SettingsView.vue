<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'
import AdminToast from '@/components/Admin/AdminToast.vue'

const showEditProfileModal = ref(false)
const showAdminDetailsModal = ref(false)
const showDeleteConfirmModal = ref(false)
const selectedAdmin = ref(null)
const adminToDelete = ref(null)
const showSuspendConfirmModal = ref(false)
// Local storage key for theme persistence
const THEME_KEY = 'theme'
// Send Message Modal state
const showMessageModal = ref(false)
const sendingMessage = ref(false)
const messageForm = reactive({ subject: '', body: '' })

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
// Departments list (could be sourced dynamically)
const departments = ['Operations','Customer Service','Inventory','Marketing']

// Avatar editing state
const newAvatarPreview = ref('')
const isDraggingAvatar = ref(false)
const fileInputRef = ref(null)

function triggerAvatarSelect(){
  if(fileInputRef.value) fileInputRef.value.click()
}
function handleAvatarFileList(files){
  if(!files || !files.length) return
  const file = files[0]
  if(!file.type.startsWith('image/')) {
    showNotification({ type:'warning', title:'Invalid File', message:'Please select an image file.' })
    return
  }
  if(newAvatarPreview.value) URL.revokeObjectURL(newAvatarPreview.value)
  newAvatarPreview.value = URL.createObjectURL(file)
}
function onAvatarChange(e){ handleAvatarFileList(e.target.files) }
function onAvatarDrop(e){
  e.preventDefault();
  isDraggingAvatar.value = false
  handleAvatarFileList(e.dataTransfer.files)
}
function onAvatarDragOver(e){ e.preventDefault(); isDraggingAvatar.value = true }
function onAvatarDragLeave(e){ e.preventDefault(); isDraggingAvatar.value = false }

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
  if(newAvatarPreview.value) {
    currentAdmin.avatar = newAvatarPreview.value
  }

  const adminIndex = admins.findIndex(a => a.id === currentAdmin.id)
  if (adminIndex > -1) {
    Object.assign(admins[adminIndex], {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      department: editForm.department,
      location: editForm.location,
      avatar: newAvatarPreview.value ? newAvatarPreview.value : admins[adminIndex].avatar
    })
  }

  showNotification({ type: 'success', title: 'Profile Updated', message: 'Your profile information has been saved.' })
  newAvatarPreview.value = ''
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

// --- Send Message Modal Logic ---
function openMessageModal() {
  if (!selectedAdmin.value) {
    showNotification({
      type: 'warning',
      title: 'No Admin Selected',
      message: 'Open an administrator profile first, then try again.'
    })
    return
  }
  showMessageModal.value = true
}

function closeMessageModal() {
  if (sendingMessage.value) {
    return
  }
  showMessageModal.value = false
  messageForm.subject = ''
  messageForm.body = ''
}

function sendAdminMessage() {
  if (!selectedAdmin.value) {
    return
  }
  const body = (messageForm.body || '').trim()
  if (!body) {
    showNotification({
      type: 'warning',
      title: 'Message Required',
      message: 'Please enter a message before sending.'
    })
    return
  }

  sendingMessage.value = true
  setTimeout(() => {
    sendingMessage.value = false
    showMessageModal.value = false
    showNotification({
      type: 'success',
      title: 'Message Sent',
      message: `Your message was sent to ${selectedAdmin.value.name}.`
    })
    messageForm.subject = ''
    messageForm.body = ''
  }, 800)
}

const confirmDeleteAdmin = (admin) => {
  if (admin.role === 'Primary Admin') {
    showNotification({ type: 'warning', title: 'Action Blocked', message: 'Primary Admin cannot be deleted.' })
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
      showNotification({ type: 'success', title: 'Admin Deleted', message: 'The administrator account was removed.' })
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

// --- Profile Metrics & Recent Activity (Derived) ---
const currentAdminRecord = computed(() => admins.find(a => a.id === currentAdmin.id))
const diffInDays = (from) => {
  const start = new Date(from)
  const now = new Date()
  return Math.max(0, Math.floor((now - start)/(1000*60*60*24)))
}
const profileMetrics = computed(() => {
  const a = currentAdminRecord.value
  if (!a) return []
  const permissionsEnabled = Object.values(a.permissions || {}).filter(Boolean).length
  return [
    { label: 'Total Actions', value: a.totalActions?.toLocaleString?.() || '—' },
    { label: 'Permissions Enabled', value: permissionsEnabled },
    { label: 'Days Active', value: diffInDays(a.joinDate) },
    { label: 'Last Login', value: a.lastLogin || '—' },
    { label: 'Joined', value: formatDate(a.joinDate) }
  ]
})
const recentActivity = computed(() => (currentAdminRecord.value?.activityLog || []).slice(0,6))

const updatePreference = (key, value) => {
  currentAdmin.preferences[key] = value

  // Apply theme immediately; the watcher will handle the toast to avoid duplicates.
  if (key === 'theme') {
    try {
      localStorage.setItem(THEME_KEY, String(value))
    } catch {}
    applyTheme(value)
    return
  }

  showNotification({
    type: 'success',
    title: 'Preference Saved',
    message: `${key.replace(/([A-Z])/g, ' $1')} updated.`
  })
}

// --- Permission Editing State for Admin Details Modal ---
const isEditingPermissions = ref(false)
const permissionDraft = ref({})

const startEditPermissions = () => {
  if (!selectedAdmin.value) return
  // Create a shallow copy of permissions to edit
  permissionDraft.value = { ...selectedAdmin.value.permissions }
  isEditingPermissions.value = true
}

const togglePermission = (key) => {
  if (!isEditingPermissions.value) return
  permissionDraft.value[key] = !permissionDraft.value[key]
}

const cancelEditPermissions = () => {
  isEditingPermissions.value = false
  permissionDraft.value = {}
}

const savePermissions = () => {
  if (!selectedAdmin.value || !isEditingPermissions.value) return
  // Persist to selectedAdmin
  selectedAdmin.value.permissions = { ...permissionDraft.value }
  // Persist to admins array
  const idx = admins.findIndex(a => a.id === selectedAdmin.value.id)
  if (idx > -1) {
    admins[idx].permissions = { ...permissionDraft.value }
  }
  isEditingPermissions.value = false
  showNotification({ type: 'success', title: 'Permissions Updated', message: 'Administrator permissions were saved.' })
}

// --- Suspend / Activate Account Logic ---
const isTogglingStatus = ref(false)
function performStatusToggle(newStatus){
  if (!selectedAdmin.value) return
  isTogglingStatus.value = true
  setTimeout(() => {
    selectedAdmin.value.status = newStatus
    const idx = admins.findIndex(a => a.id === selectedAdmin.value.id)
    if (idx > -1) admins[idx].status = newStatus
    isTogglingStatus.value = false
    showNotification({ type: 'success', title: 'Status Updated', message: `${selectedAdmin.value.name} is now ${newStatus}.` })
  }, 600)
}
const toggleSuspendAdmin = () => {
  if (!selectedAdmin.value) return
  if (isTogglingStatus.value) return
  if (selectedAdmin.value.status === 'Active') {
    if (selectedAdmin.value.role === 'Primary Admin') {
      showNotification({ type: 'warning', title: 'Protected Account', message: 'Primary Admin cannot be suspended.' })
      return
    }
    showSuspendConfirmModal.value = true
  } else {
    performStatusToggle('Active')
  }
}
function confirmSuspend(){
  if (!selectedAdmin.value) return
  showSuspendConfirmModal.value = false
  performStatusToggle('Inactive')
}
function cancelSuspend(){
  showSuspendConfirmModal.value = false
}

// --- Notification (Toast) System ---
const activeNotification = ref(null) // { id, type, title, message }
let notificationTimeout = null
function showNotification({ type='info', title='', message='', duration=4000 }) {
  const id = Date.now()
  activeNotification.value = { id, type, title, message }
  if (notificationTimeout) clearTimeout(notificationTimeout)
  notificationTimeout = setTimeout(() => {
    if (activeNotification.value && activeNotification.value.id === id) {
      activeNotification.value = null
    }
  }, duration)
}

// --- Theme Handling (Light / Dark / Auto) ---
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

  // Auto: follow system preference by toggling the class based on matchMedia
  systemDarkQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
  if (systemDarkQuery) {
    setDarkMode(systemDarkQuery.matches)
    systemDarkQuery.addEventListener('change', handleSystemThemeChange)
  } else {
    // Fallback
    setDarkMode(false)
  }
}

function handleSystemThemeChange(e) {
  if (currentAdmin.preferences.theme !== 'Auto') {
    return
  }
  setDarkMode(!!e.matches)
}

onMounted(() => {
  let initial = 'Light'
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) {
      initial = saved
      if (currentAdmin.preferences && currentAdmin.preferences.theme !== saved) {
        currentAdmin.preferences.theme = saved
      }
    } else if (currentAdmin.preferences && currentAdmin.preferences.theme) {
      initial = currentAdmin.preferences.theme
    }
  } catch {
    if (currentAdmin.preferences && currentAdmin.preferences.theme) {
      initial = currentAdmin.preferences.theme
    }
  }
  applyTheme(initial)
})

watch(
  () => currentAdmin.preferences.theme,
  (val) => {
    applyTheme(val)
    showNotification({
      type: 'success',
      title: 'Theme Updated',
      message: val === 'Auto' ? 'Following system appearance.' : `Switched to ${val} theme.`
    })
  }
)

</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Toast Notification -->
    <AdminToast
      v-if="activeNotification"
      :type="activeNotification.type"
      :title="activeNotification.title"
      :message="activeNotification.message"
      :zIndex="70"
      @close="activeNotification = null"
    />
    <admin-sidebar></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header></admin-header>
      
      <!-- Settings Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">Manage your profile</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Profile Section -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Current Admin Profile -->
               <div>
                 <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                   <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                     <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">My Profile</h3>
                     <button @click="openEditProfile" class="bg-[#042EFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                       Edit Profile
                     </button>
                   </div>
                   
                   <div class="p-6">
                     <div class="flex items-start space-x-6">
                       <img :src="currentAdmin.avatar" :alt="currentAdmin.name" class="h-20 w-20 rounded-full object-cover">
                       <div class="flex-1">
                         <div class="flex items-center space-x-3 mb-2">
                           <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ currentAdmin.name }}</h2>
                           <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getRoleColor(currentAdmin.role)]">
                             {{ currentAdmin.role }}
                           </span>
                         </div>
                         
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                           <div>
                             <p class="text-sm text-gray-600 dark:text-gray-400">Email</p>
                             <p class="font-medium dark:text-gray-100">{{ currentAdmin.email }}</p>
                           </div>
                           <div>
                             <p class="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                             <p class="font-medium dark:text-gray-100">{{ currentAdmin.phone }}</p>
                           </div>
                           <div>
                             <p class="text-sm text-gray-600 dark:text-gray-400">Department</p>
                             <p class="font-medium dark:text-gray-100">{{ currentAdmin.department }}</p>
                           </div>
                           <div>
                             <p class="text-sm text-gray-600 dark:text-gray-400">Location</p>
                             <p class="font-medium dark:text-gray-100">{{ currentAdmin.location }}</p>
                           </div>
                           <div>
                             <p class="text-sm text-gray-600 dark:text-gray-400">Join Date</p>
                             <p class="font-medium dark:text-gray-100">{{ formatDate(currentAdmin.joinDate) }}</p>
                           </div>
                           <div>
                             <p class="text-sm text-gray-600 dark:text-gray-400">Last Login</p>
                             <p class="font-medium dark:text-gray-100">{{ currentAdmin.lastLogin }}</p>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
                
                <!-- Metrics Card -->
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 xl:col-span-2">
                  <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">My Activity Metrics</h3>
                  </div>
                  <div class="p-6">
                    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      <div v-for="m in profileMetrics" :key="m.label" class="relative  rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 shadow-sm overflow-hidden group">
                        <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_30%,rgba(4,46,255,0.07),transparent)]"></div>
                        <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ m.label }}</p>
                        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ m.value }}</p>
                      </div>
                    </div>
                  </div>
              <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                </div>
              </div>
              <!-- Recent Activity Card -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
                </div>
                <div class="p-6">
                  <ul class="space-y-4" v-if="recentActivity.length">
                    <li v-for="(item,idx) in recentActivity" :key="idx" class="flex items-start space-x-3">
                      <div class="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#042EFF] ring-4 ring-[#042EFF]/10"></div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ item.action }}</p>
                        <p class="text-xs text-gray-500">{{ item.date }}</p>
                      </div>
                    </li>
                  </ul>
                  <div v-else class="text-sm text-gray-500 italic">No recent activity recorded.</div>
                </div>
              </div>

   
            </div>



            <!-- Preferences Section -->
            <div class="space-y-6">
              <!-- Account Preferences -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Preferences</h3>
                </div>
                
                <div class="p-6 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                    <select 
                      :value="currentAdmin.preferences.theme"
                      @change="updatePreference('theme', $event.target.value)"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="Light">Light</option>
                      <option value="Dark">Dark</option>
                      <option value="Auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                    <select 
                      :value="currentAdmin.preferences.language"
                      @change="updatePreference('language', $event.target.value)"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Notification Preferences -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                </div>
                
                <div class="p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
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
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">SMS Notifications</span>
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
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Weekly Reports</span>
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
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">My Permissions</h3>
                </div>
                
                <div class="p-6 space-y-3">
                  <div v-for="(hasPermission, permission) in currentAdmin.permissions" :key="permission" class="flex items-center justify-between">
                    <span class="text-sm text-gray-700 dark:text-gray-300 capitalize">{{ permission.replace(/([A-Z])/g, ' $1').trim() }}</span>
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', hasPermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                      {{ hasPermission ? 'Granted' : 'Denied' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <!-- System Administrators Table -->
              <div class="bg-white dark:bg-gray-800 col-span-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">System Administrators</h3>
                </div>
                
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-900/40">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr v-for="admin in admins" :key="admin.id" @click.stop="viewAdminDetails(admin)" class="hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <img :src="admin.avatar" :alt="admin.name" class="h-10 w-10 rounded-full object-cover mr-4">
                            <div>
                              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ admin.name }}</div>
                              <div class="text-sm text-gray-500">{{ admin.id }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-900 dark:text-gray-100">{{ admin.email }}</div>
                          <div class="text-sm text-gray-500">{{ admin.phone }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getRoleColor(admin.role)]">
                            {{ admin.role }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
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
                            <button @click.stop="viewAdminDetails(admin)" class="text-[#042EFF] hover:text-blue-600" title="View Details">
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
        </div>
      </main>
    </div>

    <!-- Edit Profile Modal (Enhanced) -->
    <div v-if="showEditProfileModal" class="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="closeEditProfileModal">
      <div class="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in">
        <div class="flex items-start justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h3 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Edit Profile</h3>
            <p class="text-xs text-gray-500 font-mono mt-1">ID: {{ currentAdmin.id }} • Joined {{ formatDate(currentAdmin.joinDate) }}</p>
          </div>
          <button @click="closeEditProfileModal" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Close">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scroll">
          <form @submit.prevent="saveProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- Avatar Uploader In-Place -->
              <div class="md:col-span-2">
                <label class="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Profile Picture</label>
                <div class="mt-3 flex flex-col items-center">
                  <div
                    @click="triggerAvatarSelect"
                    @dragover="onAvatarDragOver"
                    @dragleave="onAvatarDragLeave"
                    @drop="onAvatarDrop"
                    :class="['relative group rounded-full overflow-hidden cursor-pointer transition-all ring-4', isDraggingAvatar ? 'ring-[#042EFF] scale-105' : 'ring-white dark:ring-gray-700 shadow']"
                    style="width:120px; height:120px;"
                  >
                    <img :src="newAvatarPreview || currentAdmin.avatar" alt="Avatar" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[11px] font-medium space-y-0.5">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      <span>Change</span>
                      <span class="text-[9px] tracking-wide opacity-70">Drag or Click</span>
                    </div>
                    <div v-if="newAvatarPreview" class="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1 shadow">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  </div>
                  <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
                  <div v-if="newAvatarPreview" class="mt-3 flex items-center gap-3">
                    <button type="button" @click="newAvatarPreview=''; if(fileInputRef?.value) fileInputRef.value.value=''" class="text-[11px] px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Reset</button>
                    <span class="text-[11px] text-green-600 font-medium">New image selected</span>
                  </div>
                  <p class="mt-3 text-[10px] text-gray-500">PNG/JPG up to 5MB</p>
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Full Name</label>
                <input v-model="editForm.name" type="text" required class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[#042EFF] focus:border-[#042EFF] text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" placeholder="Enter full name" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Email</label>
                <input v-model="editForm.email" type="email" required class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[#042EFF] focus:border-[#042EFF] text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" placeholder="name@email.com" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Phone</label>
                <input v-model="editForm.phone" type="tel" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[#042EFF] focus:border-[#042EFF] text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" placeholder="+1 ..." />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Department</label>
                <select v-model="editForm.department" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:ring-[#042EFF] focus:border-[#042EFF] text-sm text-gray-900 dark:text-gray-100">
                  <option value="" disabled>Select department</option>
                  <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                </select>
              </div>
              <div class="space-y-1 md:col-span-2">
                <label class="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Location</label>
                <input v-model="editForm.location" type="text" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[#042EFF] focus:border-[#042EFF] text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" placeholder="City, Country" />
              </div>
            </div>
          </form>
          <div class="border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/20 rounded-lg p-4 text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
            Updating your profile helps other administrators identify responsibilities and contact preferences.
          </div>
        </div>
        <div class="px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <button @click="saveProfile" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#042EFF] text-white text-sm font-medium shadow-sm hover:bg-blue-600 transition-colors">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            Save Changes
          </button>
          <button @click="closeEditProfileModal" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Admin Details Modal (Enhanced) -->
    <div v-if="showAdminDetailsModal && selectedAdmin" class="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="closeAdminDetailsModal">
      <div class="admin-details-modal relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-auto animate-fade-in h-[95vh]">
        <!-- Sticky Header -->
        <div class="sticky top-0 z-20 bg-white dark:bg-gray-900 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-start justify-between">
          <div class="flex items-center">
            <img :src="selectedAdmin.avatar" :alt="selectedAdmin.name" class="h-16 w-16 rounded-full object-cover mr-4 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm" />
            <div>
              <div class="flex items-center space-x-3 mb-1">
                <h3 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{{ selectedAdmin.name }}</h3>
                <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', getRoleColor(selectedAdmin.role)]">{{ selectedAdmin.role }}</span>
                <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusColor(selectedAdmin.status)]">{{ selectedAdmin.status }}</span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                <span>ID: {{ selectedAdmin.id }}</span>
                <span>Dept: {{ selectedAdmin.department }}</span>
                <span>Last Login: {{ selectedAdmin.lastLogin }}</span>
              </div>
            </div>
          </div>
          <button @click="closeAdminDetailsModal" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Close">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <!-- Content -->
        <div class="p-6 space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column -->
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
                    <p class="font-medium text-gray-900 dark:text-gray-100 break-all">{{ selectedAdmin.email }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500">Phone</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedAdmin.phone }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500">Department</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedAdmin.department }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500">Location</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedAdmin.location }}</p>
                  </div>
                </div>
              </div>
              <!-- Account Card -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Account</h4>
                  <span class="text-xs text-gray-400 font-mono">Meta</span>
                </div>
                <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500">Join Date</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ formatDate(selectedAdmin.joinDate) }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500">Total Actions</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedAdmin.totalActions.toLocaleString() }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500">Account Created</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ formatDate(selectedAdmin.accountCreated) }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500">Status</p>
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset', getStatusColor(selectedAdmin.status)]">{{ selectedAdmin.status }}</span>
                  </div>
                </div>
              </div>
              <!-- Permissions Card -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Permissions</h4>
                  <div class="flex items-center gap-2">
                    <button v-if="!isEditingPermissions" @click="startEditPermissions" class="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
                      <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                    <span v-else class="inline-flex items-center gap-2">
                      <button @click="savePermissions" class="inline-flex items-center px-3 py-1.5 rounded-md bg-[#042EFF] text-white text-xs font-medium hover:bg-blue-600 shadow-sm transition-colors">
                        <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        Save
                      </button>
                      <button @click="cancelEditPermissions" class="inline-flex items-center px-3 py-1.5 rounded-md bg-white border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">Cancel</button>
                    </span>
                    <span class="text-xs text-gray-400 font-mono">{{ Object.keys(selectedAdmin.permissions).length }}</span>
                  </div>
                </div>
                <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div v-for="(hasPermission, permission) in (isEditingPermissions ? permissionDraft : selectedAdmin.permissions)" :key="permission" class="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-3 py-2 ring-1 ring-gray-100 dark:ring-gray-700 hover:ring-blue-200 dark:hover:ring-blue-400/40 transition-colors group">
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 pr-3">{{ permission.replace(/([A-Z])/g, ' $1').trim() }}</span>
                    <!-- View Mode Badge -->
                    <span v-if="!isEditingPermissions" :class="['inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset', hasPermission ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200']">{{ hasPermission ? 'Granted' : 'Denied' }}</span>
                    <!-- Edit Mode Toggle -->
                    <button v-else @click="togglePermission(permission)" :class="[ 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2', permissionDraft[permission] ? 'bg-green-500 focus:ring-green-400' : 'bg-gray-300 focus:ring-gray-400']" type="button">
                      <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-1 ring-gray-200 transition" :class="permissionDraft[permission] ? 'translate-x-5' : 'translate-x-1'"></span>
                    </button>
                  </div>
                </div>
              </div>
              <!-- Activity Card -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Recent Activity</h4>
                  <span class="text-xs text-gray-400 font-mono">{{ selectedAdmin.activityLog.length }} entries</span>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-gray-700">
                  <div v-for="activity in selectedAdmin.activityLog" :key="activity.date" class="flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ activity.action }}</p>
                      <p class="text-xs text-gray-500 mt-1 font-mono">{{ activity.date }}</p>
                    </div>
                    <div class="ml-4 flex items-center text-green-600">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Metrics Card -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Metrics</h4>
                </div>
                <div class="p-5 grid grid-cols-2 gap-4 text-center">
                  <div class="bg-white dark:bg-gray-800 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 p-4">
                    <p class="text-xl font-bold text-gray-900 dark:text-gray-100">{{ selectedAdmin.totalActions }}</p>
                    <p class="text-[10px] tracking-wide uppercase text-gray-600 dark:text-gray-400 mt-1">Actions</p>
                  </div>
                  <div class="bg-white dark:bg-gray-800 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 p-4">
                    <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatDate(selectedAdmin.accountCreated) }}</p>
                    <p class="text-[10px] tracking-wide uppercase text-gray-600 dark:text-gray-400 mt-1">Created</p>
                  </div>
                  <div class="bg-white dark:bg-gray-800 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700 p-4 col-span-2">
                    <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ selectedAdmin.lastLogin }}</p>
                    <p class="text-[10px] tracking-wide uppercase text-gray-600 dark:text-gray-400 mt-1">Last Login</p>
                  </div>
                </div>
              </div>
              <!-- Actions Card -->
              <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Actions</h4>
                </div>
                <div class="p-5 space-y-3">
                  <button @click="openMessageModal" class="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#042EFF] text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    Send Message
                  </button>
                  <button @click="toggleSuspendAdmin" :disabled="isTogglingStatus || (selectedAdmin.role === 'Primary Admin' && selectedAdmin.status === 'Active')" :class="[
                      'w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm',
                      selectedAdmin.status === 'Active' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white',
                      (selectedAdmin.role === 'Primary Admin' && selectedAdmin.status === 'Active') ? 'opacity-50 cursor-not-allowed hover:bg-yellow-500' : '',
                      isTogglingStatus ? 'opacity-70 cursor-wait' : ''
                    ]">
                    <svg v-if="!isTogglingStatus" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    <svg v-else class="w-4 h-4 mr-2 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                    <span v-if="selectedAdmin.role === 'Primary Admin' && selectedAdmin.status === 'Active'">Protected</span>
                    <span v-else>{{ selectedAdmin.status === 'Active' ? (isTogglingStatus ? 'Suspending...' : 'Suspend Account') : (isTogglingStatus ? 'Activating...' : 'Activate Account') }}</span>
                  </button>
                  <button v-if="selectedAdmin.role !== 'Primary Admin'" @click="selectedAdmin.status === 'Inactive' ? confirmDeleteAdmin(selectedAdmin) : null" :disabled="selectedAdmin.status !== 'Inactive'" :class="[
                      'w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm',
                      selectedAdmin.status === 'Inactive' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-200 text-red-500 cursor-not-allowed'
                    ]">
                    <svg class="w-4 h-4 mr-2" :class="selectedAdmin.status !== 'Inactive' ? 'opacity-70' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    <span>{{ selectedAdmin.status === 'Inactive' ? 'Delete Admin' : 'Delete (Requires Suspension)' }}</span>
                  </button>
                  <p v-if="selectedAdmin.role !== 'Primary Admin'" class="text-[10px] text-gray-500 leading-snug">Admin must be <span class="font-medium text-yellow-700">suspended</span> before deletion.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Message Modal -->
    <div v-if="showMessageModal && selectedAdmin" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="closeMessageModal">
      <div class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in">
        <div class="px-6 pt-6 pb-4 flex items-start space-x-4">
          <div class="flex-shrink-0 h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center ring-1 ring-blue-100 dark:ring-blue-900/40">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <div class="flex-1 pr-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Message {{ selectedAdmin.name }}</h3>
            <p class="mt-1 text-xs text-gray-500">Direct message will be delivered to the admin's inbox.</p>
          </div>
          <button @click="closeMessageModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Close dialog" :disabled="sendingMessage">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="px-6 pb-6 space-y-5">
          <div class="space-y-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Subject (Optional)</label>
            <input v-model="messageForm.subject" type="text" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[#042EFF] focus:border-[#042EFF] text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" placeholder="Subject" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Message</label>
            <textarea v-model="messageForm.body" rows="5" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[#042EFF] focus:border-[#042EFF] text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none" placeholder="Type your message..."></textarea>
          </div>
          <div class="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
            <button @click="sendAdminMessage" :disabled="sendingMessage" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#042EFF] text-white text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-600">
              <svg v-if="!sendingMessage" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <svg v-else class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4  4H4z"/></svg>
              {{ sendingMessage ? 'Sending...' : 'Send Message' }}
            </button>
            <button @click="closeMessageModal" :disabled="sendingMessage" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal (Enhanced) -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="closeDeleteConfirmModal">
      <div class="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in">
        <div class="px-6 pt-6 pb-4 flex items-start space-x-4">
          <div class="flex-shrink-0 h-12 w-12 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center ring-1 ring-red-100 dark:ring-red-900/40">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M4.938 19h14.124c1.054 0 1.716-1.142 1.188-2.053L13.188 5.947c-.527-.911-1.849-.911-2.376 0L3.75 16.947C3.222 17.858 3.884 19 4.938 19z"/></svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Delete Administrator</h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">You're about to remove <span class="font-semibold text-gray-900 dark:text-gray-100">{{ adminToDelete ? adminToDelete.name : '' }}</span>. This revokes all access and cannot be undone.</p>
          </div>
          <button @click="closeDeleteConfirmModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Close dialog">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="px-6 pb-6 pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button @click="deleteAdmin" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 shadow-sm transition-colors w-full sm:w-auto">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete Admin
          </button>
          <button @click="closeDeleteConfirmModal" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors w-full sm:w-auto">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Suspend Confirmation Modal -->
    <div v-if="showSuspendConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="cancelSuspend">
      <div class="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in">
        <div class="px-6 pt-6 pb-4 flex items-start space-x-4">
          <div class="flex-shrink-0 h-12 w-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center ring-1 ring-yellow-100 dark:ring-yellow-900/40">
            <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M4.93 19h14.14c1.09 0 1.77-1.18 1.23-2.12L13.24 4.88c-.54-.94-1.9-.94-2.44 0L3.7 16.88C3.16 17.82 3.84 19 4.93 19z"/></svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Confirm Suspension</h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Suspend <span class="font-semibold text-gray-900 dark:text-gray-100">{{ selectedAdmin ? selectedAdmin.name : '' }}</span>? They will lose active access until reactivated.</p>
          </div>
          <button @click="cancelSuspend" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Close dialog">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="px-6 pb-6 pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button @click="confirmSuspend" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 shadow-sm transition-colors w-full sm:w-auto">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M4.93 19h14.14c1.09 0 1.77-1.18 1.23-2.12L13.24 4.88c-.54-.94-1.9-.94-2.44 0L3.7 16.88C3.16 17.82 3.84 19 4.93 19z"/></svg>
            Confirm Suspension
          </button>
          <button @click="cancelSuspend" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors w-full sm:w-auto">Cancel</button>
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

/* Modal animations */
@keyframes fade-in {
   from { 
    opacity:0; 
    transform: translateY(10px);
  } to { 
    opacity:1; 
    transform: translateY(0);
  } 
  }
@keyframes scale-in { from { opacity:0; transform: scale(.95);} to { opacity:1; transform: scale(1);} }
.animate-fade-in { animation: fade-in .4s cubic-bezier(.4,0,.2,1); }
.animate-scale-in { animation: scale-in .35s cubic-bezier(.4,0,.2,1); }

/* Hide scrollbars inside modals where desired */
.admin-details-modal::-webkit-scrollbar, .custom-scroll::-webkit-scrollbar {
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

/* Slide-in-right for toast */
.slide-in-right-enter-from, .slide-in-right-leave-to { opacity:0; transform: translateX(20px); }
.slide-in-right-enter-active, .slide-in-right-leave-active { transition: all .35s cubic-bezier(.4,0,.2,1); }
.slide-in-right-leave-from, .slide-in-right-enter-to { opacity:1; transform: translateX(0); }
</style>