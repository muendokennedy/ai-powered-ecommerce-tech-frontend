<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
// Static imports to avoid dynamic import fetch errors during PDF generation
import { jsPDF } from 'jspdf'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
// html2canvas/html-to-image removed to revert to stable manual jsPDF layout
import { useRouter, useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ShoppingBagIcon, EyeIcon, DocumentTextIcon, XMarkIcon, ArrowLongRightIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const isLoading = ref(true)
const orders = ref([])
const showOrderDetails = ref({})
const showReceiptModal = ref(false)
const showCancelModal = ref(false)
const currentReceiptOrder = ref(null)
const orderToCancel = ref(null)
const isCancelling = ref(false)
// Receipt + code refs
const receiptRef = ref(null)
const barcodeRef = ref(null)
const qrcodeRef = ref(null)

// Orders now loaded dynamically from localStorage 'orders'.

onMounted(async () => {
  await loadOrders()
  const newId = route?.query?.newId
  if (newId && typeof newId === 'string') {
    showOrderDetails.value[newId] = true
    await nextTick()
    const el = document.querySelector(`[data-order-id="${newId}"]`)
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})

const loadOrders = async () => {
  try {
    isLoading.value = true
    const raw = localStorage.getItem('orders')
    let parsed = []
    if (raw) {
      try { parsed = JSON.parse(raw) || [] } catch { parsed = [] }
    }
    if (!Array.isArray(parsed)) parsed = []
    // Sort newest first
    orders.value = parsed.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
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
    month: 'short',
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

// Build standalone printable HTML for the given order
const buildPrintableReceipt = (order) => {
  if (!order) return '<p>No order selected</p>'
  const itemRows = order.items.map(it => `
      <tr>
        <td style="padding:2px 4px;white-space:nowrap;">${it.name}</td>
        <td style="padding:2px 4px;text-align:right;">${it.quantity} @ $${it.price.toFixed(2)}</td>
        <td style="padding:2px 4px;text-align:right;">$${(it.price * it.quantity).toFixed(2)}</td>
      </tr>`).join('')
  return `<!DOCTYPE html><html><head><meta charset='utf-8' />
    <title>Receipt ${order.id}</title>
    <style>
      body{font-family:monospace;font-size:12px;line-height:1.25;color:#222;padding:16px;max-width:480px;margin:0 auto;background:#fff;}
      h1,h2,h3{margin:4px 0;font-weight:700;font-size:14px;text-align:center;}
      .divider{margin:6px 0;text-align:center;letter-spacing:1px;}
      table{width:100%;border-collapse:collapse;margin-top:4px;}
      th{font-weight:700;text-align:left;padding:4px 4px;border-bottom:1px solid #ccc;font-size:11px;}
      td{font-size:11px;}
      .totals td{padding:2px 4px;}
      .totals .label{font-weight:700;}
      .barcode, .qrcode{display:flex;justify-content:center;margin:8px 0;}
      .actions{position:sticky;top:0;background:#fff;padding:8px 0;display:flex;gap:8px;justify-content:center;border-bottom:1px solid #eee;}
      button{font-size:12px;padding:6px 10px;border:1px solid #222;background:#ffcf10;cursor:pointer;border-radius:4px;}
      button#printBtn{background:#68a4fe;color:#fff;border-color:#68a4fe;}
      @media print{.actions{display:none;}body{padding:0;margin:0;}}
    </style>
  </head><body>
    <div class='actions'>
      <button id='printBtn' onclick='window.print()'>Print / Save PDF</button>
    </div>
    <h2>MOTECH ELECTRONICS</h2>
    <div style='text-align:center;font-size:10px;'>VAT NO: P0123456789 | PIN: A123456789B<br/>Branch: MO TECH VIRTUAL - Nairobi, Kenya<br/>Tel: 020-1234567 | Thank you for shopping!</div>
    <div class='divider'>------------------------------------</div>
    <div style='display:grid;grid-template-columns:1fr 1fr;row-gap:2px;font-size:11px;'>
      <div>ORDER#: ${order.id}</div><div style='text-align:right;'>DATE: ${formatDate(order.orderDate)}</div>
      <div>STATUS: ${order.status}</div><div style='text-align:right;'>PAY: ${order.paymentMethod.toUpperCase()}</div>
      <div style='grid-column:1/3;'>ITEMS: ${order.items.reduce((a,i)=>a+i.quantity,0)}</div>
      ${order.status === 'Delivered' && order.deliveredDate ? `<div style='grid-column:1/3;'>DELIVERED: ${formatDate(order.deliveredDate)}</div>` : (order.estimatedDelivery ? `<div style='grid-column:1/3;'>EST. DELIVERY: ${formatDate(order.estimatedDelivery)}</div>` : '')}
    </div>
    <div class='barcode'><svg id='barcode'></svg></div>
    <div class='divider'>------------------------------------</div>
    <table>
      <thead><tr><th>Item</th><th style='text-align:right;'>Qty/Unit</th><th style='text-align:right;'>Total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class='divider'>------------------------------------</div>
    <table class='totals'>
      <tr><td class='label'>SUBTOTAL</td><td style='text-align:right;'>$${order.subtotal.toFixed(2)}</td></tr>
      <tr><td class='label'>DELIVERY</td><td style='text-align:right;'>$${order.deliveryFee.toFixed(2)}</td></tr>
      ${order.tax > 0 ? `<tr><td class='label'>VAT</td><td style='text-align:right;'>$${order.tax.toFixed(2)}</td></tr>` : ''}
      <tr><td colspan='2'><div class='divider'>------------------------------------</div></td></tr>
      <tr><td class='label'>TOTAL PAID</td><td style='text-align:right;font-weight:700;'>$${order.totalAmount.toFixed(2)}</td></tr>
    </table>
    <div class='divider'>------------------------------------</div>
    <div style='font-size:11px;'><strong>DELIVERY ADDRESS</strong><br/>${order.deliveryAddress}</div>
    <div class='divider'>------------------------------------</div>
    <div class='qrcode'><canvas id='qrcode' width='96' height='96' style='border:1px dashed #ccc;padding:2px;'></canvas></div>
    <div style='text-align:center;font-size:10px;'>Scan for Order#: ${order.id}</div>
    <p style='text-align:center;font-size:10px;margin-top:6px;'>NO CASH VALUE • KEEP FOR YOUR RECORDS</p>
    <p style='text-align:center;font-size:10px;'>Powered by MoTech Commerce</p>
  </body></html>`
}

const downloadReceipt = async () => {
  const order = currentReceiptOrder.value
  if (!order || order.status !== 'Delivered') return
  try {
    // Thermal receipt width (slightly wider to prevent truncation). Increased from 220pt to 260pt (~92mm).
    const receiptWidth = 260 // pt
    const margin = 16
    const lh = 12 // slightly tighter line height for narrow width
    let y = margin

    // Pre-generate barcode & QR to know image heights
    let barcodeData = null, barcodeW = 0, barcodeH = 0
    let qrData = null, qrSize = 0
    try {
      const bcCanvas = document.createElement('canvas')
      JsBarcode(bcCanvas, String(order.id), { format: 'CODE128', displayValue: false, height: 40, margin: 0 })
      barcodeData = bcCanvas.toDataURL('image/png')
      // Fit barcode within receipt width minus margins
      // Allow a slightly wider barcode now that width is larger
      barcodeW = Math.min(receiptWidth - margin * 2, 200)
      barcodeH = barcodeW / (bcCanvas.width / bcCanvas.height)
    } catch {}
    try {
      const qrCanvas = document.createElement('canvas')
      await QRCode.toCanvas(qrCanvas, String(order.id), { width: 96, margin: 0 })
      qrData = qrCanvas.toDataURL('image/png')
      qrSize = Math.min(96, receiptWidth - margin * 2)
    } catch {}

    // Helper to estimate text block height
    const addLines = (count = 1) => { y += lh * count }
    const dividerStr = (usable) => '-'.repeat(Math.max(10, Math.floor(usable / 6)))

    // Height calculation pass
    addLines(4) // header lines
    addLines(1) // divider
    addLines(3) // ORDER#/STATUS/ITEMS
    if (order.status === 'Delivered' && order.deliveredDate) {
      addLines(1)
    } else if (order.estimatedDelivery) {
      addLines(1)
    }
    if (barcodeData) { y += 8; y += barcodeH + 12 } // spacing + barcode + bottom space
    addLines(1) // divider
    addLines(1) // ITEMS label
    // Each item: name + qty line
    addLines(order.items.length * 2)
    addLines(1) // divider
    // Totals: subtotal, delivery, maybe VAT, divider, total
    addLines( (order.tax > 0 ? 5 : 4) )
    addLines(1) // divider
    addLines(1) // DELIVERY ADDRESS label
    addLines( order.deliveryAddress.split('\n').length )
    addLines(1) // divider
    if (qrData) { y += 8; y += qrSize + 12; addLines(1) } // scan text line
    addLines(2) // footer lines
    const receiptHeight = y + margin

    // Create PDF with computed height
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [receiptWidth, receiptHeight] })
    const pageWidth = receiptWidth
    y = margin // reset for actual render

    const divider = () => dividerStr(pageWidth - margin * 2)
    const drawDivider = () => {
      // Draw a dashed line across the usable width
      pdf.setDrawColor(0)
      pdf.setLineWidth(0.3)
      const xStart = margin
      const xEnd = pageWidth - margin
      const dash = 3 // pt length of dash
      const gap = 2 // pt gap between dashes
      for (let x = xStart; x < xEnd; x += dash + gap) {
        const segEnd = Math.min(x + dash, xEnd)
        pdf.line(x, y, segEnd, y)
      }
      y += lh
    }
    const text = (str, size = 10, bold = false, align = 'left') => {
      pdf.setFont('courier', bold ? 'bold' : 'normal')
      pdf.setFontSize(size)
      if (align === 'right') pdf.text(str, pageWidth - margin, y, { align: 'right' })
      else if (align === 'center') pdf.text(str, pageWidth / 2, y, { align: 'center' })
      else pdf.text(str, margin, y)
      y += lh
    }
    const leftRight = (l, r, size = 10) => {
      pdf.setFont('courier', 'normal')
      pdf.setFontSize(size)
      pdf.text(l, margin, y)
      if (r) pdf.text(r, pageWidth - margin, y, { align: 'right' })
      y += lh
    }

    // Header
    text('MOTECH ELECTRONICS', 11, true, 'center')
    text('VAT NO: P0123456789 | PIN: A123456789B', 8, false, 'center')
    text('Branch: MO TECH VIRTUAL - Nairobi, Kenya', 8, false, 'center')
    text('Tel: 020-1234567 | Thank you!', 8, false, 'center')
    drawDivider()

    // Meta
    leftRight(`ORDER#: ${order.id}`)
    leftRight(`DATE: ${formatDate(order.orderDate)}`)
    leftRight(`STATUS: ${order.status}`)
    leftRight(`PAY: ${order.paymentMethod.toUpperCase()}`)
    leftRight(`ITEMS: ${order.items.reduce((a,i)=>a+i.quantity,0)}`, '')
    if (order.status === 'Delivered' && order.deliveredDate) leftRight(`DELIVERED: ${formatDate(order.deliveredDate)}`, '')
    else if (order.estimatedDelivery) leftRight(`EST. DELIVERY: ${formatDate(order.estimatedDelivery)}`, '')

    // Barcode
    if (barcodeData) {
      y += 8
      pdf.addImage(barcodeData, 'PNG', (pageWidth - barcodeW) / 2, y, barcodeW, barcodeH)
      y += barcodeH + 12
    }

    drawDivider()
    text('ITEMS', 9, true)
    order.items.forEach(it => {
      const total = `$${(it.price * it.quantity).toFixed(2)}`
      // Wider width allows longer names before truncation
      const name = it.name.length > 30 ? it.name.slice(0, 29) + '…' : it.name
      pdf.setFont('courier', 'normal'); pdf.setFontSize(9)
      pdf.text(name, margin, y)
      pdf.text(total, pageWidth - margin, y, { align: 'right' })
      y += lh
      pdf.text(`Qty ${it.quantity} @ $${it.price.toFixed(2)}`, margin, y)
      y += lh
    })

    drawDivider()
    leftRight('SUBTOTAL', `$${order.subtotal.toFixed(2)}`, 9)
    leftRight('DELIVERY', `$${order.deliveryFee.toFixed(2)}`, 9)
    if (order.tax > 0) leftRight('VAT', `$${order.tax.toFixed(2)}`, 9)
    drawDivider()
    pdf.setFont('courier', 'bold'); leftRight('TOTAL PAID', `$${order.totalAmount.toFixed(2)}`, 10)

    drawDivider()
    text('DELIVERY ADDRESS', 9, true)
    pdf.setFont('courier','normal'); pdf.setFontSize(8)
    order.deliveryAddress.split('\n').forEach(line => { pdf.text(line, margin, y); y += lh })
    drawDivider()

    // QR code
    if (qrData) {
      y += 8
      pdf.addImage(qrData, 'PNG', (pageWidth - qrSize) / 2, y, qrSize, qrSize)
      y += qrSize + 12
      text(`Scan for Order#: ${order.id}`, 8, false, 'center')
    }

    text('NO CASH VALUE • KEEP FOR YOUR RECORDS', 8, false, 'center')
    text('Powered by MoTech Commerce', 8, false, 'center')

    const blob = pdf.output('blob')
    const url = URL.createObjectURL(blob)
    const viewer = window.open(url, '_blank'); if (viewer) { try { viewer.focus() } catch {} }
  } catch (e) {
    console.error('PDF generation failed:', e)
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

// Generate barcode (order number) and QR code (order number) when receipt opens
const renderCodes = async () => {
  if (!showReceiptModal.value || !currentReceiptOrder.value) return
  await nextTick()
  try {
    if (barcodeRef.value) {
      barcodeRef.value.innerHTML = ''
      JsBarcode(barcodeRef.value, String(currentReceiptOrder.value.id), {
        format: 'CODE128',
        displayValue: true,
        fontSize: 10,
        height: 40,
        margin: 0
      })
    }
    if (qrcodeRef.value) {
      const canvas = qrcodeRef.value
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      await QRCode.toCanvas(canvas, String(currentReceiptOrder.value.id), {
        width: 96,
        margin: 0
      })
    }
  } catch (e) {
    console.error('Barcode/QR generation failed:', e)
  }
}

watch([showReceiptModal, currentReceiptOrder], () => {
  renderCodes()
})
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
          :data-order-id="order.id"
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
                  <span class="text-gray-600">VAT:</span>
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
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16 sm:pt-16"
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
        <div ref="receiptRef" class="receipt-content p-6 font-mono text-xs leading-5 text-[#222]">
          <!-- Header Branding -->
          <div class="text-center mb-3">
            <h2 class="text-sm font-bold tracking-wide">MOTECH ELECTRONICS</h2>
            <p class="text-[10px]">VAT NO: P0123456789 | PIN: A123456789B</p>
            <p class="text-[10px]">Branch: MO TECH VIRTUAL - Nairobi, Kenya</p>
            <p class="text-[10px]">Tel: 020-1234567 | Thank you for shopping!</p>
          </div>
          <div class="divider">------------------------------------</div>
          <!-- Order & Payment Meta -->
          <div class="grid grid-cols-2 gap-y-1 mt-2">
            <p>ORDER#: {{ currentReceiptOrder.id }}</p>
            <p class="text-right">DATE: {{ formatDate(currentReceiptOrder.orderDate) }}</p>
            <p>STATUS: {{ currentReceiptOrder.status }}</p>
            <p class="text-right">PAY: {{ currentReceiptOrder.paymentMethod.toUpperCase() }}</p>
            <p class="col-span-2">ITEMS: {{ currentReceiptOrder.items.reduce((a, i) => a + i.quantity, 0) }}</p>
            <p v-if="currentReceiptOrder.status === 'Delivered' && currentReceiptOrder.deliveredDate">DELIVERED: {{ formatDate(currentReceiptOrder.deliveredDate) }}</p>
            <p v-else-if="currentReceiptOrder.estimatedDelivery" class="col-span-2">EST. DELIVERY: {{ formatDate(currentReceiptOrder.estimatedDelivery) }}</p>
          </div>
          <!-- Barcode for order number -->
          <div class="mt-2 flex justify-center">
            <svg ref="barcodeRef" class="max-w-full"></svg>
          </div>
          <div class="divider mt-2">------------------------------------</div>
          <!-- Items -->
          <div class="mt-2">
            <p class="font-bold">ITEMS</p>
            <div v-for="item in currentReceiptOrder.items" :key="item.id" class="flex justify-between">
              <div class="w-2/3 pr-2">
                <p class="truncate capitalize">{{ item.name }}</p>
                <p class="text-[10px]">Qty {{ item.quantity }} @ ${{ item.price.toFixed(2) }}</p>
              </div>
              <div class="text-right w-1/3">
                <p>${{ (item.price * item.quantity).toFixed(2) }}</p>
              </div>
            </div>
          </div>
          <div class="divider mt-2">------------------------------------</div>
          <!-- Totals -->
          <div class="space-y-1">
            <div class="flex justify-between"><span>SUBTOTAL</span><span>${{ currentReceiptOrder.subtotal.toFixed(2) }}</span></div>
            <div class="flex justify-between"><span>DELIVERY</span><span>${{ currentReceiptOrder.deliveryFee.toFixed(2) }}</span></div>
            <div v-if="currentReceiptOrder.tax > 0" class="flex justify-between"><span>VAT</span><span>${{ currentReceiptOrder.tax.toFixed(2) }}</span></div>
            <div class="divider">------------------------------------</div>
            <div class="flex justify-between font-bold text-sm"><span>TOTAL PAID</span><span>${{ currentReceiptOrder.totalAmount.toFixed(2) }}</span></div>
          </div>
          <div class="divider mt-3">------------------------------------</div>
          <!-- Address & Footer -->
          <div class="mt-2">
            <p class="font-bold">DELIVERY ADDRESS</p>
            <p class="text-[10px]">{{ currentReceiptOrder.deliveryAddress }}</p>
          </div>
          <div class="divider mt-2">------------------------------------</div>
          <p class="text-center text-[10px] tracking-wide">NO CASH VALUE • KEEP FOR YOUR RECORDS</p>
          <p class="text-center text-[10px]">Powered by MoTech Commerce</p>
          <!-- QR code at bottom for order number -->
          <div class="mt-3 flex justify-center">
            <canvas ref="qrcodeRef" width="96" height="96" class="border border-dashed border-gray-300 p-1"></canvas>
          </div>
          <p class="text-center text-[10px] mt-1">Scan for Order#: {{ currentReceiptOrder.id }}</p>
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
