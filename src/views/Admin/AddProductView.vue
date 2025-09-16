<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'

const router = useRouter()

// Existing product names for auto-suggestion with complete data
const existingProductsDatabase = [
  {
    name: 'iPhone 15 Pro Max',
    category: 'Phones',
    brand: 'Apple',
    originalPrice: 150000,
    discountedPrice: 145000,
    description: 'Latest iPhone with Pro camera system and A17 Pro chip. Features titanium design and advanced photography capabilities.',
    specifications: {
      storage: '256GB',
      ram: '8GB',
      displaySize: '6.7"',
      camera: '48MP Pro Camera System',
      battery: '4441mAh',
      operatingSystem: 'iOS 17',
      color: 'Natural Titanium'
    }
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Phones',
    brand: 'Samsung',
    originalPrice: 140000,
    discountedPrice: 135000,
    description: 'Premium flagship with S Pen, exceptional camera zoom, and AI features.',
    specifications: {
      storage: '512GB',
      ram: '12GB',
      displaySize: '6.8"',
      camera: '200MP Quad Camera',
      battery: '5000mAh',
      operatingSystem: 'Android 14',
      color: 'Titanium Gray'
    }
  },
  {
    name: 'MacBook Pro 14"',
    category: 'Laptops',
    brand: 'Apple',
    originalPrice: 220000,
    discountedPrice: 215000,
    description: 'Professional laptop with M3 Pro chip, Liquid Retina XDR display, and all-day battery life.',
    specifications: {
      processor: 'Apple M3 Pro',
      ram: '18GB',
      storageType: 'SSD',
      storageSize: '1TB',
      graphicsCard: 'Apple M3 Pro GPU',
      displaySize: '14.2"',
      operatingSystem: 'macOS Sonoma',
      batteryLife: '18 hours'
    }
  },
  {
    name: 'Dell XPS 13',
    category: 'Laptops',
    brand: 'Dell',
    originalPrice: 110000,
    discountedPrice: 105000,
    description: 'Ultra-portable premium laptop with InfinityEdge display and exceptional build quality.',
    specifications: {
      processor: 'Intel Core i7-1360P',
      ram: '16GB',
      storageType: 'SSD',
      storageSize: '512GB',
      graphicsCard: 'Intel Iris Xe',
      displaySize: '13.4"',
      operatingSystem: 'Windows 11 Pro',
      batteryLife: '14 hours'
    }
  },
  {
    name: 'Samsung QLED 65"',
    category: 'Televisions',
    brand: 'Samsung',
    originalPrice: 120000,
    discountedPrice: 115000,
    description: 'Premium QLED TV with Quantum Dot technology, vibrant colors, and smart Tizen OS.',
    specifications: {
      screenSize: '65"',
      resolution: '4K Ultra HD',
      displayTechnology: 'Neo QLED',
      smartTvOs: 'Tizen OS',
      hdrSupport: 'HDR10+ & Dolby Vision',
      refreshRate: '120Hz',
      audioOutput: '60W Object Tracking Sound'
    }
  },
  {
    name: 'LG OLED 55"',
    category: 'Televisions',
    brand: 'LG',
    originalPrice: 180000,
    discountedPrice: 175000,
    description: 'Self-lit OLED pixels deliver perfect blacks, infinite contrast, and stunning picture quality.',
    specifications: {
      screenSize: '55"',
      resolution: '4K Ultra HD',
      displayTechnology: 'OLED evo',
      smartTvOs: 'webOS 23',
      hdrSupport: 'Dolby Vision IQ',
      refreshRate: '120Hz',
      audioOutput: '40W Dolby Atmos'
    }
  },
  {
    name: 'Apple Watch Series 9',
    category: 'Smartwatches',
    brand: 'Apple',
    originalPrice: 48000,
    discountedPrice: 45000,
    description: 'Most advanced Apple Watch with S9 chip, Double Tap gesture, and comprehensive health tracking.',
    specifications: {
      displayType: 'Always-On Retina LTPO OLED',
      caseSize: '45mm',
      operatingSystem: 'watchOS 10',
      batteryLife: '18 hours',
      waterResistance: '50m',
      connectivity: 'Wi-Fi + Cellular',
      healthSensors: 'ECG, Blood Oxygen, Temperature'
    }
  },
  {
    name: 'Samsung Galaxy Watch 6',
    category: 'Smartwatches',
    brand: 'Samsung',
    originalPrice: 38000,
    discountedPrice: 35000,
    description: 'Feature-rich smartwatch with advanced health monitoring and long-lasting battery.',
    specifications: {
      displayType: 'Super AMOLED',
      caseSize: '44mm',
      operatingSystem: 'Wear OS 4',
      batteryLife: '40 hours',
      waterResistance: '5ATM + IP68',
      connectivity: 'Bluetooth 5.3 + Wi-Fi',
      healthSensors: 'BioActive Sensor, Sleep Tracking'
    }
  }
]

// New product form data
const newProduct = reactive({
  name: '',
  brand: '',
  category: 'Phones',
  originalPrice: '',
  discountedPrice: '',
  stock: '',
  lowStockThreshold: '10',
  supplier: '',
  description: '',
  primaryImage: null,
  secondaryImage: null,
  tertiaryImage: null,
  specifications: {}
})

const isSubmitting = ref(false)
const showNameSuggestions = ref(false)
const searchQuery = ref('')
const autoFillNotification = ref(false)

// Category-specific specification templates
const specificationTemplates = {
  Phones: {
    storage: '',
    color: '',
    display: '',
    processor: '',
    camera: '',
    battery: ''
  },
  Laptops: {
    processor: '',
    memory: '',
    storage: '',
    display: '',
    battery: '',
    ports: ''
  },
  Televisions: {
    display: '',
    resolution: '',
    hdr: '',
    smartTV: '',
    audio: '',
    connectivity: ''
  },
  Smartwatches: {
    size: '',
    display: '',
    processor: '',
    storage: '',
    battery: '',
    features: ''
  }
}

const categories = ['Phones', 'Laptops', 'Televisions', 'Smartwatches']
const brands = ['Apple', 'Samsung', 'Dell', 'LG', 'HP', 'Sony', 'Google', 'OnePlus']
const suppliers = ['Apple Inc.', 'Samsung Electronics', 'Dell Technologies', 'LG Electronics', 'HP Inc.', 'Sony Corporation']

// Computed properties
const filteredProducts = computed(() => {
  if (!searchQuery.value) return []
  return existingProductsDatabase.filter(product => 
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).slice(0, 5)
})

const finalPrice = computed(() => {
  return newProduct.discountedPrice || newProduct.originalPrice
})

// Auto-fill function when product is selected
const selectProduct = (product) => {
  // Fill basic product information
  newProduct.name = product.name
  newProduct.brand = product.brand
  newProduct.category = product.category
  newProduct.originalPrice = product.originalPrice
  newProduct.discountedPrice = product.discountedPrice
  newProduct.description = product.description
  
  // Auto-fill specifications based on category
  newProduct.specifications = { ...product.specifications }
  
  // Reset images and supplier (these should be unique per entry)
  newProduct.primaryImage = null
  newProduct.secondaryImage = null
  newProduct.tertiaryImage = null
  newProduct.supplier = ''
  
  // Hide suggestions and clear search
  showNameSuggestions.value = false
  searchQuery.value = product.name
  
  // Show auto-fill notification
  autoFillNotification.value = true
  setTimeout(() => {
    autoFillNotification.value = false
  }, 3000)
  
  console.log(`Auto-filled data for ${product.name}`)
}

// Watchers
watch(() => newProduct.category, (newCategory) => {
  // Reset specifications when category changes
  newProduct.specifications = { ...specificationTemplates[newCategory] }
})

watch(() => newProduct.name, (newName) => {
  searchQuery.value = newName
  showNameSuggestions.value = newName.length > 0
})

// Initialize specifications for default category
newProduct.specifications = { ...specificationTemplates[newProduct.category] }

// Methods
const resetForm = () => {
  Object.assign(newProduct, {
    name: '',
    brand: '',
    category: 'Phones',
    originalPrice: '',
    discountedPrice: '',
    stock: '',
    lowStockThreshold: '10',
    supplier: '',
    description: '',
    primaryImage: null,
    secondaryImage: null,
    tertiaryImage: null,
    specifications: { ...specificationTemplates['Phones'] }
  })
  searchQuery.value = ''
  showNameSuggestions.value = false
}

const handleImageUpload = (event, imageType) => {
  const file = event.target.files[0]
  if (file) {
    newProduct[imageType] = file
  }
}

const addProduct = async () => {
  if (!newProduct.name || !newProduct.brand || !newProduct.originalPrice || !newProduct.stock) {
    alert('Please fill in all required fields')
    return
  }

  isSubmitting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate product data (in real app, this would be handled by backend)
    const newId = `${newProduct.category.substring(0,2).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    const sku = `${newProduct.brand.substring(0,3).toUpperCase()}-${newProduct.name.substring(0,5).toUpperCase()}-${Math.floor(Math.random() * 1000)}`
    
    // Here you would typically send the data to your backend API
    console.log('Adding product:', {
      id: newId,
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      sku: sku,
      originalPrice: parseFloat(newProduct.originalPrice),
      discountedPrice: newProduct.discountedPrice ? parseFloat(newProduct.discountedPrice) : null,
      finalPrice: parseFloat(finalPrice.value),
      stock: parseInt(newProduct.stock),
      lowStockThreshold: parseInt(newProduct.lowStockThreshold) || 10,
      dateAdded: new Date().toISOString().split('T')[0],
      supplier: newProduct.supplier,
      description: newProduct.description,
      primaryImage: newProduct.primaryImage,
      secondaryImage: newProduct.secondaryImage,
      tertiaryImage: newProduct.tertiaryImage,
      specifications: newProduct.specifications
    })
    
    alert('Product added successfully!')
    router.push('/admin/stock')
  } catch (error) {
    console.error('Error adding product:', error)
    alert('Error adding product. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/admin/stock')
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <admin-sidebar></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header></admin-header>
      
      <!-- Add Product Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Add New Product</h1>
              </div>
              <button 
                @click="goBack"
                class="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Stock
              </button>
            </div>
          </div>

          <!-- Auto-fill Notification -->
          <div v-if="autoFillNotification" 
               class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in">
            <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-green-800 font-medium">Product data auto-filled successfully!</p>
              <p class="text-green-600 text-sm">Please review and update supplier information before submitting.</p>
            </div>
          <!-- Auto-fill Notification -->
          <div v-if="autoFillNotification" 
               class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in">
            <svg class="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <p class="text-green-800 font-medium">Product data auto-filled successfully!</p>
              <p class="text-green-600 text-sm">Please review and update supplier information before submitting.</p>
            </div>
          </div>

          <!-- Form -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <form @submit.prevent="addProduct" class="space-y-8">
              <!-- Basic Information -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="relative">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input 
                      v-model="newProduct.name"
                      @focus="showNameSuggestions = true"
                      @blur="setTimeout(() => showNameSuggestions = false, 200)"
                      type="text" 
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                      placeholder="Enter product name or select from existing"
                    >
                    
                    <!-- Auto-suggestion dropdown -->
                    <div v-if="showNameSuggestions && filteredProducts.length > 0" 
                         class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                      <div 
                        v-for="product in filteredProducts" 
                        :key="product.name"
                        @click="selectProduct(product)"
                        class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div class="flex justify-between items-center">
                          <div>
                            <div class="font-medium text-gray-900">{{ product.name }}</div>
                            <div class="text-sm text-gray-500">{{ product.brand }} · {{ product.category }}</div>
                          </div>
                          <div class="text-right">
                            <div class="text-sm font-medium text-[#042EFF]">KES {{ product.discountedPrice?.toLocaleString() || product.originalPrice?.toLocaleString() }}</div>
                            <div v-if="product.discountedPrice && product.discountedPrice !== product.originalPrice" 
                                 class="text-xs text-gray-400 line-through">KES {{ product.originalPrice?.toLocaleString() }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                    <select 
                      v-model="newProduct.brand"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                    >
                      <option value="">Select Brand</option>
                      <option v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select 
                      v-model="newProduct.category"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                    >
                      <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                    <select 
                      v-model="newProduct.supplier"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                    >
                      <option value="">Select Supplier</option>
                      <option v-for="supplier in suppliers" :key="supplier" :value="supplier">{{ supplier }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Pricing & Inventory -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Pricing & Inventory</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Original Price ($) *</label>
                    <input 
                      v-model="newProduct.originalPrice"
                      type="number" 
                      min="0"
                      step="0.01"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                      placeholder="0.00"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Discounted Price ($)</label>
                    <input 
                      v-model="newProduct.discountedPrice"
                      type="number" 
                      min="0"
                      step="0.01"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                      placeholder="Optional"
                    >
                    <p class="text-xs text-gray-500 mt-1">Leave empty if no discount</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input 
                      v-model="newProduct.stock"
                      type="number" 
                      min="0"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                      placeholder="0"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                    <input 
                      v-model="newProduct.lowStockThreshold"
                      type="number" 
                      min="0"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                      placeholder="10"
                    >
                  </div>
                </div>
              </div>

              <!-- Product Images -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Product Images</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Primary Image -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Primary Image *</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#042EFF] transition-colors">
                      <svg class="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="mt-2">
                        <label for="primary-image" class="cursor-pointer">
                          <span class="block text-xs font-medium text-gray-900">Upload primary image</span>
                          <span class="block text-xs text-gray-500">Main product view</span>
                        </label>
                        <input 
                          id="primary-image"
                          @change="handleImageUpload($event, 'primaryImage')"
                          type="file" 
                          accept="image/*"
                          class="hidden"
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Secondary Image -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Secondary Image</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#042EFF] transition-colors">
                      <svg class="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="mt-2">
                        <label for="secondary-image" class="cursor-pointer">
                          <span class="block text-xs font-medium text-gray-900">Upload secondary image</span>
                          <span class="block text-xs text-gray-500">Alternative view</span>
                        </label>
                        <input 
                          id="secondary-image"
                          @change="handleImageUpload($event, 'secondaryImage')"
                          type="file" 
                          accept="image/*"
                          class="hidden"
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Tertiary Image -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tertiary Image</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#042EFF] transition-colors">
                      <svg class="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="mt-2">
                        <label for="tertiary-image" class="cursor-pointer">
                          <span class="block text-xs font-medium text-gray-900">Upload tertiary image</span>
                          <span class="block text-xs text-gray-500">Detail view</span>
                        </label>
                        <input 
                          id="tertiary-image"
                          @change="handleImageUpload($event, 'tertiaryImage')"
                          type="file" 
                          accept="image/*"
                          class="hidden"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Specifications -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Specifications</h3>
                <div class="bg-gray-50 rounded-xl p-6">
                  <p class="text-sm text-gray-600 mb-4">Enter specifications based on the selected product category</p>
                  
                  <!-- Phone Specifications -->
                  <div v-if="newProduct.category === 'Phones'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Storage</label>
                      <input v-model="newProduct.specifications.storage" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 256GB">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input v-model="newProduct.specifications.color" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., Natural Titanium">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Display</label>
                      <input v-model="newProduct.specifications.display" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 6.7 Super Retina XDR">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Processor</label>
                      <input v-model="newProduct.specifications.processor" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., A17 Pro chip">
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Camera</label>
                      <input v-model="newProduct.specifications.camera" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 48MP Main + 12MP Ultra Wide">
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Battery</label>
                      <input v-model="newProduct.specifications.battery" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., Up to 29 hours video playback">
                    </div>
                  </div>

                  <!-- Laptop Specifications -->
                  <div v-if="newProduct.category === 'Laptops'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Processor</label>
                      <input v-model="newProduct.specifications.processor" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., Apple M3 chip">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Memory</label>
                      <input v-model="newProduct.specifications.memory" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 16GB unified memory">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Storage</label>
                      <input v-model="newProduct.specifications.storage" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 512GB SSD">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Display</label>
                      <input v-model="newProduct.specifications.display" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 14.2 Liquid Retina XDR">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Battery</label>
                      <input v-model="newProduct.specifications.battery" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., Up to 18 hours">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Ports</label>
                      <input v-model="newProduct.specifications.ports" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 3x Thunderbolt 4, HDMI">
                    </div>
                  </div>

                  <!-- Television Specifications -->
                  <div v-if="newProduct.category === 'Televisions'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Display</label>
                      <input v-model="newProduct.specifications.display" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 65 4K QLED">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                      <input v-model="newProduct.specifications.resolution" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 3840 x 2160">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">HDR</label>
                      <input v-model="newProduct.specifications.hdr" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., HDR10+, Quantum HDR">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Smart TV</label>
                      <input v-model="newProduct.specifications.smartTV" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., Tizen OS with streaming apps">
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Audio</label>
                      <input v-model="newProduct.specifications.audio" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., Dolby Atmos, Object Tracking Sound">
                    </div>
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Connectivity</label>
                      <input v-model="newProduct.specifications.connectivity" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 4x HDMI, 2x USB, Wi-Fi 6">
                    </div>
                  </div>

                  <!-- Smartwatch Specifications -->
                  <div v-if="newProduct.category === 'Smartwatches'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <input v-model="newProduct.specifications.size" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 45mm case">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Display</label>
                      <input v-model="newProduct.specifications.display" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., Always-On Retina LTPO OLED">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Processor</label>
                      <input v-model="newProduct.specifications.processor" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., S9 SiP with 4-core Neural Engine">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Storage</label>
                      <input v-model="newProduct.specifications.storage" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., 64GB">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Battery</label>
                      <input v-model="newProduct.specifications.battery" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., Up to 18 hours">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Features</label>
                      <input v-model="newProduct.specifications.features" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF]" placeholder="e.g., ECG, Blood Oxygen, Temperature sensing">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Description</h3>
                <textarea 
                  v-model="newProduct.description"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                  placeholder="Enter product description (optional)"
                ></textarea>
              </div>

              <!-- Form Actions -->
              <div class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                <button 
                  @click="resetForm"
                  type="button"
                  class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Reset Form
                </button>
                <button 
                  @click="goBack"
                  type="button"
                  class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  :disabled="isSubmitting"
                  class="px-8 py-3 bg-[#042EFF] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                >
                  <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSubmitting ? 'Adding Product...' : 'Add Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </main>
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

/* Form animations */
.grid > div {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced file upload area */
input[type="file"]::-webkit-file-upload-button {
  visibility: hidden;
}

input[type="file"]::before {
  content: 'Select file';
  display: inline-block;
  background: linear-gradient(top, #f9f9f9, #e3e3e3);
  border: thin solid #999;
  border-radius: 3px;
  padding: 5px 8px;
  outline: none;
  white-space: nowrap;
  cursor: pointer;
  text-shadow: 1px 1px #fff;
  font-weight: 700;
  font-size: 10pt;
}

input[type="file"]:hover::before {
  border-color: black;
}

input[type="file"]:active::before {
  background: -webkit-linear-gradient(top, #e3e3e3, #f9f9f9);
}

/* Auto-suggestion dropdown */
.absolute.z-10 {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: dropdownSlide 0.2s ease-out;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Specifications section styling */
.bg-gray-50 {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* Category-specific form animations */
.grid > div {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced focus states */
input:focus, select:focus, textarea:focus {
  transform: scale(1.01);
  transition: all 0.2s ease-in-out;
}

/* Price display enhancement */
.grid input[type="number"] {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

/* Image upload areas */
.border-dashed:hover {
  border-color: #042EFF;
  background-color: #f8fafc;
}

/* Auto-fill notification animation */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
