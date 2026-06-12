
<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosClient from '@/axiosClient'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'
import AdminToast from '@/components/Admin/AdminToast.vue'

const showOrderDetailsModal = ref(false)
const showDeleteConfirmModal = ref(false)
const selectedOrder = ref(null)
const orderToDelete = ref(null)
const searchQuery = ref('')
const statusFilter = ref('All')
// Pending status (for unsaved change)
const pendingStatus = ref('')
// Saving state for status updates
const isSavingStatus = ref(false)
const justSavedStatus = ref(false)

// Global statuses (includes Cancelled for filtering, but dropdown will exclude it)
const statuses = ['All', 'Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled']
// Status options for update select (exclude Cancelled; cancellation via button)
const statusOptions = ['Pending', 'Processing', 'In Transit', 'Delivered']

// Notification state
const activeNotification = ref(null) // { id, type, title, message }
let notificationTimeout = null

function showNotification({ type = 'info', title = '', message = '', duration = 5000 }) {
  const id = Date.now()
  activeNotification.value = { id, type, title, message, duration }
  if (notificationTimeout) clearTimeout(notificationTimeout)
  notificationTimeout = setTimeout(() => {
    if (activeNotification.value && activeNotification.value.id === id) {
      activeNotification.value = null
    }
  }, duration)
}

// Orders data (will be loaded from backend)
const orders = reactive([])
const isLoading = ref(true)
const isLoadingOrders = ref(false)
const authenticatedAdmin = ref(null)
const router = useRouter()

// Currency formatting (KSH)
const formatCurrency = (n) => {
  const num = Number(n) || 0
  return `KSH ${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

const getImagePath = (path) => {
  if (!path || typeof path !== 'string') return ''
  const value = path.trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  const normalized = value.replace(/^\/+/, '')
  return `${apiBaseUrl}/storage/${normalized}`
}

// Load orders from admin endpoint and normalize
async function loadAdminOrders() {
  isLoadingOrders.value = true
  try {
    const resp = await axiosClient.get('/api/admin/orders')
    const payload = resp.data || {}
    // Reuse authenticated admin from the page API response when available
    authenticatedAdmin.value = payload.authenticatedAdmin || payload.currentAuthenticatedAdmin || payload.admin || payload.adminUser || authenticatedAdmin.value
    const list = Array.isArray(payload) ? payload : Array.isArray(payload?.allOrders) ? payload.allOrders : Array.isArray(payload?.data) ? payload.data : []
    orders.splice(0, orders.length, ...list)
  } catch (error) {
    console.error('Failed to load admin orders:', error)
    orders.splice(0, orders.length)
  } finally {
    isLoadingOrders.value = false
  }
}

async function ensureAuthAndLoad() {
  isLoading.value = true
  try {
    // Load orders page data which should include authenticatedAdmin
    await loadAdminOrders()
    if (!authenticatedAdmin.value) {
      router.push('/admin/login')
      return
    }
  } catch (e) {
    if (e?.response?.status === 401 || e?.response?.data?.error === 'unauthenticated') {
      router.push('/admin/login')
    } else {
      console.error('Auth check failed', e)
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { ensureAuthAndLoad() })

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

function getOrderTotal(order) {
  if (!order) return 0
  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = items.reduce((s, p) => s + (Number(p.total_price || 0) || (Number(p.price_at_purchase || 0) * Number(p.quantity || 0) || 0)), 0)
  const shipping = Number(order.shipping_cost || 0)
  return subtotal + shipping
}

function formatShippingAddress(o) {
  if (!o) return ''
  const parts = []
  if (o.street_address) parts.push(o.street_address)
  if (o['apartment/suite']) parts.push(o['apartment/suite'])
  if (o['city/town']) parts.push(o['city/town'])
  if (o.region) parts.push(o.region)
  if (o.postal_code) parts.push(o.postal_code)
  if (o.country) parts.push(o.country)
  return parts.filter(Boolean).join(', ')
}

function normalizeStatus(s) {
  if (!s && s !== '') return ''
  const v = String(s || '').toLowerCase().trim()
  if (v === 'in_transit' || v === 'intransit') return 'in transit'
  if (v === 'canceled') return 'cancelled'
  if (['pending', 'processing', 'delivered', 'cancelled', 'in transit'].includes(v)) return v
  // map common display variants
  if (v === 'pending') return 'pending'
  return v
}

function formatStatusLabel(s) {
  if (s === null || s === undefined) return ''
  const n = normalizeStatus(s)
  if (!n) return ''
  return n.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function formatDate(input) {
  if (!input) return ''
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  const Y = d.getFullYear()
  const M = pad(d.getMonth() + 1)
  const D = pad(d.getDate())
  const h = pad(d.getHours())
  const m = pad(d.getMinutes())
  return `${Y}-${M}-${D} ${h}:${m}`
}

const filteredOrders = computed(() => {
  let filtered = orders;
  if (statusFilter.value !== 'All') {
    const want = String(statusFilter.value || '').toLowerCase()
    filtered = filtered.filter(order => String(order.status || '').toLowerCase() === want);
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => {
      const idStr = String(order.id || '')
      const tracking = String(order.order_tracking_number || '')
      const name = String(order.user?.name || '')
      const email = String(order.user?.email || '')
      return idStr.toLowerCase().includes(query) || tracking.toLowerCase().includes(query) || name.toLowerCase().includes(query) || email.toLowerCase().includes(query)
    })
  }
  return filtered;
});

// images for currently selected order
const imagesLoading = ref(false)
const selectedOrderImages = reactive({})
// persistent cache across modal opens to avoid refetching
const productImageCache = new Map()
// coalesce ongoing requests to avoid duplicate fetches
const ongoingImageRequests = new Map()
// per-item loading state for UI buttons
const loadingImageFor = reactive({})

async function fetchProductImage(pid) {
  if (!pid) return ''
  if (productImageCache.has(pid)) return productImageCache.get(pid)
  if (ongoingImageRequests.has(pid)) return ongoingImageRequests.get(pid)
  const promise = axiosClient.get(`/api/product/page/${pid}`).then(r => {
    const prod = r.data.product || r.data || null
    let imagePath = ''
    if (prod) {
      if (Array.isArray(prod.images) && prod.images.length) {
        const primary = prod.images.find(i => i.image_type === 'primary' || i.is_primary) || prod.images[0]
        imagePath = primary.image_path || primary.path || primary.url || ''
      } else if (prod.image) {
        imagePath = prod.image
      }
    }
    const url = getImagePath(imagePath)
    productImageCache.set(pid, url)
    ongoingImageRequests.delete(pid)
    return url
  }).catch(() => {
    ongoingImageRequests.delete(pid)
    productImageCache.set(pid, '')
    return ''
  })
  ongoingImageRequests.set(pid, promise)
  return promise
}

async function loadImagesForOrder(order) {
  // do not eagerly load all images; prefetch only the first couple for a snappier UX
  if (!order || !Array.isArray(order.items)) return
  imagesLoading.value = true
  // clear selected images for current modal
  for (const k in selectedOrderImages) delete selectedOrderImages[k]
  const ids = [...new Set(order.items.map(i => i.product_id || i.id).filter(Boolean))]
  const prefetchCount = 2
  const toPrefetch = ids.slice(0, prefetchCount)
  const results = await Promise.all(toPrefetch.map(pid => fetchProductImage(pid)))
  results.forEach((url, i) => { if (toPrefetch[i]) selectedOrderImages[toPrefetch[i]] = url || '' })
  // start background fetches for the remaining images; show per-item loading spinner
  const remaining = ids.slice(prefetchCount)
  remaining.forEach(pid => {
    // if cached, show immediately
    if (productImageCache.has(pid) && productImageCache.get(pid)) {
      selectedOrderImages[pid] = productImageCache.get(pid)
      return
    }
    loadingImageFor[pid] = true
    // fire-and-forget background fetch
    fetchProductImage(pid).then(url => {
      if (url) selectedOrderImages[pid] = url
    }).finally(() => { loadingImageFor[pid] = false })
  })
  imagesLoading.value = false
}

async function loadImageForItem(item) {
  const pid = item.product_id || item.id || null
  if (!pid) return
  if (productImageCache.has(pid) && productImageCache.get(pid)) {
    selectedOrderImages[pid] = productImageCache.get(pid)
    return
  }
  loadingImageFor[pid] = true
  const url = await fetchProductImage(pid)
  selectedOrderImages[pid] = url || ''
  loadingImageFor[pid] = false
}

function viewOrderDetails(order) {
  selectedOrder.value = order;
  showOrderDetailsModal.value = true;
  // Initialize pending status using server key
  if (order) pendingStatus.value = formatStatusLabel(order.status)
  // load images for this order on demand
  loadImagesForOrder(order)
}

function confirmDeleteOrder(order) {
  orderToDelete.value = order;
  showDeleteConfirmModal.value = true;
}

function deleteOrder() {
  if (!orderToDelete.value) return
  // send only the order id to the delete endpoint (no extra body)
  const rawId = orderToDelete.value.id ?? orderToDelete.value.order_id ?? orderToDelete.value.orderId
  const id = (typeof rawId === 'function') ? (() => { try { return rawId.call(orderToDelete.value) } catch (e) { return '' } })() : rawId
  if (!id && id !== 0) {
    showNotification({ type: 'error', title: 'Delete Failed', message: 'Unable to determine order id to delete.' })
    showDeleteConfirmModal.value = false
    orderToDelete.value = null
    return
  }

  (async () => {
    try {
      const res = await axiosClient.delete(`/api/admin/orders/${id}/delete`)
      if (res && (res.status === 200 || res.status === 201 || res.status === 204)) {
        const index = orders.findIndex(o => String(o.id) === String(id))
        if (index > -1) orders.splice(index, 1)
        showNotification({ type: 'success', title: 'Order Deleted', message: 'Order removed successfully.' })
      } else {
        showNotification({ type: 'error', title: 'Delete Failed', message: 'Failed to delete order on server.' })
      }
    } catch (e) {
      showNotification({ type: 'error', title: 'Delete Failed', message: 'Failed to delete order on server.' })
    }
    showDeleteConfirmModal.value = false
    orderToDelete.value = null
  })()
}

function closeOrderDetailsModal() {
  showOrderDetailsModal.value = false;
  selectedOrder.value = null;
  pendingStatus.value = ''
}

function closeDeleteConfirmModal() {
  showDeleteConfirmModal.value = false;
  orderToDelete.value = null;
}

function updateOrderStatus(newStatus) {
  if (!selectedOrder.value) {
    return;
  }
  // Update pendingStatus immediately and attempt server update
  pendingStatus.value = newStatus
  if (selectedOrder.value && normalizeStatus(newStatus) !== normalizeStatus(selectedOrder.value.status)) {
    justSavedStatus.value = false
  }
}

function cancelOrder() {
  if (!selectedOrder.value) return
  if (normalizeStatus(pendingStatus.value) === 'cancelled' && normalizeStatus(selectedOrder.value.status) === 'cancelled') return
  updateOrderStatus('Cancelled')
  saveStatusChange(() => {
    showNotification({ type: 'warning', title: 'Order Cancelled', message: 'Refund or reversal process will begin within 5 minutes if you do not change this status' })
  })
}


function generateReceipt() {
  if (!selectedOrder.value) {
    return;
  }
  const refNum = selectedOrder.value.order_tracking_number || selectedOrder.value.order_tracking || selectedOrder.value.tracking_number || selectedOrder.value.id
  alert(`Receipt generated for order ${refNum}`);
}

function deleteOrderFromDetails() {
  if (!selectedOrder.value) {
    return;
  }
  if (String(selectedOrder.value.status).toLowerCase() !== 'cancelled') {
    showNotification({ type: 'warning', title: 'Deletion Blocked', message: 'Cancel the order first before deleting.' })
    return
  }
  confirmDeleteOrder(selectedOrder.value)
  closeOrderDetailsModal()
}

// Derived data for selected order details modal
const selectedOrderComputed = computed(() => selectedOrder.value || null);

// Track if status changed
const hasStatusChanged = computed(() => {
  if (!selectedOrderComputed.value) return false
  return pendingStatus.value && normalizeStatus(pendingStatus.value) !== normalizeStatus(selectedOrderComputed.value.status)
})

const manageStatusOptions = computed(() => {
  const list = []
  const seen = new Set()
  const add = (val) => {
    const n = normalizeStatus(val)
    if (!n) return
    if (seen.has(n)) return
    seen.add(n)
    list.push(formatStatusLabel(n))
  }
  // Prefer the current pending selection (if present) so the select shows it first
  if (pendingStatus.value) add(pendingStatus.value)
  else if (selectedOrderComputed.value?.status) add(selectedOrderComputed.value.status)
  // Add canonical options
  statusOptions.forEach(s => add(s))
  // Ensure Cancelled is available
  add('Cancelled')
  return list
})

function saveStatusChange(afterCommitCb) {
  if (!selectedOrderComputed.value) return
  if (!hasStatusChanged.value) return
  if (isSavingStatus.value) return
  isSavingStatus.value = true
  justSavedStatus.value = false
  const orderId = selectedOrderComputed.value.id
  const newStatus = pendingStatus.value
  const payloadStatus = normalizeStatus(newStatus)

  // optimistic UI update: apply the new status locally immediately
  const idx = orders.findIndex(o => o.id === orderId)
  const prevStatus = idx > -1 ? orders[idx].status : selectedOrderComputed.value.status
  if (idx > -1) orders[idx].status = payloadStatus
  if (selectedOrder.value && selectedOrder.value.id === orderId) {
    selectedOrder.value.status = payloadStatus
    pendingStatus.value = formatStatusLabel(payloadStatus)
  }

  (async () => {
    try {
      const res = await axiosClient.post(`/api/admin/orders/${orderId}/status/update`, { status: payloadStatus })
      if (res && (res.status === 200 || res.status === 201 || res.status === 204)) {
        isSavingStatus.value = false
        justSavedStatus.value = true
        showNotification({ type: 'success', title: 'Status Updated', message: `Order status updated to ${payloadStatus}` })
        if (typeof afterCommitCb === 'function') afterCommitCb()
        setTimeout(() => { justSavedStatus.value = false }, 1600)
      } else {
        // revert optimistic change
        if (idx > -1) orders[idx].status = prevStatus
        if (selectedOrder.value && selectedOrder.value.id === orderId) {
          selectedOrder.value.status = prevStatus
          pendingStatus.value = formatStatusLabel(prevStatus)
        }
        isSavingStatus.value = false
        showNotification({ type: 'error', title: 'Update Failed', message: 'Failed to update status on server.' })
      }
    } catch (e) {
      // revert optimistic change
      if (idx > -1) orders[idx].status = prevStatus
      if (selectedOrder.value && selectedOrder.value.id === orderId) {
        selectedOrder.value.status = prevStatus
        pendingStatus.value = formatStatusLabel(prevStatus)
      }
      isSavingStatus.value = false
      showNotification({ type: 'error', title: 'Update Failed', message: 'Failed to update status on server.' })
    }
  })()
}

const orderFinancials = computed(() => {
  if (!selectedOrderComputed.value) return null
  const o = selectedOrderComputed.value
  const items = Array.isArray(o.items) ? o.items : []
  const subtotal = items.reduce((s, p) => s + (Number(p.total_price || 0) || (Number(p.price_at_purchase || 0) * Number(p.quantity || 0) || 0)), 0)
  const shipping = Number(o.shipping_cost || 0)
  // tax/discount not always provided on root, compute minimal set
  const tax = Number(o.tax || 0)
  const discount = Number(o.discount || 0)
  const total = subtotal + shipping + tax - discount
  const avgItemPrice = items.length ? subtotal / items.length : 0
  const totalItems = items.reduce((sum, p) => sum + (Number(p.quantity || 0) || 0), 0)
  return { subtotal, shipping, tax, discount, total, avgItemPrice, totalItems }
})

const statusTimeline = computed(() => {
  if (!selectedOrderComputed.value) {
    return [];
  }
  const statusOrder = ['pending', 'processing', 'in transit', 'delivered'];
  const current = String(selectedOrderComputed.value.status || '').toLowerCase();
  return statusOrder.map(step => {
    const index = statusOrder.indexOf(step);
    const currentIndex = statusOrder.indexOf(current);
    const cancelled = current === 'cancelled' || current === 'canceled';
    const completed = currentIndex > index || cancelled;
    const active = currentIndex === index && !cancelled;
    const display = step.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return { step: display, completed, active, cancelled };
  });
});

const paymentBadge = computed(() => {
  if (!selectedOrderComputed.value) return ''
  const status = String(selectedOrderComputed.value.payment_detail?.payment_status || '').toLowerCase()
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'failed':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
})


// Build payment detail rows depending on method
const paymentDetailRows = computed(() => {
  if (!selectedOrderComputed.value) return []
  const pd = selectedOrderComputed.value.payment_detail || {}
  const paymentMethod = pd.payment_method || String(pd.type || '').toLowerCase()
  const paymentDetails = pd.payment_details || {}
  const rows = []
  const method = String(paymentMethod || '').toLowerCase()
  if (method === 'credit card' || method === 'credit_card' || method === 'card') {
    if (paymentDetails.cardBrand) rows.push(['Card Brand', paymentDetails.cardBrand])
    if (paymentDetails.cardHolder) rows.push(['Card Holder', paymentDetails.cardHolder])
    if (paymentDetails.cardLast4) rows.push(['Card Last 4', '**** **** **** ' + paymentDetails.cardLast4])
    if (paymentDetails.authCode) rows.push(['Auth Code', paymentDetails.authCode])
    if (paymentDetails.transactionId) rows.push(['Transaction ID', paymentDetails.transactionId])
  } else if (method === 'paypal') {
    if (paymentDetails.paypalEmail) rows.push(['PayPal Email', paymentDetails.paypalEmail])
    if (paymentDetails.paypalPayerId) rows.push(['Payer ID', paymentDetails.paypalPayerId])
    if (paymentDetails.paypalTransactionId) rows.push(['Transaction ID', paymentDetails.paypalTransactionId])
  } else if (method === 'bank transfer' || method === 'bank_transfer') {
    if (paymentDetails.bankName) rows.push(['Bank Name', paymentDetails.bankName])
    if (paymentDetails.accountName) rows.push(['Account Name', paymentDetails.accountName])
    if (paymentDetails.reference) rows.push(['Reference', paymentDetails.reference])
    if (paymentDetails.swiftCode) rows.push(['SWIFT Code', paymentDetails.swiftCode])
    if (paymentDetails.expectedClearance) rows.push(['Expected Clearance', paymentDetails.expectedClearance])
  } else if (method === 'mpesa' || method === 'm-pesa') {
    if (paymentDetails.mpesaNumber) rows.push(['Mpesa Number', paymentDetails.mpesaNumber])
    if (paymentDetails.mpesaName) rows.push(['Mpesa Name', paymentDetails.mpesaName])
    if (paymentDetails.mpesaCode) rows.push(['Mpesa Code', paymentDetails.mpesaCode])
    if (paymentDetails.transactionTime) rows.push(['Time', paymentDetails.transactionTime])
  } else if (method === 'cod' || method === 'cash on delivery') {
    if (paymentDetails.type) rows.push(['Type', 'Cash on Delivery'])
    if (paymentDetails.recipientName) rows.push(['Recipient Name', paymentDetails.recipientName])
  }
  return rows
})


</script>

<template>
  <div>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <admin-sidebar :admin="authenticatedAdmin"></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header :admin="authenticatedAdmin"></admin-header>
      
      <!-- Orders Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-5xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Orders Management</h1>
          </div>

          <!-- Orders Table -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">All Orders</h3>
                
                <!-- Search and Filter -->
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search orders..."
                      class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    >
                  </div>
                  
                  <select 
                    v-model="statusFilter"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table v-if="!isLoadingOrders && !isLoading" class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tracking</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="order in filteredOrders" :key="order.id" @click.stop="viewOrderDetails(order)" class="hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer">
                    <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ order.user && order.user.name ? order.user.name : 'Unknown' }}</div>
                                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ order.user && order.user.email ? order.user.email : '' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ (order.items || []).length }} item{{ (order.items || []).length > 1 ? 's' : '' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{{ order.order_tracking_number }}</td>
                                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">{{ formatCurrency(getOrderTotal(order)) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(order.status)]">{{ order.status }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(order.created_at) }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Loading skeleton -->
              <div v-if="isLoadingOrders || isLoading" class="p-6">
                <div class="animate-pulse">
                  <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div class="space-y-3">
                    <div v-for="i in 6" :key="i" class="grid grid-cols-7 gap-4 items-center">
                      <div class="col-span-2 h-6 bg-gray-200 rounded"></div>
                      <div class="col-span-1 h-6 bg-gray-200 rounded"></div>
                      <div class="col-span-1 h-6 bg-gray-200 rounded"></div>
                      <div class="col-span-1 h-6 bg-gray-200 rounded"></div>
                      <div class="col-span-1 h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> <!-- end table wrapper card -->
        </div> <!-- end max-w container -->
      </main>
    </div> <!-- end flex-1 column -->
  </div> <!-- end root flex layout -->

  <!-- Order Details Modal (Enhanced) -->
    <div v-if="showOrderDetailsModal && selectedOrderComputed" class="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div class="order-details-modal relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-auto animate-fade-in border border-gray-100 dark:border-gray-700 h-[98%]">
        <!-- Sticky Header -->
        <div class="sticky top-0 z-20 bg-white dark:bg-gray-900  border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-3 mb-1">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Order {{ selectedOrderComputed.order_tracking_number || selectedOrderComputed.order_tracking || selectedOrderComputed.tracking_number || selectedOrderComputed.id }}</h3>
              <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', getStatusColor(selectedOrderComputed.status)]">{{ selectedOrderComputed.status }}</span>
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', paymentBadge]">Payment: {{ selectedOrderComputed.payment_detail?.payment_status || '' }}</span>
            </div>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
              <span>Tracking: {{ selectedOrderComputed.order_tracking_number }}</span>
              <span>Placed: {{ formatDate(selectedOrderComputed.created_at) }}</span>
              <span v-if="selectedOrderComputed.delivery_date || selectedOrderComputed.eta">ETA: {{ formatDate(selectedOrderComputed.delivery_date || selectedOrderComputed.eta) }}</span>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="generateReceipt" class="inline-flex items-center px-3 py-2 rounded-lg bg-[#042EFF] text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Receipt
            </button>
            <button @click="closeOrderDetailsModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Close">
              <svg class="w-6 h-6 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-8">
          <!-- Status Timeline -->
            <div class="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase mb-4">Fulfillment Progress</h4>
              <ol class="flex flex-col md:flex-row md:items-stretch md:space-x-6 space-y-4 md:space-y-0">
                <li v-for="step in statusTimeline" :key="step.step" class="flex-1 relative">
                  <div class="flex items-center md:flex-col md:items-start">
                    <div :class="[
                      'flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ring-2 ring-offset-2 ring-offset-white transition-colors',
                      step.cancelled ? 'bg-red-500 text-white ring-red-200' : step.completed ? 'bg-green-500 text-white ring-green-200' : step.active ? 'bg-[#042EFF] text-white ring-blue-200' : 'bg-gray-200 text-gray-600 ring-gray-300'
                    ]">
                      <span v-if="!step.cancelled">{{ step.step.charAt(0) }}</span>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/></svg>
                    </div>
                    <div class="ml-3 md:ml-0 md:mt-2">
                      <p class="text-xs font-semibold tracking-wide uppercase text-gray-700 dark:text-gray-300">{{ step.step }}</p>
                      <p v-if="step.active" class="text-[10px] text-blue-600 font-medium">Current</p>
                      <p v-if="step.completed && !step.cancelled" class="text-[10px] text-green-600 font-medium">Completed</p>
                      <p v-if="step.cancelled" class="text-[10px] text-red-600 font-medium">Cancelled</p>
                    </div>
                  </div>
                  <div v-if="!step.cancelled && step.step !== 'Delivered'" class="hidden md:block absolute top-3 left-[3.5rem] right-0 h-0.5">
                    <div :class="['h-full w-full', step.completed ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700']"></div>
                  </div>
                </li>
              </ol>
            </div>
            <!-- Row 1: Items + Customer -->
            <div class="grid grid-cols-3 gap-4">
              <!-- Items -->
                <div class="col-span-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Items ({{ orderFinancials?.totalItems }})</h4>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">Avg: {{ formatCurrency(orderFinancials?.avgItemPrice) }}</span>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-gray-700">
                  <div v-for="p in selectedOrderComputed.items" :key="p.id" class="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <div class="h-16 w-16 rounded-lg overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      <img v-if="selectedOrderImages[p.product_id]" :src="selectedOrderImages[p.product_id]" :alt="p.product_name_snapshot" class="h-16 w-16 object-cover" />
                      <div v-else class="flex items-center justify-center h-full w-full">
                        <button @click.stop="loadImageForItem(p)" :disabled="loadingImageFor[p.product_id]" class="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                          <svg v-if="loadingImageFor[p.product_id]" class="animate-spin -ml-0.5 mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span v-else class="text-xs text-gray-700 dark:text-gray-200">Load image</span>
                          <span v-if="loadingImageFor[p.product_id]" class="sr-only">Loading</span>
                        </button>
                      </div>
                    </div>
                    <div class="ml-4 flex-1 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ p.product_name_snapshot || ('Product ' + (p.product_id || p.id || '')) }}</p>
                      <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                        <span>Product ID: {{ p.product_id || p.id }}</span>
                        <span>Qty: {{ p.quantity }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(Number(p.price_at_purchase || p.price || 0)) }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ formatCurrency(Number(p.total_price || 0)) }} total</p>
                    </div>
                  </div>
                </div>
                <div class="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-5 py-4 space-y-2 text-sm">
                  <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Subtotal</span><span class="font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(orderFinancials?.subtotal) }}</span></div>
                  <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Shipping</span><span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(orderFinancials?.shipping) }}</span></div>
                  <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Tax</span><span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(orderFinancials?.tax) }}</span></div>
                  <div v-if="orderFinancials && orderFinancials.discount > 0" class="flex justify-between text-green-600"><span>Discount</span><span>- {{ formatCurrency(orderFinancials.discount) }}</span></div>
                  <div class="flex justify-between pt-2 mt-1 border-t border-gray-200 dark:border-gray-700 text-base font-semibold"><span class="text-gray-900 dark:text-gray-100">Total</span><span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(orderFinancials?.total) }}</span></div>
                </div>
              </div>
              <!-- Customer Card -->
                <div class="col-span-1 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Customer</h4>
                  <span class="text-xs text-gray-400 font-mono">#{{ selectedOrderComputed.user?.id || '' }}</span>
                </div>
                  <div class="p-5 space-y-4 text-sm">
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Name</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedOrderComputed.user?.name || '' }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Contact</p>
                    <div class="space-y-1">
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedOrderComputed.user?.email || '' }}</p>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedOrderComputed.user?.phone || '' }}</p>
                    </div>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Shipping Address</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{{ formatShippingAddress(selectedOrderComputed) }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2 pt-2">
                    <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium">{{ selectedOrderComputed.payment_detail?.payment_method || '' }}</span>
                    <span class="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium">{{ (selectedOrderComputed.items || []).length }} item(s)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 2: Payment + Manage -->
            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Payment Details</h4>
                  <span class="text-xs font-medium px-2 py-1 rounded-md bg-[#042EFF]/10 text-[#042EFF]">{{ selectedOrderComputed.payment_detail?.payment_method || '' }}</span>
                </div>
                <div class="p-5 space-y-4 text-sm">
                  <div v-if="paymentDetailRows.length === 0" class="text-xs text-gray-500 dark:text-gray-400 italic">No additional payment metadata.</div>
                  <dl v-else class="divide-y divide-gray-100 dark:divide-gray-700">
                    <div v-for="(row, idx) in paymentDetailRows" :key="idx" class="flex items-start justify-between py-2 first:pt-0 last:pb-0">
                      <dt class="text-gray-500 dark:text-gray-400 font-medium w-40 pr-4 text-xs uppercase tracking-wide">{{ row[0] }}</dt>
                      <dd class="text-gray-900 dark:text-gray-100 font-mono text-xs break-all flex-1">{{ row[1] }}</dd>
                    </div>
                  </dl>
                  <div class="pt-2 flex flex-wrap gap-2">
                    <span v-if="String(selectedOrderComputed.payment_detail?.payment_status || '').toLowerCase() === 'paid'" class="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-md bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">Paid</span>
                    <span v-else-if="String(selectedOrderComputed.payment_detail?.payment_status || '').toLowerCase() === 'pending'" class="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-md bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200">Pending</span>
                    <span v-else class="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-md bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200">{{ selectedOrderComputed.payment_detail?.payment_status || '' }}</span>
                  </div>
                </div>
              </div>
              <div class="col-span-1 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Manage Order</h4>
                </div>
                <div class="p-5 space-y-6">
                  <div>
                    <label class="block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400 mb-2">Update Status</label>
  <select v-model="pendingStatus" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm">
                      <option v-for="s in manageStatusOptions" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button @click="cancelOrder" :disabled="isSavingStatus || (String(selectedOrderComputed.status).toLowerCase() === 'cancelled' && String(pendingStatus).toLowerCase() === 'cancelled')" class="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-white text-sm font-medium shadow-sm transition-colors"
              :class="(String(selectedOrderComputed.status).toLowerCase() === 'cancelled' && String(pendingStatus).toLowerCase() === 'cancelled') ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'">
                      Cancel
                    </button>
                    <button @click="deleteOrderFromDetails" :disabled="String(selectedOrderComputed.status).toLowerCase() !== 'cancelled'" class="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-white text-sm font-medium shadow-sm transition-colors" :class="String(selectedOrderComputed.status).toLowerCase() === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      Delete
                    </button>
                  </div>
                  <button @click="() => saveStatusChange()" :disabled="!hasStatusChanged || isSavingStatus" :class="['relative w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors select-none',
                    isSavingStatus ? 'bg-blue-500 text-white' :
                    hasStatusChanged ? 'bg-[#042EFF] text-white hover:bg-blue-600' :
                    justSavedStatus ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed']">
                    <!-- Spinner -->
                    <svg v-if="isSavingStatus" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <!-- Default / Unsaved Icon -->
                    <svg v-else-if="hasStatusChanged" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <!-- Saved Icon -->
                    <svg v-else-if="justSavedStatus" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <!-- Disabled Icon -->
                    <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span v-if="isSavingStatus">Saving...</span>
                    <span v-else-if="hasStatusChanged">Save Changes</span>
                    <span v-else-if="justSavedStatus">Saved</span>
                    <span v-else>Save</span>
                  </button>
                  <p class="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">Status updates require saving. Use Cancel to terminate fulfillment; a refund process will start shortly after.</p>
                </div>
              </div>
            </div> 
        </div>
      </div>
    </div>

    <!-- Notification (unified AdminToast) -->
    <AdminToast
      v-if="activeNotification"
      :type="activeNotification.type"
      :title="activeNotification.title"
      :message="activeNotification.message"
      :duration="activeNotification.duration || 5000"
      :z-index="60"
      @close="activeNotification = null"
    />

    <!-- Delete Confirmation Modal (Enhanced) -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-in">
        <div class="px-6 pt-6 pb-4 flex items-start space-x-4">
          <div class="flex-shrink-0 h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center ring-1 ring-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M4.938 19h14.124c1.054 0 1.716-1.142 1.188-2.053L13.188 5.947c-.527-.911-1.849-.911-2.376 0L3.75 16.947C3.222 17.858 3.884 19 4.938 19z"/></svg>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Delete Order</h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">You're about to permanently remove order <span class="font-semibold text-gray-900 dark:text-gray-100">{{ orderToDelete?.order_tracking_number || orderToDelete?.order_tracking || orderToDelete?.tracking_number || orderToDelete?.id }}</span>. This action cannot be undone and related analytics may be affected.</p>
          </div>
          <button @click="closeDeleteConfirmModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="Close dialog">
            <svg class="w-5 h-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="px-6 pb-6 pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button @click="deleteOrder" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 shadow-sm transition-colors w-full sm:w-auto">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete Order
          </button>
          <button @click="closeDeleteConfirmModal" class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors w-full sm:w-auto">Cancel</button>
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
.order-details-modal::-webkit-scrollbar{
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

/* Slide in from right transition */
.slide-in-right-enter-from, .slide-in-right-leave-to { opacity:0; transform: translateX(20px); }
.slide-in-right-enter-active, .slide-in-right-leave-active { transition: all .35s cubic-bezier(.4,0,.2,1); }
.slide-in-right-leave-from, .slide-in-right-enter-to { opacity:1; transform: translateX(0); }

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