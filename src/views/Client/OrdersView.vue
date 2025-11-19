<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ShoppingBagIcon, EyeIcon, DocumentTextIcon, XMarkIcon, ArrowLongRightIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const isLoading = ref(true)
const orders = ref([])
const showOrderDetails = ref({})
const showReceiptModal = ref(false)
const showCancelModal = ref(false)
const currentReceiptOrder = ref(null)
const orderToCancel = ref(null)
const isCancelling = ref(false)

// Sample orders data - replace with actual API call
const sampleOrders = [
  {
    id: 'ORD-2025-001',
    orderDate: '2025-09-10T10:30:00Z',
    status: 'Delivered',
    items: [
      {
        id: 1,
        name: 'iPhone 14',
        price: 999.99,
        quantity: 1,
        image: '/src/assets/images/iphone14.png'
      },
      {
        id: 2,
        name: 'Dell Inspiron Laptop',
        price: 799.99,
        quantity: 1,
        image: '/src/assets/images/dell inspiron.png'
      }
    ],
    subtotal: 1799.98,
    deliveryFee: 15.00,
    tax: 144.00,
    totalAmount: 1958.98,
    deliveryAddress: '123 Main St, Nairobi, Kenya',
    paymentMethod: 'visa',
    deliveredDate: '2025-09-12T14:30:00Z',
    trackingNumber: null // Delivered orders don't need active tracking
  },
  {
    id: 'ORD-2025-002',
    orderDate: '2025-09-11T14:15:00Z',
    status: 'In Transit',
    items: [
      {
        id: 3,
        name: 'Redmi Note 12',
        price: 299.99,
        quantity: 2,
        image: '/src/assets/images/redmi note 12.png'
      }
    ],
    subtotal: 599.98,
    deliveryFee: 10.00,
    tax: 48.00,
    totalAmount: 657.98,
    deliveryAddress: '456 Oak Ave, Mombasa, Kenya',
    paymentMethod: 'm-pesa',
    estimatedDelivery: '2025-09-15T00:00:00Z',
    trackingNumber: 'TRK987654321'
  },
  {
    id: 'ORD-2025-003',
    orderDate: '2025-09-11T16:45:00Z',
    status: 'Processing',
    items: [
      {
        id: 4,
        name: 'HP Laptop 15 CI7',
        price: 899.99,
        quantity: 1,
        image: '/src/assets/images/hp laptop 15 ci7.png'
      }
    ],
    subtotal: 899.99,
    deliveryFee: 12.00,
    tax: 72.00,
    totalAmount: 983.99,
    deliveryAddress: '789 Pine St, Kisumu, Kenya',
    paymentMethod: 'paypal',
    estimatedDelivery: '2025-09-16T00:00:00Z',
    trackingNumber: 'TRK456789123'
  },
  {
    id: 'ORD-2025-004',
    orderDate: '2025-09-11T18:30:00Z',
    status: 'Pending',
    items: [
      {
        id: 5,
        name: 'Infinix Smart 7 Plus',
        price: 199.99,
        quantity: 1,
        image: '/src/assets/images/infinix smart 7 plus.png'
      }
    ],
    subtotal: 199.99,
    deliveryFee: 8.00,
    tax: 16.00,
    totalAmount: 223.99,
    deliveryAddress: '321 Cedar Ave, Eldoret, Kenya',
    paymentMethod: 'visa',
    estimatedDelivery: '2025-09-17T00:00:00Z',
    trackingNumber: null // Pending orders don't have tracking yet
  }
]

onMounted(async () => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  if (!isLoggedIn) {
    router.push({ path: '/login', query: { returnTo: '/orders' } })
    return
  }
  
  await loadOrders()
})

const loadOrders = async () => {
  try {
    isLoading.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For now, use sample data
    orders.value = sampleOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  const statusClasses = {
    'Pending': 'bg-orange-400 text-white',
    'Processing': 'bg-[#FFCF10] text-white',
    'In Transit': 'bg-[#68A4FE] text-white',
    'Delivered': 'bg-green-500 text-white',
    'Cancelled': 'bg-[#FF412C] text-white'
  }
  return statusClasses[status] || 'bg-gray-500 text-white'
}

const getProgressSteps = (status) => {
  const steps = [
    { name: 'Pending', status: 'pending' },
    { name: 'Processing', status: 'processing' },
    { name: 'In Transit', status: 'in-transit' },
    { name: 'Delivered', status: 'delivered' }
  ]
  
  const statusOrder = ['Pending', 'Processing', 'In Transit', 'Delivered']
  const currentIndex = statusOrder.indexOf(status)
  
  return steps.map((step, index) => ({
    ...step,
    isCompleted: index <= currentIndex,
    isCurrent: index === currentIndex
  }))
}

// Show cancel button for all statuses except 'Delivered' (and hide on already 'Cancelled')
const canCancelOrder = (status) => status !== 'Delivered' && status !== 'Cancelled'

const toggleOrderDetails = (orderId) => {
  showOrderDetails.value[orderId] = !showOrderDetails.value[orderId]
}

const generateReceipt = (order) => {
  currentReceiptOrder.value = order
  showReceiptModal.value = true
}

const downloadReceipt = () => {
  // Only allow PDF download for delivered orders
  if (currentReceiptOrder.value?.status === 'Delivered') {
    // In a real app, this would generate a PDF
    alert('PDF receipt download would be implemented here')
  }
}

const confirmCancelOrder = (order) => {
  orderToCancel.value = order
  showCancelModal.value = true
}

const cancelOrder = async () => {
  if (!orderToCancel.value) return
  
  try {
    isCancelling.value = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update order status locally
    const orderIndex = orders.value.findIndex(o => o.id === orderToCancel.value.id)
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = 'Cancelled'
    }
    
    showCancelModal.value = false
    orderToCancel.value = null
    
  } catch (error) {
    console.error('Error cancelling order:', error)
  } finally {
    isCancelling.value = false
  }
}

const closeModals = () => {
  showReceiptModal.value = false
  showCancelModal.value = false
  orderToCancel.value = null
  currentReceiptOrder.value = null
}
</script>

<template>
  <Header/>
  <main class="menu-toggle">
    <section class="orders-section mx-auto pt-16 px-[4%] lg:max-w-[1500px]">
      <div class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize">
        My<span class="text-[#68A4FE] px-2">Orders</span>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-[#68a4fe]"></div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="text-center py-16">
        <div class="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <ShoppingBagIcon class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-xl font-semibold text-[#384857] mb-2">No Orders Yet</h3>
        <p class="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <router-link 
          to="/products" 
          class="inline-block bg-[#68a4fe] hover:bg-[#5496f8] px-6 py-3 rounded-md text-white font-semibold transition-colors duration-300"
        >
          Start Shopping
        </router-link>
      </div>
      
      <!-- Orders List -->
      <div v-else class="orders-container">
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="order-box flex flex-col justify-between p-4 w-full border-b-2 border-gray-300 my-4 text-[#384857]"
        >
          <!-- Order Header -->
          <div class="order-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div class="order-info">
              <h3 class="product-name font-semibold text-base sm:text-xl capitalize mb-1">
                Order #{{ order.id }}
              </h3>
              <div class="product-text text-sm">
                Placed on {{ formatDate(order.orderDate) }}
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span 
                  :class="getStatusClass(order.status)"
                  class="px-3 py-1 rounded-md text-sm font-medium"
                >
                  {{ order.status }}
                </span>
              </div>
              
              <!-- Progress Indicator -->
              <div class="progress-indicator mt-4">
                <div class="flex justify-between">
                  <div 
                    v-for="(step, index) in getProgressSteps(order.status)" 
                    :key="step.name"
                    class="flex items-center"
                  >
                    <!-- Step Circle -->
                    <div class="flex flex-col items-center">
                      <div 
                        :class="[
                          'w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300',
                          step.isCompleted 
                            ? (step.name === 'Delivered' ? 'bg-green-500 text-white' : 
                               step.name === 'In Transit' ? 'bg-[#68A4FE] text-white' :
                               step.name === 'Processing' ? 'bg-[#FFCF10] text-white' :
                               'bg-orange-400 text-white')
                            : 'bg-gray-200 text-gray-600',
                          step.isCurrent && step.isCompleted ? 'animate-pulse-bubble' : ''
                        ]"
                      >
                        {{ index + 1 }}
                      </div>
                      <span 
                        :class="[
                          'text-xs mt-2 text-center max-w-16',
                          step.isCompleted ? 'text-[#384857] font-medium' : 'text-gray-500'
                        ]"
                      >
                        {{ step.name }}
                      </span>
                    </div>
                    
                    <!-- Heroicon Long Arrow -->
                    <div 
                      v-if="index < getProgressSteps(order.status).length - 1"
                      class="flex items-center mx-3 -translate-y-1.5"
                    >
                      <ArrowLongRightIcon 
                        :class="[
                          'w-8 h-8 transition-colors duration-300',
                          step.isCompleted ? 'text-[#68A4FE]' : 'text-gray-300'
                        ]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="action-box flex flex-col items-end gap-2">
              <div class="product-price text-[#FF412C] text-lg sm:text-xl font-semibold">
                ${{ order.totalAmount.toFixed(2) }}
              </div>
              <div class="action-buttons flex items-center gap-2">
                <button
                  @click="toggleOrderDetails(order.id)"
                  class="px-4 py-2 bg-[#68a4fe] hover:bg-[#5496f8] rounded-md text-white text-center transition-colors duration-300 flex items-center gap-2"
                >
                  <EyeIcon class="w-4 h-4" />
                  {{ showOrderDetails[order.id] ? 'Hide' : 'View' }} Details
                </button>
                <button
                  v-if="order.status === 'Delivered'"
                  @click="generateReceipt(order)"
                  class="px-4 py-2 bg-[#FFCF10] hover:bg-yellow-500 rounded-md text-white text-center transition-colors duration-300 flex items-center gap-2"
                >
                  <DocumentTextIcon class="w-4 h-4" />
                  Receipt
                </button>
                <button
                  v-if="canCancelOrder(order.status)"
                  @click="confirmCancelOrder(order)"
                  class="px-4 py-2 bg-[#FF412C] hover:bg-red-600 rounded-md text-white text-center transition-colors duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Order Details (Expandable) -->
          <div v-if="showOrderDetails[order.id]" class="order-details bg-gray-50 p-4 rounded-md">
            <!-- Order Items -->
            <div class="order-items mb-6">
              <h4 class="font-semibold text-[#384857] mb-4 text-base sm:text-lg">Order Items</h4>
              <div class="space-y-4">
                <div 
                  v-for="item in order.items" 
                  :key="item.id"
                  class="item-box flex items-center justify-between p-3 bg-white rounded-md border"
                >
                  <div class="flex items-center gap-4">
                    <img 
                      :src="item.image" 
                      :alt="item.name"
                      class="w-16 h-16 object-cover rounded-md"
                    />
                    <div>
                      <h5 class="font-medium text-[#384857] capitalize">{{ item.name }}</h5>
                      <p class="text-sm text-gray-600">Quantity: {{ item.quantity }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-[#FF412C]">${{ (item.price * item.quantity).toFixed(2) }}</p>
                    <p class="text-sm text-gray-600">${{ item.price.toFixed(2) }} each</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="order-summary border-2 border-gray-300 rounded-md">
              <h4 class="order-summary-title capitalize border-b-2 border-gray-300 px-4 py-3 text-center text-base sm:text-lg font-semibold bg-gray-100">
                Order Summary
              </h4>
              <div class="summary-content p-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="text-[#384857] font-medium">${{ order.subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Delivery Fee:</span>
                  <span class="text-[#384857] font-medium">${{ order.deliveryFee.toFixed(2) }}</span>
                </div>
                <div v-if="order.tax > 0" class="flex justify-between text-sm">
                  <span class="text-gray-600">Tax:</span>
                  <span class="text-[#384857] font-medium">${{ order.tax.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                  <span class="text-[#384857]">Total:</span>
                  <span class="text-[#FF412C]">${{ order.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Delivery Information -->
            <div class="delivery-info mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-md border">
              <div>
                <h5 class="font-medium text-[#384857] mb-2">Delivery Address</h5>
                <p class="text-sm text-gray-600">{{ order.deliveryAddress }}</p>
              </div>
              <div>
                <h5 class="font-medium text-[#384857] mb-2">Payment Method</h5>
                <p class="text-sm text-gray-600 capitalize">{{ order.paymentMethod }}</p>
              </div>
              <!-- Show delivered date for delivered orders, estimated delivery for others -->
              <div v-if="order.status === 'Delivered' && order.deliveredDate">
                <h5 class="font-medium text-[#384857] mb-2">Delivered On</h5>
                <p class="text-sm text-green-600 font-medium">{{ formatDate(order.deliveredDate) }}</p>
              </div>
              <div v-else-if="order.estimatedDelivery">
                <h5 class="font-medium text-[#384857] mb-2">Estimated Delivery</h5>
                <p class="text-sm text-gray-600">{{ formatDate(order.estimatedDelivery) }}</p>
              </div>
              
              <!-- Show tracking number only for processing/in-transit orders -->
              <div v-if="order.trackingNumber && ['Processing', 'In Transit'].includes(order.status)">
                <h5 class="font-medium text-[#384857] mb-2">Tracking Number</h5>
                <p class="text-sm text-gray-600 font-mono">{{ order.trackingNumber }}</p>
              </div>
              <div v-else-if="order.status === 'Delivered'">
                <h5 class="font-medium text-[#384857] mb-2">Delivery Status</h5>
                <p class="text-sm text-green-600 font-medium">✓ Successfully Delivered</p>
              </div>
              <div v-else-if="order.status === 'Pending'">
                <h5 class="font-medium text-[#384857] mb-2">Order Status</h5>
                <p class="text-sm text-orange-600 font-medium">⏳ Awaiting Admin Approval</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Receipt Modal -->
    <div 
      v-if="showReceiptModal && currentReceiptOrder" 
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModals"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Receipt Header -->
        <div class="receipt-header border-b-2 border-gray-300 p-6 flex justify-between items-center">
          <h3 class="text-xl font-semibold text-[#384857]">Order Receipt</h3>
          <button
            @click="closeModals"
            class="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Receipt Content -->
        <div class="receipt-content p-6">
          <!-- Company Info -->
          <div class="company-info text-center mb-6">
            <h2 class="text-2xl font-bold text-[#68A4FE] mb-2">MoTech</h2>
            <p class="text-sm text-gray-600">Electronic Store</p>
            <p class="text-sm text-gray-600">Thank you for your purchase!</p>
          </div>

          <!-- Order Info -->
          <div class="order-info border-b border-gray-200 pb-4 mb-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Order Number:</p>
                <p class="font-semibold text-[#384857]">{{ currentReceiptOrder.id }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Order Date:</p>
                <p class="font-semibold text-[#384857]">{{ formatDate(currentReceiptOrder.orderDate) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Status:</p>
                <span 
                  :class="getStatusClass(currentReceiptOrder.status)"
                  class="px-2 py-1 rounded text-sm font-medium"
                >
                  {{ currentReceiptOrder.status }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Payment Method:</p>
                <p class="font-semibold text-[#384857] capitalize">{{ currentReceiptOrder.paymentMethod }}</p>
              </div>
              <div v-if="currentReceiptOrder.status === 'Delivered' && currentReceiptOrder.deliveredDate">
                <p class="text-sm text-gray-600">Delivered On:</p>
                <p class="font-semibold text-green-600">{{ formatDate(currentReceiptOrder.deliveredDate) }}</p>
              </div>
              <div v-else-if="currentReceiptOrder.estimatedDelivery">
                <p class="text-sm text-gray-600">Estimated Delivery:</p>
                <p class="font-semibold text-[#384857]">{{ formatDate(currentReceiptOrder.estimatedDelivery) }}</p>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="receipt-items mb-4">
            <h4 class="font-semibold text-[#384857] mb-3">Items Purchased</h4>
            <div class="space-y-2">
              <div 
                v-for="item in currentReceiptOrder.items" 
                :key="item.id"
                class="flex justify-between items-center py-2 border-b border-gray-100"
              >
                <div>
                  <p class="font-medium text-[#384857]">{{ item.name }}</p>
                  <p class="text-sm text-gray-600">Qty: {{ item.quantity }} × ${{ item.price.toFixed(2) }}</p>
                </div>
                <p class="font-semibold text-[#FF412C]">${{ (item.price * item.quantity).toFixed(2) }}</p>
              </div>
            </div>
          </div>

          <!-- Receipt Summary -->
          <div class="receipt-summary border-t border-gray-200 pt-4">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal:</span>
                <span class="text-[#384857]">${{ currentReceiptOrder.subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Delivery Fee:</span>
                <span class="text-[#384857]">${{ currentReceiptOrder.deliveryFee.toFixed(2) }}</span>
              </div>
              <div v-if="currentReceiptOrder.tax > 0" class="flex justify-between">
                <span class="text-gray-600">Tax:</span>
                <span class="text-[#384857]">${{ currentReceiptOrder.tax.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span class="text-[#384857]">Total Paid:</span>
                <span class="text-[#FF412C]">${{ currentReceiptOrder.totalAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Receipt Footer -->
          <div class="receipt-footer mt-6 pt-4 border-t border-gray-200 text-center">
            <p class="text-sm text-gray-600">Delivery Address:</p>
            <p class="text-sm text-[#384857] mb-4">{{ currentReceiptOrder.deliveryAddress }}</p>
            <p class="text-xs text-gray-500">Thank you for shopping with MoTech!</p>
          </div>
        </div>

        <!-- Receipt Actions -->
        <div class="receipt-actions border-t border-gray-200 p-4 flex gap-3 justify-end">
          <button
            @click="downloadReceipt"
            :disabled="currentReceiptOrder.status !== 'Delivered'"
            :class="[
              'px-4 py-2 rounded-md transition-colors duration-300',
              currentReceiptOrder.status === 'Delivered' 
                ? 'bg-[#FFCF10] hover:bg-yellow-500 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Cancel Order Modal -->
    <div 
      v-if="showCancelModal && orderToCancel" 
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModals"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <XMarkIcon class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-lg font-semibold text-[#384857]">Cancel Order</h3>
        </div>
        <p class="text-gray-600 mb-6">
          Are you sure you want to cancel order <strong>#{{ orderToCancel.id }}</strong>? This action cannot be undone.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="closeModals"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md transition-colors duration-300"
          >
            Keep Order
          </button>
          <button
            @click="cancelOrder"
            :disabled="isCancelling"
            class="px-4 py-2 bg-[#FF412C] hover:bg-red-600 text-white rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isCancelling">Cancelling...</span>
            <span v-else>Cancel Order</span>
          </button>
        </div>
      </div>
    </div>
  </main>
  <Footer/>
</template>

<style scoped>
/* Cart-style aesthetics matching CartView.vue */
.orders-section {
  min-height: 70vh;
}

.order-box {
  background-color: white;
  transition: all 0.3s ease-in-out;
}

.order-box:hover {
  background-color: #f9f9f9;
}

.action-buttons button {
  transition: all 0.3s ease-in-out;
}

.order-details {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
}

/* Loading animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Receipt modal print styles */
@media print {
  .receipt-actions {
    display: none !important;
  }
  
  .receipt-header button {
    display: none !important;
  }
}

/* Enhanced backdrop blur for modals */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Progress indicator styling */
.progress-indicator {
  max-width: 600px;
}

/* Heroicon arrow styling */
.progress-indicator svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* Step circle hover effect */
.progress-indicator .rounded-full {
  transition: all 0.3s ease-in-out;
}

.progress-indicator .rounded-full:hover {
  transform: scale(1.05);
}

/* Responsive design improvements */
@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-buttons button {
    width: 100%;
  }
  
  .progress-indicator {
    max-width: 100%;
  }
  
  .progress-indicator .flex {
    flex-wrap: wrap;
    gap: 8px;
  }
}

/* Bubble animation for current order status */
@keyframes pulse-bubble {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.animate-pulse-bubble {
  animation: pulse-bubble 1.5s ease-in-out infinite;
}
</style>
