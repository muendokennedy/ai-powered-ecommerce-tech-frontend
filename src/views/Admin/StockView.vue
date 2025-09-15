<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('All')

// Stock overview by category
const stockOverview = reactive([
  { 
    category: 'Phones', 
    totalProducts: 45, 
    inStock: 1247, 
    lowStock: 5, 
    outOfStock: 2,
    totalValue: 523400,
    color: 'bg-[#042EFF]',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"/>`
  },
  { 
    category: 'Laptops', 
    totalProducts: 32, 
    inStock: 856, 
    lowStock: 3, 
    outOfStock: 1,
    totalValue: 1234500,
    color: 'bg-green-500',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`
  },
  { 
    category: 'Televisions', 
    totalProducts: 18, 
    inStock: 423, 
    lowStock: 2, 
    outOfStock: 0,
    totalValue: 845600,
    color: 'bg-purple-500',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`
  },
  { 
    category: 'Smartwatches', 
    totalProducts: 25, 
    inStock: 634, 
    lowStock: 8, 
    outOfStock: 1,
    totalValue: 287300,
    color: 'bg-yellow-500',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>`
  }
])

// Product inventory data
const products = reactive([
  {
    id: 'PH-001',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Phones',
    sku: 'IPH-15-PM-256',
    price: 1199,
    stock: 85,
    lowStockThreshold: 10,
    status: 'In Stock',
    dateAdded: '2024-08-15',
    supplier: 'Apple Inc.',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=150&h=150&fit=crop&crop=center'
  },
  {
    id: 'PH-002',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Phones',
    sku: 'SAM-S24-U-512',
    price: 1299,
    stock: 5,
    lowStockThreshold: 10,
    status: 'Low Stock',
    dateAdded: '2024-08-10',
    supplier: 'Samsung Electronics',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=150&h=150&fit=crop&crop=center'
  },
  {
    id: 'LP-001',
    name: 'MacBook Pro 14"',
    brand: 'Apple',
    category: 'Laptops',
    sku: 'MBP-14-M3-512',
    price: 2399,
    stock: 42,
    lowStockThreshold: 5,
    status: 'In Stock',
    dateAdded: '2024-08-20',
    supplier: 'Apple Inc.',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=150&h=150&fit=crop&crop=center'
  },
  {
    id: 'LP-002',
    name: 'Dell XPS 13',
    brand: 'Dell',
    category: 'Laptops',
    sku: 'DELL-XPS-13-I7',
    price: 1499,
    stock: 3,
    lowStockThreshold: 5,
    status: 'Low Stock',
    dateAdded: '2024-08-12',
    supplier: 'Dell Technologies',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=150&h=150&fit=crop&crop=center'
  },
  {
    id: 'TV-001',
    name: 'Samsung QLED 65"',
    brand: 'Samsung',
    category: 'Televisions',
    sku: 'SAM-Q65-4K',
    price: 1899,
    stock: 2,
    lowStockThreshold: 3,
    status: 'Low Stock',
    dateAdded: '2024-08-18',
    supplier: 'Samsung Electronics',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=150&h=150&fit=crop&crop=center'
  },
  {
    id: 'TV-002',
    name: 'LG OLED 55"',
    brand: 'LG',
    category: 'Televisions',
    sku: 'LG-OLED-55-C3',
    price: 1599,
    stock: 15,
    lowStockThreshold: 3,
    status: 'In Stock',
    dateAdded: '2024-08-22',
    supplier: 'LG Electronics',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=150&h=150&fit=crop&crop=center'
  },
  {
    id: 'SW-001',
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    category: 'Smartwatches',
    sku: 'AW-S9-45-GPS',
    price: 429,
    stock: 78,
    lowStockThreshold: 15,
    status: 'In Stock',
    dateAdded: '2024-08-25',
    supplier: 'Apple Inc.',
    image: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=150&h=150&fit=crop&crop=center'
  },
  {
    id: 'SW-002',
    name: 'Samsung Galaxy Watch 6',
    brand: 'Samsung',
    category: 'Smartwatches',
    sku: 'SAM-GW6-44-BT',
    price: 329,
    stock: 0,
    lowStockThreshold: 15,
    status: 'Out of Stock',
    dateAdded: '2024-08-14',
    supplier: 'Samsung Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop&crop=center'
  }
])

const categories = ['All', 'Phones', 'Laptops', 'Televisions', 'Smartwatches']

const getStatusColor = (status) => {
  switch (status) {
    case 'In Stock': return 'bg-green-100 text-green-800'
    case 'Low Stock': return 'bg-yellow-100 text-yellow-800'
    case 'Out of Stock': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStockLevel = (stock, threshold) => {
  if (stock === 0) return 'Out of Stock'
  if (stock <= threshold) return 'Low Stock'
  return 'In Stock'
}

const filteredProducts = () => {
  let filtered = products
  
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
}

const navigateToAddProduct = () => {
  router.push('/admin/add-product')
}

const viewProduct = (product) => {
  alert(`Viewing details for: ${product.name}\nStock: ${product.stock}\nPrice: $${product.price}`)
}

const editProduct = (product) => {
  alert(`Editing: ${product.name}`)
}

const deleteProduct = (productId) => {
  if (confirm('Are you sure you want to delete this product?')) {
    const index = products.findIndex(p => p.id === productId)
    if (index > -1) {
      products.splice(index, 1)
    }
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <admin-sidebar></admin-sidebar>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <admin-header ></admin-header>
      
      <!-- Stock Management Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-5xl mx-auto">
          <div class="mb-8">
            <div class="flex items-center justify-between">
              <h1 class="text-3xl font-bold text-gray-900">Stock Management</h1>
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

          <!-- Stock Overview Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              v-for="overview in stockOverview" 
              :key="overview.category"
              class="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div class="flex items-center justify-between mb-4">
                <div :class="[overview.color, 'p-3 rounded-lg']">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-html="overview.icon"></path>
                  </svg>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-900">{{ overview.totalProducts }}</p>
                  <p class="text-sm text-gray-600">Products</p>
                </div>
              </div>
              
              <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ overview.category }}</h3>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Total Stock:</span>
                  <span class="font-medium text-green-600">{{ overview.inStock }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Low Stock:</span>
                  <span class="font-medium text-yellow-600">{{ overview.lowStock }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Out of Stock:</span>
                  <span class="font-medium text-red-600">{{ overview.outOfStock }}</span>
                </div>
                <div class="flex items-center justify-between text-sm pt-2 border-t">
                  <span class="text-gray-600">Total Value:</span>
                  <span class="font-medium text-gray-900">${{ overview.totalValue.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Table -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">Product Inventory</h3>
                
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
                      class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]"
                    >
                  </div>
                  
                  <select 
                    v-model="selectedCategory"
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]"
                  >
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="product in filteredProducts()" :key="product.id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img :src="product.image" :alt="product.name" class="h-12 w-12 rounded-lg object-cover mr-4">
                        <div>
                          <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                          <div class="text-sm text-gray-500">ID: {{ product.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ product.brand }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ product.category }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.sku }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ product.price.toLocaleString() }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ product.stock }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(product.status)]">
                        {{ product.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button @click="viewProduct(product)" class="text-[#042EFF] hover:text-blue-600" title="View Details">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button @click="editProduct(product)" class="text-gray-600 hover:text-gray-800" title="Edit Product">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-800" title="Delete Product">
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

/* Table row hover effect */
.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

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
</style>