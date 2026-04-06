<script setup>
import { ref, computed, onMounted } from 'vue'
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { useUserStore, useAdminUserStore } from '@/stores/user'
import axiosClient from '@/axiosClient'

const products = ref([])
const isLoadingProducts = ref(false)
const isAddingToCart = ref(false)
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

const normalizeCategory = (value) => String(value || '').trim().toLowerCase()

const getImagePath = (path) => {
  if (!path || typeof path !== 'string') return ''

  const value = path.trim()
  if (!value) return ''

  // Force storage URLs to backend host (http://localhost:8000/storage/...)
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value)
      if (/^\/storage\//i.test(parsed.pathname)) {
        return `${apiBaseUrl}${parsed.pathname}`
      }
      return value
    } catch {
      return value
    }
  }

  const normalized = value.replace(/^\/+/, '')
  if (/^storage\//i.test(normalized)) {
    return `${apiBaseUrl}/${normalized}`
  }
  if (/^(products|product_images)\//i.test(normalized)) {
    return `${apiBaseUrl}/storage/${normalized}`
  }

  return value
}

const getImageUrlFromEntry = (entry) => {
  if (!entry) return ''
  if (typeof entry === 'string') return entry
  if (typeof entry === 'object') {
    return (
      entry.url ||
      entry.path ||
      entry.image_path ||
      entry.file_path ||
      entry.image ||
      entry.image_url ||
      entry.imageUrl ||
      entry.src ||
      ''
    )
  }
  return ''
}

const parseSpecifications = (value) => {
  if (!value) return {}
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  }
  return {}
}

const normalizeProduct = (p, index = 0) => {
  const originalPrice = Number(p.base_price ?? p.originalPrice ?? p.original_price ?? p.price ?? 0)
  const discountRaw = p.discount_price ?? p.discountedPrice ?? p.discounted_price
  const discountedPrice = discountRaw === '' || discountRaw === null || discountRaw === undefined
    ? null
    : Number(discountRaw)
  const price = discountedPrice ?? originalPrice
  const listImages = [
    ...(Array.isArray(p.images) ? p.images : []),
    ...(Array.isArray(p.product_images) ? p.product_images : []),
    ...(Array.isArray(p.gallery) ? p.gallery : [])
  ]

  const imageCandidates = [
    p.primary_image,
    p.primaryImage,
    p.secondary_image,
    p.second_image,
    p.secondaryImage,
    p.tertiary_image,
    p.third_image,
    p.tertiaryImage,
    p.image,
    p.image_url,
    p.imageUrl,
    p.thumbnail,
    ...listImages
  ]

  const images = [...new Set(
    imageCandidates
      .map(getImageUrlFromEntry)
      .filter(Boolean)
      .map(getImagePath)
  )].slice(0, 3)

  const primaryImage = images[0] || ''

  return {
    id: String(p.id ?? p.product_id ?? p.uuid ?? p.slug ?? `product-${index}`),
    category: normalizeCategory(p.category || p.product_category || 'phones'),
    brand: p.brand || 'Unknown',
    name: p.name || p.title || 'Unnamed Product',
    image: primaryImage,
    price,
    oldPrice: discountedPrice !== null ? originalPrice : null,
    rating: Number(p.rating || 5),
    originalPrice,
    discountedPrice,
    description: p.description || '',
    images,
    specifications: parseSpecifications(p.specifications)
  }
}

const fetchProducts = async () => {
  isLoadingProducts.value = true
  try {
    const response = await axiosClient.get('/api/products')
    const payload = response.data
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.products)
          ? payload.products
          : []
    products.value = list.map((item, index) => normalizeProduct(item, index))
  } catch (error) {
    products.value = []
    showToast(error.response?.data?.message || 'Failed to load products', 'error')
  } finally {
    isLoadingProducts.value = false
  }
}

// Category filter state
const selectedCategory = ref('All')
const selectedCategoryKey = computed(() => selectedCategory.value.toLowerCase())
const router = useRouter()
const userStore = useUserStore()
const adminUserStore = useAdminUserStore()

const formatCurrency = (n) => `$${Number(n).toFixed(0)}`

// Brand filter per-category
const selectedBrandByCategory = ref({
  phones: 'All brands',
  laptops: 'All brands',
  smartwatches: 'All brands',
  televisions: 'All brands'
})

const setBrand = (category, label) => {
  selectedBrandByCategory.value[category] = label
}

const getFiltered = (category) => {
  const brandLabel = selectedBrandByCategory.value[category]
  let list = products.value.filter(p => p.category === category)
  if (!brandLabel || brandLabel.toLowerCase() === 'all brands') return list
  const key = brandLabel.toLowerCase()
  return list.filter(p => {
    const brand = (p.brand || '').toLowerCase()
    const name = (p.name || '').toLowerCase()
    if (key === 'redmi') {
      // Allow matching by model name for Redmi even if brand is Xiaomi
      return brand.includes('redmi') || name.includes('redmi')
    }
    return brand === key
  })
}

// Search/autocomplete state
const searchTerm = ref('')
const isSearchOpen = ref(false)
const highlightedIndex = ref(-1)
const searchResults = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return []
  let list = products.value
  if (selectedCategoryKey.value !== 'all') {
    list = list.filter(p => p.category === selectedCategoryKey.value)
  }
  return list
    .filter(p => p.name.toLowerCase().includes(term) || (p.brand && p.brand.toLowerCase().includes(term)))
    .slice(0, 8)
})

const openSearch = () => { isSearchOpen.value = true }
const closeSearch = () => { setTimeout(() => { isSearchOpen.value = false }, 120) }
const moveHighlight = (step) => {
  const len = searchResults.value.length
  if (!len) return
  isSearchOpen.value = true
  const next = highlightedIndex.value + step
  highlightedIndex.value = ((next % len) + len) % len
}
const onEnter = () => {
  const list = searchResults.value
  if (!list.length) return
  const idx = highlightedIndex.value >= 0 ? highlightedIndex.value : 0
  selectSuggestion(list[idx])
}
const selectSuggestion = (p) => {
  // Persist a lightweight snapshot for the detail page
  try { sessionStorage.setItem('selectedProduct', JSON.stringify(p)) } catch {}
  searchTerm.value = p.name
  isSearchOpen.value = false
  router.push({ name: 'product-page', params: { id: p.id } })
}

const gotoProduct = (p) => {
  try { sessionStorage.setItem('selectedProduct', JSON.stringify(p)) } catch {}
  router.push({ name: 'product-page', params: { id: p.id } })
}

// Toast utilities
const toast = ref({ visible: false, message: '', type: 'success' })
let toastTimer
function showToast(message, type = 'success', duration = 2500) {
  toast.value = { visible: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.visible = false
  }, duration)
}
function hideToast() {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value.visible = false
}

// Add to cart: backend handles cart existence check
const addToCart = async (p) => {
  if (isAddingToCart.value) return
  
  const hasClientUser = !!userStore.user && !adminUserStore.adminUser
  if (!hasClientUser) {
    router.push({ path: '/login', query: { returnTo: router.currentRoute.value.fullPath } })
    return
  }

  isAddingToCart.value = true
  try {
    // Make backend request to add product to cart with quantity
    const response = await axiosClient.post(`/api/cart/product/add/${p.id}`, {
      quantity: 1
    })
    if (response.status === 200 || response.status === 201) {
      // Backend request successful
      const raw = sessionStorage.getItem('cartItems')
      const cart = raw ? JSON.parse(raw) : []
      
      // Add to local cart
      const idx = Array.isArray(cart) ? cart.findIndex(it => it.id === p.id) : -1
      if (idx === -1) {
        cart.push({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          oldPrice: p.oldPrice ?? null,
          image: p.image,
          quantity: 1,
        })
        sessionStorage.setItem('cartItems', JSON.stringify(cart))
        
        // Mirror to 'cartproducts'
        try {
          const raw2 = sessionStorage.getItem('cartproducts')
          const cart2 = raw2 ? JSON.parse(raw2) : []
          cart2.push({
            id: p.id,
            name: p.name,
            brand: p.brand,
            price: p.price,
            oldPrice: p.oldPrice ?? null,
            image: p.image,
            quantity: 1,
          })
          sessionStorage.setItem('cartproducts', JSON.stringify(cart2))
        } catch {}
      }
      
      showToast(`${p.name} added to cart`, 'success')
    }
    // Notify header to refresh cart count
    try { window.dispatchEvent(new CustomEvent('cart-updated')) } catch {}
  } catch (error) {
    // Check if error is unauthenticated
    if (error.response?.data?.error === 'unauthenticated') {
      router.push({ path: '/login', query: { returnTo: router.currentRoute.value.fullPath } })
    } else {
      showToast(error.response?.data?.message || 'Failed to add item to cart', 'error')
    }
  } finally {
    isAddingToCart.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
    <Header/>
    <main class="menu-toggle">
      <section class="product-top pt-16 px-[4%] mx-auto lg:max-w-[1500px]">
        <div
        class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
      >
        What we <span class="text-[#68A4FE] px-2">sell</span>
      </div>
        <p v-if="isLoadingProducts" class="text-sm text-gray-600 mt-3">Loading products...</p>
        <p v-else-if="!products.length" class="text-sm text-gray-600 mt-3">No products available right now.</p>
        <div class="product-search flex w-full relative my-4">
          <input
            type="text"
            name="search-term"
            v-model="searchTerm"
            @focus="openSearch"
            @input="openSearch"
            @keydown.esc="isSearchOpen = false"
            @keydown.down.prevent="moveHighlight(1)"
            @keydown.up.prevent="moveHighlight(-1)"
            @keydown.enter.prevent="onEnter()"
            @blur="closeSearch"
            placeholder="Type the name of product"
            class="relative z-50 w-full p-2 sm:p-4 pr-[6rem] sm:pr-32 border-2 border-gray-300 rounded-md outline-none focus:border-[#68A4FE] placeholder:text-sm sm:placeholder:text-base text-sm sm:text-base bg-white dark:bg-white"
          />
          <button
            type="submit"
            class="z-50 text-sm sm:text-base absolute top-1/2 -translate-y-1/2 right-2 bg-[#68A4FE] rounded-md px-4 py-1 sm:py-2 text-white hover:bg-[#384857] transition-all duration-300 ease-in-out capitalize"
          >
            search
          </button>
          <!-- Backdrop overlay to dim the rest of the page when searching -->
          <div
            v-if="isSearchOpen && searchTerm"
            class="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
            aria-hidden="true"
            @click="isSearchOpen = false"
          ></div>
          <!-- Autocomplete dropdown -->
          <div
            v-if="isSearchOpen && searchTerm"
            class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-auto"
          >
            <ul v-if="searchResults.length > 0" class="divide-y divide-gray-100">
              <li
                v-for="(item, idx) in searchResults"
                :key="item.id"
                class="flex items-center gap-3 p-3 cursor-pointer"
                :class="{ 'bg-gray-100': idx === highlightedIndex, 'hover:bg-gray-50': idx !== highlightedIndex }"
                @mousedown.prevent
                @mouseenter="highlightedIndex = idx"
                @click="selectSuggestion(item)"
              >
                <img :src="item.image" :alt="item.name" class="w-10 h-10 object-contain flex-shrink-0" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-medium text-gray-800 truncate capitalize">{{ item.name }}</span>
                    <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(item.price) }}</span>
                  </div>
                  <div class="text-xs text-gray-500 capitalize">Brand: {{ item.brand || '—' }}</div>
                </div>
              </li>
            </ul>
            <div v-else class="p-3 text-sm text-gray-600">No results for "{{ searchTerm }}"</div>
          </div>
        </div>
        <div class="category-shopping flex justify-end items-center">
          <div class="category-input flex gap-2 sm:gap-4 items-center">
            <div class="text-sm sm:text-xl font-semibold capitalize text-[#384857]">
              shop by category:
            </div>
            <select
              name="product-category"
              v-model="selectedCategory"
              class="outline-none border-2 border-gray-300 px-3 sm:px-6 py-1 sm:py-2 rounded-md focus:border-[#68A4FE] text-sm sm:text-base"
            >
              <option value="All">All</option>
              <option value="Phones">Phones</option>
              <option value="Laptops">Laptops</option>
              <option value="Smartwatches">Smartwatches</option>
              <option value="Televisions">Televisions</option>
            </select>
          </div>
        </div>
      </section>
      <!-- The mobile phones section -->
  <section class="phones-section px-[4%] mx-auto lg:max-w-[1500px]" v-show="selectedCategoryKey === 'all' || selectedCategoryKey === 'phones'">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300  text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >mobile phones</div>
        <div class="filter-bar flex justify-between sm:justify-end items-center my-2 sm:my-4">
          <div class="filter-tags space-x-4 capitalize text-xs sm:text-sm">
            <a href="#" @click.prevent="setBrand('phones','All brands')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.phones==='All brands'}" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" @click.prevent="setBrand('phones','Apple')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.phones==='Apple'}" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" @click.prevent="setBrand('phones','Samsung')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.phones==='Samsung'}" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" @click.prevent="setBrand('phones','redmi')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.phones==='redmi'}" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in getFiltered('phones')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs" @click="addToCart(p)" :disabled="isAddingToCart">{{ isAddingToCart ? 'adding...' : 'add to cart' }}</button>
          </div>
        </div>
      </section>
      <!-- The laptops section -->
  <section class="phones-section px-[4%] mx-auto lg:max-w-[1500px]" v-show="selectedCategoryKey === 'all' || selectedCategoryKey === 'laptops'">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >laptops</div>
        <div class="filter-bar flex justify-between sm:justify-end items-center my-2 sm:my-4">
          <div class="filter-tags space-x-4 capitalize text-xs sm:text-sm">
            <a href="#" @click.prevent="setBrand('laptops','All brands')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.laptops==='All brands'}" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" @click.prevent="setBrand('laptops','Apple')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.laptops==='Apple'}" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" @click.prevent="setBrand('laptops','Samsung')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.laptops==='Samsung'}" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" @click.prevent="setBrand('laptops','redmi')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.laptops==='redmi'}" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in getFiltered('laptops')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs" @click="addToCart(p)" :disabled="isAddingToCart">{{ isAddingToCart ? 'adding...' : 'add to cart' }}</button>
          </div>
        </div>
      </section>
      <!-- The smartwatches section -->
  <section class="phones-section px-[4%] mx-auto lg:max-w-[1500px]" v-show="selectedCategoryKey === 'all' || selectedCategoryKey === 'smartwatches'">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >smartwatches</div>
        <div class="filter-bar flex justify-between sm:justify-end items-center my-2 sm:my-4">
          <div class="filter-tags space-x-4 capitalize text-xs sm:text-sm">
            <a href="#" @click.prevent="setBrand('smartwatches','All brands')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.smartwatches==='All brands'}" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" @click.prevent="setBrand('smartwatches','Apple')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.smartwatches==='Apple'}" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" @click.prevent="setBrand('smartwatches','Samsung')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.smartwatches==='Samsung'}" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" @click.prevent="setBrand('smartwatches','redmi')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.smartwatches==='redmi'}" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in getFiltered('smartwatches')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs" @click="addToCart(p)" :disabled="isAddingToCart">{{ isAddingToCart ? 'adding...' : 'add to cart' }}</button>
          </div>
        </div>
      </section>
      <!-- The Televisions section -->
  <section class="phones-section px-[4%] mx-auto lg:max-w-[1500px]" v-show="selectedCategoryKey === 'all' || selectedCategoryKey === 'televisions'">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >televisions</div>
        <div class="filter-bar flex justify-between sm:justify-end items-center my-2 sm:my-4">
          <div class="filter-tags space-x-4 capitalize text-xs sm:text-sm">
            <a href="#" @click.prevent="setBrand('televisions','All brands')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.televisions==='All brands'}" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" @click.prevent="setBrand('televisions','Apple')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.televisions==='Apple'}" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" @click.prevent="setBrand('televisions','Samsung')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.televisions==='Samsung'}" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" @click.prevent="setBrand('televisions','redmi')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.televisions==='redmi'}" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in getFiltered('televisions')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs" @click="addToCart(p)" :disabled="isAddingToCart">{{ isAddingToCart ? 'adding...' : 'add to cart' }}</button>
          </div>
        </div>
      </section>
    </main>
    <!-- Toast (slides near top, below header) -->
    <div
      class="fixed z-50 right-4 top-20 md:top-24 transform transition-all duration-300 ease-out"
      :class="toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
      role="status"
      aria-live="polite"
    >
      <div
        class="min-w-[260px] max-w-[420px] px-4 py-3 rounded-lg shadow-xl text-white border flex items-start gap-3 backdrop-blur-sm"
        :class="{
          'bg-emerald-500/90 border-emerald-300': toast.type === 'success',
          'bg-amber-400/90 border-amber-300 text-black': toast.type === 'warning',
          'bg-red-600/95 border-red-400': toast.type === 'error'
        }"
      >
        <component
          :is="toast.type === 'warning' ? ExclamationTriangleIcon : CheckCircleIcon"
          class="size-6 flex-shrink-0 opacity-95"
        />
        <div class="flex-1 pr-2">
          <p class="text-sm leading-5 font-medium">{{ toast.message }}</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-md/0 p-1 hover:opacity-80 focus:outline-none"
          aria-label="Dismiss notification"
          @click="hideToast"
        >
          <XMarkIcon class="size-5" />
        </button>
      </div>
    </div>
    <Footer/>
</template>
