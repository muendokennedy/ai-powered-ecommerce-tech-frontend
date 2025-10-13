
<script setup>
import { reactive, ref, computed } from 'vue'
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

// Orders data (clean)
const orders = reactive([
  {
    id: 'ORD-2024-001',
    trackingNumber: 'TRK-5A8B9C2D',
    customer: {
      id: 'CUST-001',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    products: [
      {
        id: 'PH-001',
        name: 'iPhone 15 Pro Max',
        sku: 'IPH-15-PM-256',
        quantity: 1,
        price: 1199,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=150&h=150&fit=crop&crop=center'
      }
    ],
    totalAmount: 1199,
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    orderDate: '2024-09-10',
    deliveryDate: '2024-09-15',
    shippingCost: 15.99,
    tax: 95.92,
    discount: 0,
    paymentDetails: {
      cardHolder: 'John Doe',
      cardLast4: '8421',
      cardBrand: 'Visa',
      authCode: 'AUTH-58FD2A',
      transactionId: 'TXN-CC-2024-0001'
    }
  },
  {
    id: 'ORD-2024-002',
    trackingNumber: 'TRK-7E3F1G4H',
    customer: {
      id: 'CUST-002',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'United States'
    },
    products: [
      {
        id: 'LP-001',
        name: 'MacBook Pro 14"',
        sku: 'MBP-14-M3-512',
        quantity: 1,
        price: 2399,
        image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=150&h=150&fit=crop&crop=center'
      },
      {
        id: 'SW-001',
        name: 'Apple Watch Series 9',
        sku: 'AW-S9-45-GPS',
        quantity: 1,
        price: 429,
        image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=150&h=150&fit=crop&crop=center'
      }
    ],
    totalAmount: 2828,
    status: 'Processing',
    paymentMethod: 'PayPal',
    paymentStatus: 'Paid',
    orderDate: '2024-09-12',
    deliveryDate: null,
    shippingCost: 0,
    tax: 226.24,
    discount: 50,
    paymentDetails: {
      paypalPayerId: 'PAYER-8892JKL',
      paypalTransactionId: 'TXN-PP-2024-2099',
      paypalEmail: 'payer.jane@paypal.com'
    }
  },
  {
    id: 'ORD-2024-003',
    trackingNumber: 'TRK-9I5J7K8L',
    customer: {
      id: 'CUST-003',
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1 (555) 456-7890',
      address: '789 Pine Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'United States'
    },
    products: [
      {
        id: 'PH-002',
        name: 'Samsung Galaxy S24 Ultra',
        sku: 'SAM-S24-U-512',
        quantity: 1,
        price: 1299,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&h=150&fit=crop&crop=center'
      }
    ],
    totalAmount: 1299,
    status: 'In Transit',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    orderDate: '2024-09-08',
    deliveryDate: '2024-09-18',
    shippingCost: 0,
    tax: 104.0,
    discount: 0,
    paymentDetails: {
      cardHolder: 'Mike Johnson',
      cardLast4: '0911',
      cardBrand: 'Mastercard',
      authCode: 'AUTH-AC9102',
      transactionId: 'TXN-CC-2024-0042'
    }
  },
  {
    id: 'ORD-2024-004',
    trackingNumber: 'TRK-3M7N9O1P',
    customer: {
      id: 'CUST-004',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1 (555) 321-0987',
      address: '321 Elm Drive',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'United States'
    },
    products: [
      {
        id: 'TV-001',
        name: 'Samsung QLED 65"',
        sku: 'SAM-Q65-4K',
        quantity: 1,
        price: 1899,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=150&h=150&fit=crop&crop=center'
      }
    ],
    totalAmount: 1899,
    status: 'Pending',
    paymentMethod: 'Mpesa',
    paymentStatus: 'Paid',
    orderDate: '2024-09-14',
    deliveryDate: null,
    shippingCost: 49.99,
    tax: 151.92,
    discount: 100,
    paymentDetails: {
      mpesaNumber: '0745079253',
      mpesaName: 'KENNEDY  MUENDO',
      mpesaCode: 'TAXI4390',
      transactionTime: '10:50PM'
    }
  }
])

function getStatusColor(status) {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Processing':
      return 'bg-blue-100 text-blue-800';
    case 'In Transit':
      return 'bg-purple-100 text-purple-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

const filteredOrders = computed(() => {
  let filtered = orders;
  if (statusFilter.value !== 'All') {
    filtered = filtered.filter(order => order.status === statusFilter.value);
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order =>
      order.id.toLowerCase().includes(query) ||
      order.trackingNumber.toLowerCase().includes(query) ||
      order.customer.name.toLowerCase().includes(query) ||
      order.customer.email.toLowerCase().includes(query)
    );
  }
  return filtered;
});

function viewOrderDetails(order) {
  selectedOrder.value = order;
  showOrderDetailsModal.value = true;
  // Initialize pending status
  if (order) pendingStatus.value = order.status

  console.log(paymentDetailRows.value)
}

function confirmDeleteOrder(order) {
  orderToDelete.value = order;
  showDeleteConfirmModal.value = true;
}

function deleteOrder() {
  if (!orderToDelete.value) {
    return;
  }
  const index = orders.findIndex(o => o.id === orderToDelete.value.id);
  if (index > -1) {
    orders.splice(index, 1);
  }
  showDeleteConfirmModal.value = false;
  orderToDelete.value = null;
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
  // Just update pending status; actual mutation done on save
  pendingStatus.value = newStatus
  // If user selects a different status than the persisted one, clear saved indicator
  if (selectedOrder.value && newStatus !== selectedOrder.value.status) {
    justSavedStatus.value = false
  }
}

function cancelOrder() {
  if (!selectedOrder.value) return
  if (pendingStatus.value === 'Cancelled' && selectedOrder.value.status === 'Cancelled') return
  updateOrderStatus('Cancelled')
  saveStatusChange(() => {
    showNotification({ type: 'warning', title: 'Order Cancelled', message: 'Refund or reversal process will begin within 5 minutes if you do not change this status' })
  })
}

function attemptDeleteOrder(order) {
  if (!order) return
  if (order.status !== 'Cancelled') {
    showNotification({ type: 'warning', title: 'Deletion Blocked', message: 'Cancel the order first before deleting.' })
    return
  }
  confirmDeleteOrder(order)
}

function generateReceipt() {
  if (!selectedOrder.value) {
    return;
  }
  alert(`Receipt generated for order ${selectedOrder.value.id}`);
}

function generateInvoice() {
  if (!selectedOrder.value) {
    return;
  }
  alert(`Invoice generated for order ${selectedOrder.value.id}`);
}

function deleteOrderFromDetails() {
  if (!selectedOrder.value) {
    return;
  }
  if (selectedOrder.value.status !== 'Cancelled') {
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
  return pendingStatus.value && pendingStatus.value !== selectedOrderComputed.value.status
})

function saveStatusChange(afterCommitCb) {
  if (!selectedOrderComputed.value) return
  if (!hasStatusChanged.value) return
  if (isSavingStatus.value) return
  isSavingStatus.value = true
  justSavedStatus.value = false
  const orderId = selectedOrderComputed.value.id
  const newStatus = pendingStatus.value
  setTimeout(() => {
    const idx = orders.findIndex(o => o.id === orderId)
    if (idx > -1) {
      orders[idx].status = newStatus
      if (selectedOrderComputed.value && selectedOrderComputed.value.id === orderId) {
        selectedOrderComputed.value.status = newStatus
      }
    }
    isSavingStatus.value = false
    justSavedStatus.value = true
    if (afterCommitCb) afterCommitCb()
    setTimeout(() => { justSavedStatus.value = false }, 1600)
  }, 1000)
}

const orderFinancials = computed(() => {
  if (!selectedOrderComputed.value) {
    return null;
  }
  const o = selectedOrderComputed.value;
  const subtotal = o.totalAmount - o.tax - o.shippingCost + o.discount;
  const shipping = o.shippingCost;
  const tax = o.tax;
  const discount = o.discount;
  const total = o.totalAmount;
  const avgItemPrice = o.products.length ? subtotal / o.products.length : 0;
  const totalItems = o.products.reduce((sum, p) => sum + p.quantity, 0);
  return { subtotal, shipping, tax, discount, total, avgItemPrice, totalItems };
});

const statusTimeline = computed(() => {
  if (!selectedOrderComputed.value) {
    return [];
  }
  const statusOrder = ['Pending', 'Processing', 'In Transit', 'Delivered'];
  const current = selectedOrderComputed.value.status;
  return statusOrder.map(step => {
    const index = statusOrder.indexOf(step);
    const currentIndex = statusOrder.indexOf(current);
    const completed = currentIndex > index || current === 'Cancelled';
    const active = currentIndex === index && current !== 'Cancelled';
    const cancelled = current === 'Cancelled';
    return { step, completed, active, cancelled };
  });
});

const paymentBadge = computed(() => {
  if (!selectedOrderComputed.value) return '';
  const status = selectedOrderComputed.value.paymentStatus;
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-700';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'Failed':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
});


// Build payment detail rows depending on method
const paymentDetailRows = computed(() => {
  if (!selectedOrderComputed.value) return [];
  const { paymentMethod, paymentDetails = {} } = selectedOrderComputed.value;
  const rows = [];
  if (paymentMethod === 'Credit Card') {
    if (paymentDetails.cardBrand) rows.push(['Card Brand', paymentDetails.cardBrand]);
    if (paymentDetails.cardHolder) rows.push(['Card Holder', paymentDetails.cardHolder]);
    if (paymentDetails.cardLast4) rows.push(['Card Last 4', '**** **** **** ' + paymentDetails.cardLast4]);
    if (paymentDetails.authCode) rows.push(['Auth Code', paymentDetails.authCode]);
    if (paymentDetails.transactionId) rows.push(['Transaction ID', paymentDetails.transactionId]);
  } else if (paymentMethod === 'PayPal') {
    if (paymentDetails.paypalEmail) rows.push(['PayPal Email', paymentDetails.paypalEmail]);
    if (paymentDetails.paypalPayerId) rows.push(['Payer ID', paymentDetails.paypalPayerId]);
    if (paymentDetails.paypalTransactionId) rows.push(['Transaction ID', paymentDetails.paypalTransactionId]);
  } else if (paymentMethod === 'Bank Transfer') {
    if (paymentDetails.bankName) rows.push(['Bank Name', paymentDetails.bankName]);
    if (paymentDetails.accountName) rows.push(['Account Name', paymentDetails.accountName]);
    if (paymentDetails.reference) rows.push(['Reference', paymentDetails.reference]);
    if (paymentDetails.swiftCode) rows.push(['SWIFT Code', paymentDetails.swiftCode]);
    if (paymentDetails.expectedClearance) rows.push(['Expected Clearance', paymentDetails.expectedClearance]);
  } else if (paymentMethod === 'Mpesa' || paymentMethod === 'MPESA' || paymentMethod === 'M-Pesa') {
    if (paymentDetails.mpesaNumber) rows.push(['Mpesa Number', paymentDetails.mpesaNumber]);
    if (paymentDetails.mpesaName) rows.push(['Mpesa Name', paymentDetails.mpesaName]);
    if (paymentDetails.mpesaCode) rows.push(['Mpesa Code', paymentDetails.mpesaCode]);
    if (paymentDetails.transactionTime) rows.push(['Time', paymentDetails.transactionTime]);
  }
  return rows;
});


</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <admin-sidebar></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header></admin-header>
      
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
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tracking</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="order in filteredOrders" :key="order.id" @click.stop="viewOrderDetails(order)" class="hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ order.id }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ order.customer.name }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ order.customer.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex -space-x-2 overflow-hidden">
                        <img v-for="(product) in order.products.slice(0, 3)" :key="product.id" :src="product.image" :alt="product.name" class="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover" :title="product.name" />
                        <div v-if="order.products.length > 3" class="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
                          +{{ order.products.length - 3 }}
                        </div>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ order.products.length }} item{{ order.products.length > 1 ? 's' : '' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{{ order.trackingNumber }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">${{ order.totalAmount.toLocaleString() }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(order.status)]">{{ order.status }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ order.orderDate }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button @click.stop="viewOrderDetails(order)" class="text-[#042EFF] hover:text-blue-600" title="View Details">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                        <button v-if="order.status === 'Delivered'" @click.stop="confirmDeleteOrder(order)" class="text-red-600 hover:text-red-800" title="Delete Order">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Order {{ selectedOrderComputed.id }}</h3>
              <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', getStatusColor(selectedOrderComputed.status)]">{{ selectedOrderComputed.status }}</span>
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', paymentBadge]">Payment: {{ selectedOrderComputed.paymentStatus }}</span>
            </div>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
              <span>Tracking: {{ selectedOrderComputed.trackingNumber }}</span>
              <span>Placed: {{ selectedOrderComputed.orderDate }}</span>
              <span v-if="selectedOrderComputed.deliveryDate">ETA: {{ selectedOrderComputed.deliveryDate }}</span>
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
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-mono">Avg: ${{ orderFinancials?.avgItemPrice.toFixed(2) }}</span>
                </div>
                <div class="divide-y divide-gray-100 dark:divide-gray-700">
                  <div v-for="p in selectedOrderComputed.products" :key="p.id" class="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                    <img :src="p.image" :alt="p.name" class="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm" />
                    <div class="ml-4 flex-1 min-w-0">
                      <p class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ p.name }}</p>
                      <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                        <span>SKU: {{ p.sku }}</span>
                        <span>Qty: {{ p.quantity }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">${{ p.price.toLocaleString() }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${{ (p.price * p.quantity).toLocaleString() }} total</p>
                    </div>
                  </div>
                </div>
                <div class="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 px-5 py-4 space-y-2 text-sm">
                  <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Subtotal</span><span class="font-medium text-gray-900 dark:text-gray-100">${{ orderFinancials?.subtotal.toLocaleString() }}</span></div>
                  <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Shipping</span><span class="text-gray-900 dark:text-gray-100">${{ orderFinancials?.shipping.toLocaleString() }}</span></div>
                  <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">Tax</span><span class="text-gray-900 dark:text-gray-100">${{ orderFinancials?.tax.toLocaleString() }}</span></div>
                  <div v-if="orderFinancials && orderFinancials.discount > 0" class="flex justify-between text-green-600"><span>Discount</span><span>- ${{ orderFinancials.discount.toLocaleString() }}</span></div>
                  <div class="flex justify-between pt-2 mt-1 border-t border-gray-200 dark:border-gray-700 text-base font-semibold"><span class="text-gray-900 dark:text-gray-100">Total</span><span class="text-gray-900 dark:text-gray-100">${{ orderFinancials?.total.toLocaleString() }}</span></div>
                </div>
              </div>
              <!-- Customer Card -->
                <div class="col-span-1 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Customer</h4>
                  <span class="text-xs text-gray-400 font-mono">#{{ selectedOrderComputed.customer.id }}</span>
                </div>
                <div class="p-5 space-y-4 text-sm">
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Name</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedOrderComputed.customer.name }}</p>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Contact</p>
                    <div class="space-y-1">
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedOrderComputed.customer.email }}</p>
                      <p class="font-medium text-gray-900 dark:text-gray-100">{{ selectedOrderComputed.customer.phone }}</p>
                    </div>
                  </div>
                  <div>
                    <p class="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">Shipping Address</p>
                    <p class="font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{{ selectedOrderComputed.customer.address }}, {{ selectedOrderComputed.customer.city }}, {{ selectedOrderComputed.customer.state }} {{ selectedOrderComputed.customer.zipCode }}, {{ selectedOrderComputed.customer.country }}</p>
                  </div>
                  <div class="flex flex-wrap gap-2 pt-2">
                    <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium">{{ selectedOrderComputed.paymentMethod }}</span>
                    <span class="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium">{{ selectedOrderComputed.products.length }} item(s)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 2: Payment + Manage -->
            <div class="grid grid-cols-3 gap-4">
              <div class="col-span-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
                  <h4 class="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300 uppercase">Payment Details</h4>
                  <span class="text-xs font-medium px-2 py-1 rounded-md bg-[#042EFF]/10 text-[#042EFF]">{{ selectedOrderComputed.paymentMethod }}</span>
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
                    <span v-if="selectedOrderComputed.paymentStatus === 'Paid'" class="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-md bg-green-50 text-green-700 ring-1 ring-inset ring-green-200">Paid</span>
                    <span v-else-if="selectedOrderComputed.paymentStatus === 'Pending'" class="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-md bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200">Pending</span>
                    <span v-else class="inline-flex items-center px-2 py-1 text-[10px] font-semibold rounded-md bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-200">{{ selectedOrderComputed.paymentStatus }}</span>
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
  <select v-model="pendingStatus" @change="updateOrderStatus(pendingStatus)" class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm">
                      <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button @click="cancelOrder" :disabled="isSavingStatus || (selectedOrderComputed.status === 'Cancelled' && pendingStatus === 'Cancelled')" class="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-white text-sm font-medium shadow-sm transition-colors"
              :class="(selectedOrderComputed.status === 'Cancelled' && pendingStatus === 'Cancelled') ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'">
                      Cancel
                    </button>
                    <button @click="deleteOrderFromDetails" :disabled="selectedOrderComputed.status !== 'Cancelled'" class="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-white text-sm font-medium shadow-sm transition-colors" :class="selectedOrderComputed.status === 'Cancelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      Delete
                    </button>
                  </div>
                  <button @click="saveStatusChange" :disabled="!hasStatusChanged || isSavingStatus" :class="['relative w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors select-none',
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
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">You're about to permanently remove order <span class="font-semibold text-gray-900 dark:text-gray-100">{{ orderToDelete?.id }}</span>. This action cannot be undone and related analytics may be affected.</p>
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