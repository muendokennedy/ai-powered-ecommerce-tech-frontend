
<script setup>
import { reactive, ref } from 'vue'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'

const showOrderDetailsModal = ref(false)
const showDeleteConfirmModal = ref(false)
const selectedOrder = ref(null)
const orderToDelete = ref(null)
const searchQuery = ref('')
const statusFilter = ref('All')

// Orders data
const orders = reactive([
  {
    id: 'ORD-2024-001',    trackingNumber: 'TRK-5A8B9C2D',
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
    notes: 'Customer requested expedited shipping'
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
    notes: 'Bundle discount applied'
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
    shippingCost: 12.99,
    tax: 103.92,
    discount: 0,
    notes: ''
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
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Pending',
    orderDate: '2024-09-14',
    deliveryDate: null,
    shippingCost: 49.99,
    tax: 151.92,
    discount: 100,
    notes: 'Waiting for payment confirmation'
  }
])

const statuses = ['All', 'Pending', 'Processing', 'In Transit', 'Delivered']

const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-800'
    case 'Processing': return 'bg-blue-100 text-blue-800'
    case 'In Transit': return 'bg-purple-100 text-purple-800'
    case 'Pending': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const filteredOrders = () => {
  let filtered = orders
  
  if (statusFilter.value !== 'All') {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.id.toLowerCase().includes(query) ||
      order.trackingNumber.toLowerCase().includes(query) ||
      order.customer.name.toLowerCase().includes(query) ||
      order.customer.email.toLowerCase().includes(query)
    )
  }
  
  return filtered
}

const viewOrderDetails = (order) => {
  selectedOrder.value = order
  showOrderDetailsModal.value = true
}

const confirmDeleteOrder = (order) => {
  orderToDelete.value = order
  showDeleteConfirmModal.value = true
}

const deleteOrder = () => {
  if (orderToDelete.value) {
    const index = orders.findIndex(o => o.id === orderToDelete.value.id)
    if (index > -1) {
      orders.splice(index, 1)
    }
    showDeleteConfirmModal.value = false
    orderToDelete.value = null
  }
}

const closeOrderDetailsModal = () => {
  showOrderDetailsModal.value = false
  selectedOrder.value = null
}

const closeDeleteConfirmModal = () => {
  showDeleteConfirmModal.value = false
  orderToDelete.value = null
}

const updateOrderStatus = (newStatus) => {
  if (selectedOrder.value) {
    selectedOrder.value.status = newStatus
    const orderIndex = orders.findIndex(o => o.id === selectedOrder.value.id)
    if (orderIndex > -1) {
      orders[orderIndex].status = newStatus
    }
  }
}

const cancelOrder = () => {
  if (selectedOrder.value) {
    updateOrderStatus('Cancelled')
    alert('Order has been cancelled')
  }
}

const generateReceipt = () => {
  if (selectedOrder.value) {
    alert(`Receipt generated for order ${selectedOrder.value.id}`)
  }
}

const generateInvoice = () => {
  if (selectedOrder.value) {
    alert(`Invoice generated for order ${selectedOrder.value.id}`)
  }
}

const deleteOrderFromDetails = () => {
  if (selectedOrder.value) {
    confirmDeleteOrder(selectedOrder.value)
    closeOrderDetailsModal()
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <admin-sidebar></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header></admin-header>
      
      <!-- Orders Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-7xl mx-auto">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Orders Management</h1>
          </div>

          <!-- Orders Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">All Orders</h3>
                
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
                      class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                  </div>
                  
                  <select 
                    v-model="statusFilter"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]"
                  >
                    <option v-for="status in statuses" :key="status" :value="status">
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
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="order in filteredOrders()" :key="order.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ order.id }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ order.customer.name }}</div>
                      <div class="text-sm text-gray-500">{{ order.customer.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex -space-x-2 overflow-hidden">
                        <img 
                          v-for="(product) in order.products.slice(0, 3)" 
                          :key="product.id"
                          :src="product.image" 
                          :alt="product.name"
                          class="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                          :title="product.name"
                        >
                        <div v-if="order.products.length > 3" class="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 ring-2 ring-white text-xs font-medium text-gray-600">
                          +{{ order.products.length - 3 }}
                        </div>
                      </div>
                      <div class="text-xs text-gray-500 mt-1">{{ order.products.length }} item{{ order.products.length > 1 ? 's' : '' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {{ order.trackingNumber }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${{ order.totalAmount.toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(order.status)]">
                        {{ order.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ order.orderDate }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button @click="viewOrderDetails(order)" class="text-[#042EFF] hover:text-blue-600" title="View Details">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button @click="confirmDeleteOrder(order)" class="text-red-600 hover:text-red-800" title="Delete Order">
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

    <!-- Order Details Modal -->
    <div v-if="showOrderDetailsModal && selectedOrder" class="fixed backdrop-blur-2xl inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeOrderDetailsModal"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-6 py-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-6">
              <div>
                <h3 class="text-2xl leading-6 font-bold text-gray-900">Order Details</h3>
                <p class="text-sm text-gray-500 mt-1">{{ selectedOrder.id }} • {{ selectedOrder.trackingNumber }}</p>
              </div>
              <button @click="closeOrderDetailsModal" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Order Summary & Actions -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Order Date</p>
                  <p class="font-medium">{{ selectedOrder.orderDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Payment Method</p>
                  <p class="font-medium">{{ selectedOrder.paymentMethod }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Total Amount</p>
                  <p class="font-medium text-lg">${{ selectedOrder.totalAmount.toLocaleString() }}</p>
                </div>
              </div>
              
              <div class="flex space-x-3 mt-4">
                <button @click="generateReceipt" class="bg-[#042EFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  Generate Receipt
                </button>
                <button @click="generateInvoice" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  Generate Invoice
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Products Section -->
              <div class="space-y-6">
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Products Ordered</h4>
                  <div class="space-y-3">
                    <div v-for="product in selectedOrder.products" :key="product.id" class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img :src="product.image" :alt="product.name" class="h-16 w-16 rounded-lg object-cover">
                      <div class="flex-1">
                        <h5 class="font-medium text-gray-900">{{ product.name }}</h5>
                        <p class="text-sm text-gray-600">SKU: {{ product.sku }}</p>
                        <p class="text-sm text-gray-600">Quantity: {{ product.quantity }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-medium text-gray-900">${{ product.price.toLocaleString() }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Order Totals -->
                  <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div class="space-y-2">
                      <div class="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${{ (selectedOrder.totalAmount - selectedOrder.tax - selectedOrder.shippingCost + selectedOrder.discount).toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span>Shipping:</span>
                        <span>${{ selectedOrder.shippingCost.toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span>${{ selectedOrder.tax.toLocaleString() }}</span>
                      </div>
                      <div v-if="selectedOrder.discount > 0" class="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-${{ selectedOrder.discount.toLocaleString() }}</span>
                      </div>
                      <div class="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>${{ selectedOrder.totalAmount.toLocaleString() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Customer & Actions Section -->
              <div class="space-y-6">
                <!-- Customer Details -->
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="space-y-3">
                      <div>
                        <p class="text-sm text-gray-600">Name</p>
                        <p class="font-medium">{{ selectedOrder.customer.name }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600">Email</p>
                        <p class="font-medium">{{ selectedOrder.customer.email }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600">Phone</p>
                        <p class="font-medium">{{ selectedOrder.customer.phone }}</p>
                      </div>
                      <div>
                        <p class="text-sm text-gray-600">Shipping Address</p>
                        <p class="font-medium">{{ selectedOrder.customer.address }}</p>
                        <p class="font-medium">{{ selectedOrder.customer.city }}, {{ selectedOrder.customer.state }} {{ selectedOrder.customer.zipCode }}</p>
                        <p class="font-medium">{{ selectedOrder.customer.country }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Order Actions -->
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Order Actions</h4>
                  <div class="space-y-4">
                    <!-- Status Update -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                      <select 
                        :value="selectedOrder.status"
                        @change="updateOrderStatus($event.target.value)"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex flex-col space-y-3">
                      <button @click="cancelOrder" class="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                        Cancel Order
                      </button>
                      <button @click="deleteOrderFromDetails" class="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                        Delete Order
                      </button>
                    </div>

                    <!-- Notes -->
                    <div v-if="selectedOrder.notes">
                      <label class="block text-sm font-medium text-gray-700 mb-2">Order Notes</label>
                      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p class="text-sm text-yellow-800">{{ selectedOrder.notes }}</p>
                      </div>
                    </div>
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
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Order</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete order <strong>{{ orderToDelete?.id }}</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="deleteOrder" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
              Delete Order
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

/* Modal backdrop animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
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