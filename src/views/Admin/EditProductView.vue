<script setup>
import { reactive, ref, watch, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'

const route = useRoute()
const router = useRouter()

// Retrieve product passed via sessionStorage (set from StockView before navigation)

const stored = sessionStorage.getItem('editingProduct')

let originalProduct = null

try {
  originalProduct = stored ? JSON.parse(stored) : null
} catch (err) {
  console.log('The data store is  invalid')
}


if (!originalProduct) {
  // If nothing found redirect back
  router.replace({name: 'admin-stock'})
}

// Specification templates reused (could import from a util later)
const specificationTemplates = {
  Phones: { storage: '', ram: '', display: '', processor: '', camera: '', battery: '', color: '' },
  Laptops: { processor: '', memory: '', storage: '', display: '', battery: '', ports: '', weight: '' },
  Televisions: { display: '', resolution: '', hdr: '', smartTV: '', audio: '', connectivity: '' },
  Smartwatches: { size: '', display: '', processor: '', storage: '', battery: '', features: '' }
}

// Reactive form replicating AddProduct but prefilled
const form = reactive({
  id: originalProduct?.id || '',
  name: originalProduct?.name || '',
  brand: originalProduct?.brand || '',
  category: originalProduct?.category || '', // locked
  price: originalProduct?.price || '',
  stock: originalProduct?.stock || '',
  lowStockThreshold: originalProduct?.lowStockThreshold || '',
  supplier: originalProduct?.supplier || '',
  description: originalProduct?.description || '',
  images: Array.isArray(originalProduct?.images) ? [...originalProduct.images] : [],
  specifications: { ...(originalProduct?.specifications || specificationTemplates[originalProduct?.category] || {}) }
})


// Image preview handling (similar to Add view)
const imagePreviews = reactive({
  primaryImage: form.images[0] || null,
  secondaryImage: form.images[1] || null,
  tertiaryImage: form.images[2] || null
})
const dragOver = reactive({ primaryImage: false, secondaryImage: false, tertiaryImage: false })

function handleImageUpload(eventOrFile, slot) {
  let file
  if (eventOrFile instanceof File) {
    file = eventOrFile
  } else if (eventOrFile?.target?.files?.[0]) {
    file = eventOrFile.target.files[0]
  }
  if (!file) return

  const url = URL.createObjectURL(file)
  imagePreviews[slot] = url

  const indexMap = { primaryImage: 0, secondaryImage: 1, tertiaryImage: 2 }
  form.images[indexMap[slot]] = file // store file for later upload
}

function onDragOver(e, slot) {
  e.preventDefault()
  dragOver[slot] = true
}

function onDragLeave(e, slot) {
  e.preventDefault()
  dragOver[slot] = false
}

function onDrop(e, slot) {
  e.preventDefault()
  dragOver[slot] = false
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) {
    handleImageUpload(file, slot)
  }
}

function triggerFileDialog(id) {
  const el = document.getElementById(id)
  if (el) el.click()
}

const isSaving = ref(false)
const saveMessage = ref('')

const specEntries = computed(() => {
  return Object.entries(form.specifications || {})
})

console.log(specEntries.value, form.specifications)

function updateProduct() {
  isSaving.value = true
  // Simulated async request
  setTimeout(() => {
    console.log('Updated product payload:', {
      ...form,
      images: form.images,
      specifications: form.specifications
    })
    saveMessage.value = 'Product updated successfully'
    isSaving.value = false
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  }, 800)
}

function cancelEdit() {
  router.push('/admin/stock')
}

// Lock category: no edits allowed
const categoryLocked = computed(() => {
  return true
})

// Form validation minimal
const isValid = computed(() => {
  return form.name && form.brand && form.price
})

function removeImage(slot) {
  const indexMap = { primaryImage: 0, secondaryImage: 1, tertiaryImage: 2 }
  const idx = indexMap[slot]
  form.images[idx] = null
  imagePreviews[slot] = null
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <admin-sidebar />
    <div class="flex-1 flex flex-col">
      <admin-header />
      <main class="flex-1 overflow-y-auto p-6">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center">Edit Product
                <span class="ml-3 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 uppercase tracking-wide">ID: {{ form.id }}</span>
              </h1>
              <p class="text-sm text-gray-500 mt-1">Modify existing product details. Category is locked.</p>
            </div>
            <div class="flex space-x-3">
              <button @click="cancelEdit" class="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">Back to Stock</button>
              <button :disabled="!isValid || isSaving" @click="updateProduct" class="px-6 py-3 rounded-lg text-sm font-medium flex items-center bg-[#042EFF] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors">
                <svg v-if="!isSaving" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <svg v-else class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"></circle><path class="opacity-75" stroke-width="4" d="M4 12a8 8 0 018-8"/></svg>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>

          <div v-if="saveMessage" class="mb-6 p-4 rounded-lg bg-green-50 text-green-700 text-sm font-medium">{{ saveMessage }}</div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left column -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Basic Info -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input v-model="form.name" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                    <input v-model="form.brand" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]" />
                  </div>
                  <div>
                    <label class="flex text-sm font-medium text-gray-700 mb-2 items-center">Category
                      <span class="ml-2 inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">Locked</span>
                    </label>
                    <div class="relative">
                      <input :value="form.category" disabled class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed" />
                      <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"/></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input v-model.number="form.price" type="number" min="0" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input v-model.number="form.stock" type="number" min="0" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                    <input v-model.number="form.lowStockThreshold" type="number" min="0" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                    <input v-model="form.supplier" type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]" />
                  </div>
                </div>
              </div>

              <!-- Images -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-6">Images</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Primary Image</label>
                    <div @click="triggerFileDialog('edit-primary-image')" @dragover="onDragOver($event, 'primaryImage')" @dragleave="onDragLeave($event, 'primaryImage')" @drop="onDrop($event, 'primaryImage')" :class="['relative group border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer', dragOver.primaryImage ? 'border-[#042EFF] bg-[#042EFF]/5' : 'border-gray-300 hover:border-[#042EFF]', imagePreviews.primaryImage ? 'p-2' : 'p-6']">
                      <template v-if="imagePreviews.primaryImage">
                        <img :src="imagePreviews.primaryImage" class="mx-auto max-h-40 object-contain rounded" />
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium rounded transition-opacity">Replace</div>
                        <button @click.stop="removeImage('primaryImage')" class="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80" title="Remove"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                      </template>
                      <template v-else>
                        <svg class="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        <div class="mt-2">
                          <span class="block text-xs font-medium text-gray-900">Drag & Drop or Click</span>
                          <span class="block text-xs text-gray-500">Primary (Hero)</span>
                        </div>
                      </template>
                      <input id="edit-primary-image" type="file" class="hidden" accept="image/*" @change="handleImageUpload($event,'primaryImage')" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Secondary Image</label>
                    <div @click="triggerFileDialog('edit-secondary-image')" @dragover="onDragOver($event, 'secondaryImage')" @dragleave="onDragLeave($event, 'secondaryImage')" @drop="onDrop($event, 'secondaryImage')" :class="['relative group border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer', dragOver.secondaryImage ? 'border-[#042EFF] bg-[#042EFF]/5' : 'border-gray-300 hover:border-[#042EFF]', imagePreviews.secondaryImage ? 'p-2' : 'p-6']">
                      <template v-if="imagePreviews.secondaryImage">
                        <img :src="imagePreviews.secondaryImage" class="mx-auto max-h-40 object-contain rounded" />
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium rounded transition-opacity">Replace</div>
                        <button @click.stop="removeImage('secondaryImage')" class="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80" title="Remove"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                      </template>
                      <template v-else>
                        <svg class="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        <div class="mt-2">
                          <span class="block text-xs font-medium text-gray-900">Drag & Drop or Click</span>
                          <span class="block text-xs text-gray-500">Secondary (Angle)</span>
                        </div>
                      </template>
                      <input id="edit-secondary-image" type="file" class="hidden" accept="image/*" @change="handleImageUpload($event,'secondaryImage')" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tertiary Image</label>
                    <div @click="triggerFileDialog('edit-tertiary-image')" @dragover="onDragOver($event, 'tertiaryImage')" @dragleave="onDragLeave($event, 'tertiaryImage')" @drop="onDrop($event, 'tertiaryImage')" :class="['relative group border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer', dragOver.tertiaryImage ? 'border-[#042EFF] bg-[#042EFF]/5' : 'border-gray-300 hover:border-[#042EFF]', imagePreviews.tertiaryImage ? 'p-2' : 'p-6']">
                      <template v-if="imagePreviews.tertiaryImage">
                        <img :src="imagePreviews.tertiaryImage" class="mx-auto max-h-40 object-contain rounded" />
                        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium rounded transition-opacity">Replace</div>
                        <button @click.stop="removeImage('tertiaryImage')" class="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80" title="Remove"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                      </template>
                      <template v-else>
                        <svg class="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        <div class="mt-2">
                          <span class="block text-xs font-medium text-gray-900">Drag & Drop or Click</span>
                          <span class="block text-xs text-gray-500">Tertiary (Detail)</span>
                        </div>
                      </template>
                      <input id="edit-tertiary-image" type="file" class="hidden" accept="image/*" @change="handleImageUpload($event,'tertiaryImage')" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                <textarea v-model="form.description" rows="5" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#042EFF] focus:border-[#042EFF]"></textarea>
              </div>
            </div>

            <!-- Right column -->
            <div class="space-y-8">
              <!-- Specifications -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">Specifications
                  <span class="ml-2 text-[10px] uppercase tracking-wide text-gray-400 font-medium">(Edit Inline)</span>
                </h2>
                <div v-if="specEntries.length" class="space-y-4">
                  <div v-for="([key]) in specEntries" :key="key" class="grid grid-cols-5 gap-3 items-center group">
                    <div class="col-span-2 text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {{ key.replace(/([A-Z])/g,' $1').trim() }}
                    </div>
                    <div class="col-span-3">
                      <input v-model="form.specifications[key]" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#042EFF] focus:border-[#042EFF] text-sm" />
                    </div>
                  </div>
                </div>
                <div v-else class="text-xs text-gray-500">No specifications present.</div>
              </div>

              <!-- Metadata / Quick Info -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Meta</h2>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500">Original Added</p>
                    <p class="font-medium">{{ originalProduct?.dateAdded || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">SKU</p>
                    <p class="font-medium">{{ originalProduct?.sku || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Category</p>
                    <p class="font-medium">{{ form.category }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Status</p>
                    <p class="font-medium">{{ originalProduct?.status || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Danger / Actions -->
              <div class="bg-white rounded-xl shadow-sm border border-red-100 p-6">
                <h2 class="text-lg font-semibold text-red-700 mb-4">Danger Zone</h2>
                <button class="w-full py-3 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Archive Product</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
</style>
