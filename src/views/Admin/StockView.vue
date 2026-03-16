<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axiosClient from '@/axiosClient'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('All')
const isLoading = ref(false)
const loadError = ref('')

const showProductModal = ref(false)
const selectedProduct = ref(null)
const currentImageIndex = ref(0)

const products = ref([])
const stockOverview = ref([])

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
const fallbackImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="#F3F4F6"/><path d="M188 385l79-96 56 67 39-47 92 116H188z" fill="#D1D5DB"/><circle cx="247" cy="228" r="40" fill="#D1D5DB"/></svg>')}`

const categoryMeta = {
  phones: {
    color: 'bg-[#042EFF]',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"/>'
  },
  laptops: {
    color: 'bg-green-500',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>'
  },
  televisions: {
    color: 'bg-purple-500',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>'
  },
  smartwatches: {
    color: 'bg-yellow-500',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>'
  }
}

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toAbsoluteUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return fallbackImage
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) {
    return value
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`
  const storageReadyPath = /^\/storage\//i.test(normalizedPath)
    ? normalizedPath
    : /^\/(products|product_images)\//i.test(normalizedPath)
      ? `/storage${normalizedPath}`
      : normalizedPath

  return `${apiBaseUrl}${storageReadyPath}`
}

const parseSpecifications = (specifications) => {
  if (!specifications) {
    return {}
  }

  if (typeof specifications === 'object' && !Array.isArray(specifications)) {
    return specifications
  }

  if (typeof specifications === 'string') {
    try {
      const parsed = JSON.parse(specifications)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }

  return {}
}

const normalizeStatus = (status, stock, threshold) => {
  const normalizedStatus = String(status || '').trim().toLowerCase()

  if (normalizedStatus.includes('out')) return 'Out of Stock'
  if (normalizedStatus.includes('low')) return 'Low Stock'
  if (normalizedStatus.includes('in')) return 'In Stock'

  if (stock === 0) return 'Out of Stock'
  if (stock <= threshold) return 'Low Stock'
  return 'In Stock'
}

const getCategoryMeta = (category) => {
  const key = String(category || '').trim().toLowerCase()
  return categoryMeta[key] || {
    color: 'bg-slate-500',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16"/>'
  }
}

const extractImageUrl = (image) => {
  if (!image) {
    return ''
  }

  if (typeof image === 'string') {
    return image
  }

  if (typeof image === 'object') {
    return (
      image.url ||
      image.image ||
      image.image_path ||
      image.path ||
      image.src ||
      image.image_url ||
      image.imageUrl ||
      image.file_path ||
      image.filePath ||
      ''
    )
  }

  return ''
}

const getImageType = (image) => {
  if (!image || typeof image !== 'object') {
    return ''
  }

  return String(image.image_type || image.type || '').trim().toLowerCase()
}

const normalizeImages = (product) => {
  const productImages = Array.isArray(product.images)
    ? product.images
    : Array.isArray(product.product_images)
      ? product.product_images
      : []

  const mappedProductImages = productImages
    .flatMap((image, index) => {
      if (typeof image === 'string') {
        return [{
          type: index === 0 ? 'primary' : '',
          url: image
        }]
      }

      if (!image || typeof image !== 'object') {
        return []
      }

      const directUrl = extractImageUrl(image)
      const entries = []

      if (directUrl) {
        entries.push({
          type: getImageType(image),
          url: directUrl
        })
      }

      if (image.primary_image) {
        entries.push({ type: 'primary', url: image.primary_image })
      }

      if (image.second_image) {
        entries.push({ type: 'secondary', url: image.second_image })
      }

      if (image.third_image) {
        entries.push({ type: 'tertiary', url: image.third_image })
      }

      return entries
    })
    .filter((image) => image.url)

  const additionalImages = [
    product.primary_image,
    product.secondary_image,
    product.second_image,
    product.tertiary_image,
    product.third_image,
    product.image,
    product.primaryImage,
    product.secondaryImage,
    product.tertiaryImage
  ]

  const allImages = [
    ...mappedProductImages,
    ...additionalImages
      .map((imageUrl, index) => ({
        type: index === 0 ? 'primary' : '',
        url: extractImageUrl(imageUrl)
      }))
      .filter((image) => image.url)
  ]

  const dedupedImages = []
  const seen = new Set()

  allImages.forEach((image) => {
    const absoluteUrl = toAbsoluteUrl(image.url)

    if (!seen.has(absoluteUrl)) {
      seen.add(absoluteUrl)
      dedupedImages.push({
        type: image.type,
        url: absoluteUrl
      })
    }
  })

  const orderedImages = [
    ...dedupedImages.filter((image) => image.type === 'primary'),
    ...dedupedImages.filter((image) => image.type !== 'primary')
  ]

  return orderedImages.length
    ? orderedImages
    : [{ type: 'primary', url: fallbackImage }]
}

const getPrimaryProductImage = (product) => {
  if (!product || !Array.isArray(product.images) || !product.images.length) {
    return fallbackImage
  }

  const primaryImage = product.images.find((image) => image.type === 'primary')
  return (primaryImage || product.images[0]).url
}

const normalizeProduct = (product) => {
  const stock = toNumber(product.stock ?? product.stock_quantity)
  const lowStockThreshold = toNumber(
    product.lowStockThreshold ?? product.low_stock_threshold ?? product.low_stock_alert,
    10
  )
  const images = normalizeImages(product)
  const status = normalizeStatus(product.status, stock, lowStockThreshold)
  const specifications = parseSpecifications(product.specifications)
  const rawPrice = product.discount_price ?? product.discounted_price ?? product.price ?? product.base_price

  return {
    id: product.id ?? product.product_id ?? product.product_sku_id ?? crypto.randomUUID(),
    name: product.name ?? product.product_name ?? 'Unnamed Product',
    brand: product.brand ?? 'Unknown Brand',
    category: product.category ?? 'Uncategorized',
    sku: product.sku ?? product.product_sku ?? product.product_sku_id ?? 'N/A',
    price: toNumber(rawPrice),
    stock,
    lowStockThreshold,
    status,
    dateAdded: product.dateAdded ?? product.date_added ?? product.created_at ?? new Date().toISOString(),
    supplier: product.supplier ?? 'Not provided',
    images,
    description: product.description ?? 'No description available for this product.',
    specifications,
  }
}

const buildStockOverviewFromProducts = (items) => {
  const grouped = items.reduce((accumulator, product) => {
    const category = product.category || 'Uncategorized'

    if (!accumulator[category]) {
      accumulator[category] = {
        category,
        totalProducts: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0
      }
    }

    accumulator[category].totalProducts += 1
    accumulator[category].inStock += product.stock
    accumulator[category].totalValue += product.price * product.stock

    if (product.status === 'Out of Stock') {
      accumulator[category].outOfStock += 1
    } else if (product.status === 'Low Stock') {
      accumulator[category].lowStock += 1
    }

    return accumulator
  }, {})

  return Object.values(grouped).map((overview) => ({
    ...overview,
    ...getCategoryMeta(overview.category)
  }))
}

const normalizeStockOverview = (overview, items) => {
  if (Array.isArray(overview)) {
    return overview.map((entry, index) => {
      const category = entry.category ?? entry.name ?? entry.label ?? `Category ${index + 1}`

      return {
        category,
        totalProducts: toNumber(entry.totalProducts ?? entry.total_products ?? entry.products_count),
        inStock: toNumber(entry.inStock ?? entry.in_stock ?? entry.totalStock ?? entry.total_stock ?? entry.stock),
        lowStock: toNumber(entry.lowStock ?? entry.low_stock),
        outOfStock: toNumber(entry.outOfStock ?? entry.out_of_stock),
        totalValue: toNumber(entry.totalValue ?? entry.total_value ?? entry.value),
        ...getCategoryMeta(category)
      }
    })
  }

  if (overview && typeof overview === 'object') {
    return Object.entries(overview).map(([category, entry]) => ({
      category,
      totalProducts: toNumber(entry.totalProducts ?? entry.total_products ?? entry.products_count),
      inStock: toNumber(entry.inStock ?? entry.in_stock ?? entry.totalStock ?? entry.total_stock ?? entry.stock),
      lowStock: toNumber(entry.lowStock ?? entry.low_stock),
      outOfStock: toNumber(entry.outOfStock ?? entry.out_of_stock),
      totalValue: toNumber(entry.totalValue ?? entry.total_value ?? entry.value),
      ...getCategoryMeta(category)
    }))
  }

  return buildStockOverviewFromProducts(items)
}

const categories = computed(() => [
  'All',
  ...new Set(products.value.map((product) => product.category).filter(Boolean))
])

const getStatusColor = (status) => {
  switch (status) {
    case 'In Stock': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    case 'Low Stock': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    case 'Out of Stock': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
  }
}

const getStockLevel = (stock, threshold) => {
  if (stock === 0) return 'Out of Stock'
  if (stock <= threshold) return 'Low Stock'
  return 'In Stock'
}

const filteredProducts = computed(() => {
  let filtered = products.value
  
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter(product => product.category === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const fetchStockData = async () => {
  isLoading.value = true
  loadError.value = ''

  try {
    const response = await axiosClient.get('api/admin/stock')
    const normalizedProducts = (Array.isArray(response.data?.products) ? response.data.products : []).map(normalizeProduct)

    products.value = normalizedProducts
    stockOverview.value = normalizeStockOverview(response.data?.stockOverview, normalizedProducts)

    if (!categories.value.includes(selectedCategory.value)) {
      selectedCategory.value = 'All'
    }
  } catch (error) {
    console.error('Failed to fetch stock data:', error)
    loadError.value = error.response?.data?.message || 'Failed to load stock data.'
  } finally {
    isLoading.value = false
  }
}

const navigateToAddProduct = () => {
  router.push('/admin/add-product')
}

const viewProduct = (product) => {
  selectedProduct.value = product
  currentImageIndex.value = 0
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
  selectedProduct.value = null
  currentImageIndex.value = 0
}

const nextImage = () => {
  if (selectedProduct.value && selectedProduct.value.images) {
    currentImageIndex.value = (currentImageIndex.value + 1) % selectedProduct.value.images.length
  }
}

const prevImage = () => {
  if (selectedProduct.value && selectedProduct.value.images) {
    currentImageIndex.value = currentImageIndex.value === 0 
      ? selectedProduct.value.images.length - 1 
      : currentImageIndex.value - 1
  }
}

const goToImage = (index) => {
  currentImageIndex.value = index
}

const editProduct = (product) => {
  try{
    sessionStorage.setItem('editingProduct', JSON.stringify(product))
  }catch(err){
    console.log('Failed to store the product in the session')
  }
  showProductModal.value = false
  
  router.push({ name: 'admin-edit-product', params: { id: product.id  }})
}


const deleteProduct = (productId) => {
  if (confirm('Are you sure you want to delete this product?')) {
    const index = products.value.findIndex(p => p.id === productId)
    if (index > -1) {
      products.value.splice(index, 1)
      stockOverview.value = buildStockOverviewFromProducts(products.value)
    }
    showProductModal.value = false
  }
}

onMounted(() => {
  fetchStockData()
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <admin-sidebar></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header ></admin-header>
      
      <!-- Stock Management Content -->
      <main class="flex-1 overflow-auto p-6">
        <div class="max-w-5xl mx-auto">
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Stock Management</h1>
              <button 
                @click="navigateToAddProduct"
                class="bg-[#042EFF] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add New Product
              </button>
            </div>
          </div>
          <div v-if="loadError" class="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{{ loadError }}</span>
            <button @click="fetchStockData" class="rounded-lg border border-red-300 px-3 py-1.5 font-medium text-red-700 transition-colors hover:bg-red-100">
              Retry
            </button>
          </div>

          <div v-if="isLoading && !products.length" class="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Loading stock data...
          </div>

          <template v-else>

          <!-- Stock Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              v-for="overview in stockOverview" 
              :key="overview.category"
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
            >
              <div class="flex items-center justify-between mb-4">
                <div :class="[overview.color, 'p-3 rounded-lg']">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-html="overview.icon"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ overview.totalProducts }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Products</p>
                </div>
              </div>
              
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{{ overview.category }}</h3>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Total Stock:</span>
                  <span class="font-medium text-green-600">{{ overview.inStock }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Low Stock:</span>
                  <span class="font-medium text-yellow-600">{{ overview.lowStock }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600 dark:text-gray-400">Out of Stock:</span>
                  <span class="font-medium text-red-600">{{ overview.outOfStock }}</span>
                </div>
                <div class="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">Total Value:</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">${{ overview.totalValue.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Table -->
          <div v-if="filteredProducts.length" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Inventory</h3>
                
                <!-- Search and Filter -->
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search products..."
                      class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    >
                  </div>
                  
                  <select 
                    v-model="selectedCategory"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr  v-for="product in filteredProducts" :key="product.id" @click.stop="viewProduct(product)" class="hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img :src="getPrimaryProductImage(product)" :alt="product.name" class="h-12 w-12 rounded-lg object-cover mr-4">
                        <div>
                          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ product.name }}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">ID: {{ product.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ product.brand }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        {{ product.category }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ product.sku }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${{ product.price.toLocaleString() }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ product.stock }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(product.status)]">
                        {{ product.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button @click.stop="viewProduct(product)" class="text-[#042EFF] hover:text-blue-600" title="View Details">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button @click.stop="editProduct(product)" class="text-gray-600 hover:text-gray-800" title="Edit Product">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button @click.stop="deleteProduct(product.id)" class="text-red-600 hover:text-red-800" title="Delete Product">
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
          <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p class="px-6 py-4 border-b  border-gray-200 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">There are no products in the store</p>
          </div>
          </template>
        </div>
      </main>
    </div>

    <!-- Product Details Modal -->
    <div v-if="showProductModal && selectedProduct" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 product-overlay  rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        <!-- Modal Header -->
        <div class="sticky z-10 top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ selectedProduct.name }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ selectedProduct.brand }} • {{ selectedProduct.category }}</p>
          </div>
          <button 
            @click="closeProductModal"
            class="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg class="w-6 h-6 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Image Carousel -->
            <div class="space-y-4">
              <div class="relative bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden aspect-square">
                <img 
                  :src="selectedProduct.images[currentImageIndex]?.url" 
                  :alt="selectedProduct.name"
                  class="w-full h-full object-contain"
                >
                
                <!-- Navigation arrows -->
                <button 
                  @click="prevImage"
                  class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-2 rounded-full transition-all"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                
                <button 
                  @click="nextImage"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-2 rounded-full transition-all"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <!-- Image indicators -->
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <button 
                    v-for="(image, index) in selectedProduct.images" 
                    :key="index"
                    @click="goToImage(index)"
                    :class="[
                      'w-3 h-3 rounded-full transition-all',
                      currentImageIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                    ]"
                  ></button>
                </div>
              </div>

              <!-- Thumbnail images -->
              <div class="flex space-x-2">
                <button 
                  v-for="(image, index) in selectedProduct.images" 
                  :key="index"
                  @click="goToImage(index)"
                  :class="[
                    'flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all',
                    currentImageIndex === index ? 'border-[#042EFF] ring-2 ring-[#042EFF]/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <img :src="image.url" :alt="`${selectedProduct.name} view ${index + 1}`" class="w-full h-full object-contain bg-gray-50 dark:bg-gray-900">
                </button>
              </div>
            </div>

            <!-- Product Details -->
            <div class="space-y-6">
              <!-- Price and Stock Info -->
              <div class="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="text-3xl font-bold text-gray-900 dark:text-gray-100">${{ selectedProduct.price.toLocaleString() }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">SKU: {{ selectedProduct.sku }}</p>
                  </div>
                  <span 
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      getStatusColor(selectedProduct.status)
                    ]"
                  >
                    {{ selectedProduct.status }}
                  </span>
                </div>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Current Stock</p>
                    <p class="font-semibold text-lg text-gray-900 dark:text-gray-100">{{ selectedProduct.stock }} units</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Low Stock Alert</p>
                    <p class="font-semibold text-lg text-gray-900 dark:text-gray-100">{{ selectedProduct.lowStockThreshold }} units</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Date Added</p>
                    <p class="font-semibold text-gray-900 dark:text-gray-100">{{ new Date(selectedProduct.dateAdded).toLocaleDateString() }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Supplier</p>
                    <p class="font-semibold text-gray-900 dark:text-gray-100">{{ selectedProduct.supplier }}</p>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Description</h3>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ selectedProduct.description }}</p>
              </div>

              <!-- Specifications -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Specifications</h3>
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div 
                    v-for="(value, key) in selectedProduct.specifications" 
                    :key="key"
                    class="flex border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div class="w-1/3 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {{ key.replace(/([A-Z])/g, ' $1').trim() }}
                    </div>
                    <div class="flex-1 px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{{ value }}</div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-3 pt-4">
                <button 
                  @click="editProduct(selectedProduct)"
                  class="flex-1 bg-[#042EFF] text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit Product
                </button>
                <button 
                  @click="deleteProduct(selectedProduct.id)"
                  class="px-4 py-3 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium flex items-center justify-center"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
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

/* Note: hover styles handled via Tailwind utilities in template for light/dark */

/* Modal backdrop animation */
.fixed.inset-0 {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal slide in animation */
.inline-block.align-bottom {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Enhanced backdrop blur */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Focus states for better accessibility */
input:focus,
select:focus,
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(4, 46, 255, 0.1);
}

/* Button hover animations */
button {
  transition: all 0.2s ease-in-out;
}

/* Status badge styling */
.inline-flex.items-center {
  transition: transform 0.2s ease-in-out;
}

.inline-flex.items-center:hover {
  transform: scale(1.05);
}

/* Modal animations */
.fixed.inset-0 {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.product-overlay::-webkit-scrollbar{
  display: none;
}
.bg-white.rounded-2xl {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Carousel transitions */
.aspect-square img {
  transition: transform 0.3s ease-in-out;
}

.aspect-square:hover img {
  transform: scale(1.05);
}

/* Enhanced backdrop blur for modal */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Thumbnail border animation */
.border-2 {
  transition: all 0.2s ease-in-out;
}

/* Specification table base style handled via Tailwind classes (light/dark) */

/* Action button hover effects */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Smooth scrolling for modal */
.overflow-y-auto {
  scroll-behavior: smooth;
}

</style>