<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'

const router = useRouter()

// New product form data
const newProduct = reactive({
  name: '',
  brand: '',
  category: 'Phones',
  price: '',
  stock: '',
  lowStockThreshold: '10',
  supplier: '',
  description: '',
  image: null
})

const isSubmitting = ref(false)

const categories = ['Phones', 'Laptops', 'Televisions', 'Smartwatches']
const brands = ['Apple', 'Samsung', 'Dell', 'LG', 'HP', 'Sony', 'Google', 'OnePlus']
const suppliers = ['Apple Inc.', 'Samsung Electronics', 'Dell Technologies', 'LG Electronics', 'HP Inc.', 'Sony Corporation']

const resetForm = () => {
  Object.assign(newProduct, {
    name: '',
    brand: '',
    category: 'Phones',
    price: '',
    stock: '',
    lowStockThreshold: '10',
    supplier: '',
    description: '',
    image: null
  })
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    newProduct.image = file
  }
}

const addProduct = async () => {
  if (!newProduct.name || !newProduct.brand || !newProduct.price || !newProduct.stock) {
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
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      lowStockThreshold: parseInt(newProduct.lowStockThreshold) || 10,
      dateAdded: new Date().toISOString().split('T')[0],
      supplier: newProduct.supplier,
      description: newProduct.description,
      image: newProduct.image
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Back to Stock
              </button>
            </div>
          </div>

          <!-- Form -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <form @submit.prevent="addProduct" class="space-y-8">
              <!-- Basic Information -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input 
                      v-model="newProduct.name"
                      type="text" 
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                      placeholder="Enter product name"
                    >
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
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Price ($) *</label>
                    <input 
                      v-model="newProduct.price"
                      type="number" 
                      min="0"
                      step="0.01"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF] transition-colors"
                      placeholder="0.00"
                    >
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

              <!-- Product Image -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Product Image</h3>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#042EFF] transition-colors">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="mt-4">
                    <label for="image-upload" class="cursor-pointer">
                      <span class="mt-2 block text-sm font-medium text-gray-900">
                        Upload a product image
                      </span>
                      <span class="mt-1 block text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </label>
                    <input 
                      id="image-upload"
                      @change="handleImageUpload"
                      type="file" 
                      accept="image/*"
                      class="hidden"
                    >
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
</style>
