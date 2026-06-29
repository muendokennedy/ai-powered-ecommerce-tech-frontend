<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ChevronRightIcon, ChevronLeftIcon, StarIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useUserStore, useAdminUserStore } from '@/stores/user'
import axiosClient from '@/axiosClient'

const products = ref([])
const topSalesProducts = ref([])
const newArrivalsProducts = ref([])
const isLoadingProducts = ref(false)
const addingToCartIds = ref(new Set())
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
    return (entry.image_path || '')
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

const normalizeProduct = (p) => {
  const originalPrice = Number(p.base_price ?? 0)
  const discountRaw = p.discount_price
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
    id: String(p.id),
    category: normalizeCategory(p.category),
    brand: p.brand,
    name: p.name,
    image: primaryImage,
    price,
    oldPrice: discountedPrice !== null ? originalPrice : null,
    description: p.description || '',
    images,
    specifications: parseSpecifications(p.specifications)
  }
}


  const fetchProducts = async () => {
  isLoadingProducts.value = true
  try {
    const response = await axiosClient.get('/api/index')
    const payload = response.data

    const topSalesProductsList = payload.topSales
    const newArrivalsProductsList = payload.newArrivals
  
    topSalesProducts.value = topSalesProductsList.map((item, index) => normalizeProduct(item, index))
    newArrivalsProducts.value = newArrivalsProductsList.map((item, index) => normalizeProduct(item, index))

  } catch (error) {
    topSalesProducts.value = []
    newArrivalsProducts.value = []
    
  } finally {
    isLoadingProducts.value = false
  }
}

console.log('products ', topSalesProducts.value)

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


// Hero slider products: Dell Latitude 5320, Redmi Note 12, iPhone 14
const heroSlides = computed(() => {
  const order = ['dell latitude 5320','redmi note 12','iphone 14']
  return order.map((name, idx) => {
    const prod = products.value.find(p => (p.name || '').toLowerCase() === name)
    if (!prod) return null
    return {
      title: 'Mobile Ready',
      productName: prod.name,
      description: prod.description,
      image: prod.image,
      bgColor: 'bg-[#536474]',
      product: prod
    }
  }).filter(Boolean)
})

const currentIndex = ref(0)
const next = () => { currentIndex.value = (currentIndex.value + 1) % heroSlides.value.length }
const prev = () => { currentIndex.value = (currentIndex.value - 1 + heroSlides.value.length) % heroSlides.value.length }
const startAutoPlay = () => { setInterval(() => { next() }, 3000) }
onMounted(() => { startAutoPlay() })

// Derived lists for sections
const topSales = computed(() => products.value.slice(0, 6))
const specialOffers = computed(() => products.value.slice(6, 12))
// Brand filter for Special Offers (same behavior as ProductsView)
const selectedOfferBrand = ref('All brands')
const filterByBrand = (list, label) => {
  const brandLabel = (label || '').toLowerCase()
  if (!brandLabel || brandLabel === 'all brands') return list
  return list.filter(p => {
    const brand = (p.brand || '').toLowerCase()
    const name = (p.name || '').toLowerCase()
    if (brandLabel === 'redmi') {
      return brand.includes('redmi') || name.includes('redmi')
    }
    return brand === brandLabel
  })
}
const specialOffersFiltered = computed(() => filterByBrand(specialOffers.value, selectedOfferBrand.value))
const setOfferBrand = (label) => { selectedOfferBrand.value = label }
const newArrivals = computed(() => products.value.slice(12, 17))

// Promo products (for clickable offer boxes)
const promoRedmiProduct = computed(() =>
  products.value.find(p => (p.name || '').toLowerCase().includes('redmi note 12'))
)
const promoDellProduct = computed(() =>
  products.value.find(p => (p.name || '').toLowerCase().includes('dell inspiron'))
)

// Navigation to product page (same pattern as ProductsView.vue)
const router = useRouter()
const userStore = useUserStore()
const adminUserStore = useAdminUserStore()

const formatCurrency = (n) => {
  const num = Number(n)
  return `KSH ${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

const shopSlide = (slide) => { if (slide?.product) gotoProduct(slide.product) }

// Add to cart (identical logic to ProductsView)
const addToCart = async (p) => {
  // Check if this specific product is already being added
  if (addingToCartIds.value.has(p.id)) return
  
  const hasClientUser = !!userStore.user && !adminUserStore.adminUser
  if (!hasClientUser) {
    router.push({ path: '/login', query: { returnTo: router.currentRoute.value.fullPath } })
    return
  }

  // Mark this product as being added
  addingToCartIds.value.add(p.id)
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
      }
      
      showToast(`${p.name} added to cart`, 'success')
    }
    // Notify header to refresh cart count
    try { window.dispatchEvent(new CustomEvent('cart-updated')) } catch {}
  } catch (error) {
    // Check if error is unauthenticated
    if (error.response?.data?.error === 'unauthenticated') {
      router.push({ path: '/login', query: { returnTo: router.currentRoute.value.fullPath } })
    } else if (error.response?.data?.error === 'duplicate_quantity') {
      // Show warning for duplicate quantity
      showToast(error.response?.data?.message || 'Product is already added in the cart with the same quantity.', 'warning')
    } else {
      showToast(error.response?.data?.message || 'Failed to add item to cart', 'error')
    }
  } finally {
    // Remove this product from the adding set
    addingToCartIds.value.delete(p.id)
  }
}


onMounted(() => {
  fetchProducts()
})

</script>

<template>
    <Header/>
    <main  class="scroll-pt-32 menu-toggle">
      <!-- The landing page home page section -->
    <div class="carousel-container relative overflow-hidden">
    <!-- Slides -->
    <div
      class="slides flex transition-transform duration-500">
      <section
        v-for="(slide, index) in heroSlides"
        :key="index"
        class="slide home min-h-screen w-full px-[6%] sm:px-[4%] md:pl-[4%] mx-auto scroll-mt-[100px]  flex-col-reverse relative md:flex-row pb-16 md:pb-4"
        :class="[slide.bgColor, {'active': currentIndex === index, '': currentIndex !== index}]"
      >
        <div class="slide-content basis-2/4 flex justify-center items-start flex-col">
          <h3 class="text-lg sm:text-xl font-semibold text-white capitalize sm:my-4 my-1">
            {{ slide.title }}
          </h3>
          <h1 class="text-2xl sm:text-3xl text-white font-semibold my-2 sm:my-4">
            {{ slide.productName }}
          </h1>
          <div class="hero-description text-sm sm:text-lg font-normal text-white mb-6">
            {{ slide.description }}
          </div>
          <button @click="shopSlide(slide)" class="shop-btn text-white text-base sm:text-lg font-semibold bg-[#68A4FE] py-2 sm:py-4 px-8 sm:px-11 rounded-md capitalize cursor-pointer hover:bg-[#3b81eb] transition-all
           duration-300 ease-in-out" aria-label="Shop now: view product details">
            shop now
          </button>
          <span class="text-white my-4 block">up to 50% off</span>
        </div>
        <div class="home-1 slide-image basis-2/4 flex justify-center items-center scale-[0.6] md:scale-100 pt-10"
        :class="currentIndex === 0 ? 'home-1' : currentIndex === 1 ? 'home-2' : 'home-3'">
            <div class="hero-image">
                <img :src="slide.image" alt="Slide image" />
            </div>
        </div>
        <!-- Progress Indicators -->
        <div class="progress-container absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4">
          <div
            v-for="(slide, index) in heroSlides"
            :key="index"
            class="progress-bar h-3 w-10 sm:w-20 rounded-md"
            :class="currentIndex === index ? 'bg-[#68A4FE]' : 'bg-white'"
          ></div>
        </div>
        <!-- Navigation Buttons -->
        <div @click="prev" id="prev" class="flex items-center justify-center prev absolute left-0 cursor-pointer">
          <ChevronLeftIcon class="size-8 font-extrabold" />
        </div>
        <div @click="next" id="next" class="next flex items-center justify-center absolute right-0 cursor-pointer">
          <ChevronRightIcon class="size-8 font-extrabold" />
        </div>
      </section>
    </div>


  </div>

      <!-- The top sales section -->
      <section class="top-sales pt-16 px-[4%] mx-auto lg:max-w-[1500px]">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4"
        >
          Top<span class="text-[#68A4FE] px-2">Sales</span>
        </div>
          <div v-if="isLoadingProducts" class="top-sales-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto w-[95%] max-w-6xl gap-3">
            <div v-for="i in 6" :key="`top-skel-${i}`" class="product-box group bg-white rounded-lg shadow-md transition-all duration-300 border border-gray-200 overflow-hidden my-2 sm:my-4 py-4 px-3">
              <div class="relative flex justify-center items-center overflow-hidden bg-white h-40 rounded-lg mb-3">
                <div class="h-full w-full bg-gray-200 skeleton-shimmer rounded"></div>
              </div>
              <div class="h-4 bg-gray-200 skeleton-shimmer rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-200 skeleton-shimmer rounded w-1/2 mb-3"></div>
              <div class="h-8 bg-gray-200 skeleton-shimmer rounded w-full"></div>
            </div>
          </div>
          <div v-else class="top-sales-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto w-[95%] max-w-6xl gap-3">
          <div v-for="p in topSalesProducts" :key="p.id" class="product-box group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 border border-gray-200 overflow-hidden my-2 sm:my-4 py-4 px-3">
            <div class="relative flex justify-center items-center overflow-hidden bg-white h-40 rounded-lg mb-3">
              <div class="product-image cursor-pointer transform group-hover:scale-110 transition-transform duration-300" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" class="h-full scale-150 object-cover" />
              </div>
              <div class="absolute top-2 right-2 bg-[#68A4FE] text-white px-2 py-1 rounded text-xs font-semibold" v-if="p.oldPrice && p.price < p.oldPrice">
                -{{ Math.round((1 - p.price / p.oldPrice) * 100) }}%
              </div>
            </div>
            <div class="product-title text-sm font-semibold capitalize cursor-pointer hover:text-[#68A4FE] line-clamp-2 mb-2 text-gray-800" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="brand-text text-xs text-gray-500 mb-2 font-medium">{{ p.brand }}</div>
            <div class="star-box text-center text-sm text-[#FFCF10] mb-3 flex justify-center gap-1">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star text-[#FFCF10]"></i>
            </div>
            <div class="price-section bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-2 mb-3">
              <div v-if="p.oldPrice && p.price < p.oldPrice" class="deal-price text-xs text-gray-500 font-semibold line-through mb-1">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price text-lg font-bold text-[#FF412C]">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn w-full bg-gradient-to-r from-[#68A4FE] to-[#4A90D9] hover:from-[#4A90D9] hover:to-[#356BA8] text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 ease-in-out text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95" @click="addToCart(p)" :disabled="addingToCartIds.has(p.id)">{{ addingToCartIds.has(p.id) ? 'adding...' : 'add to cart' }}</button>
          </div>
        </div>
      </section>
      <!-- The products on offer section -->
      <section class="top-sales px-[4%] mx-auto lg:max-w-[1500px]">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >
          on<span class="text-[#68A4FE] px-2">special</span> offer
        </div>
        <div v-if="isLoadingProducts" class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="i in 3" :key="`offer-skel-${i}`" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="h-40 bg-gray-200 skeleton-shimmer mb-3 rounded"></div>
            <div class="h-4 bg-gray-200 skeleton-shimmer rounded w-3/4 mx-auto mb-2"></div>
            <div class="h-3 bg-gray-200 skeleton-shimmer rounded w-1/2 mx-auto mb-2"></div>
            <div class="h-8 bg-gray-200 skeleton-shimmer rounded w-2/3 mx-auto"></div>
          </div>
        </div>
        <div v-else class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in specialOffersFiltered" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <StarIcon class="inline size-4 sm:size-5 text-[#FFCF10]" v-for="i in p.rating" :key="i" />
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs" @click="addToCart(p)">add to cart</button>
          </div>
        </div>
        <div class="offer-container flex my-4 sm:my-8 gap-6 flex-col sm:flex-row">
          <div
            class="offer-box bg-[#ECEEEF] flex flex-col md:flex-row gap-1 md:gap-2 items-center basis-[48%] py-4 px-4 md:p-2 cursor-pointer hover:shadow-lg transition"
            role="button" tabindex="0"
            @click="promoRedmiProduct && gotoProduct(promoRedmiProduct)"
            @keydown.enter.prevent="promoRedmiProduct && gotoProduct(promoRedmiProduct)"
            @keydown.space.prevent="promoRedmiProduct && gotoProduct(promoRedmiProduct)"
            aria-label="View Redmi Note 12 product details"
          >
            <div class="basis-[48%] px-3 sm:px-0">
              <img src="../../assets/images/redmi note 12.png" alt="A product on offer" class=" scale-50 object-cover md:scale-100"/>
            </div>
            <div class="content">
              <div class="content-head font-bold capitalize">
                <span class="pr-2 text-[#68A4FE] text-sm sm:text-base">50% discount</span>Plus free
                shipping
              </div>
              <div class="basis-[48%] content-head text-xs sm:text-sm">
                This applies to all new releases of Xiaomi Redmi 10 for a
                limited amount of time
              </div>
            </div>
          </div>
          <div
            class="offer-box bg-[#ECEEEF] flex flex-col md:flex-row gap-1 md:gap-2 items-center basis-[48%] py-4 px-4 md:p-2 cursor-pointer hover:shadow-lg transition"
            role="button" tabindex="0"
            @click="promoDellProduct && gotoProduct(promoDellProduct)"
            @keydown.enter.prevent="promoDellProduct && gotoProduct(promoDellProduct)"
            @keydown.space.prevent="promoDellProduct && gotoProduct(promoDellProduct)"
            aria-label="View Dell Inspiron product details"
          >
            <div class="basis-[48%] px-3 sm:px-0">
              <img src="../../assets/images/dell inspiron.png" alt="A product on offer" class=" scale-50 object-cover md:scale-100"/>
            </div>
            <div class="content">
              <div class="content-head font-bold capitalize">
                <span class="pr-2 text-[#68A4FE] text-sm sm:text-base">50% discount</span>Plus free
                gift
              </div>
              <div class="basis-[48%] content-head text-xs sm:text-sm">
                This applies to all new releases of Dell inspiron laptops
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- The new arrivals section -->
      <section class="top-sales px-[4%] mx-auto lg:max-w-[1500px]">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4"
        >
          New<span class="text-[#68A4FE] px-2">Arrivals</span>
        </div>

            <div v-if="isLoadingProducts" class="top-sales-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto w-[95%] max-w-6xl gap-3">
              <div v-for="i in 6" :key="`new-skel-${i}`" class="product-box group bg-white rounded-lg shadow-md transition-all duration-300 border border-gray-200 overflow-hidden my-2 sm:my-4 py-4 px-3">
                <div class="relative flex justify-center items-center overflow-hidden bg-white h-40 rounded-lg mb-3">
                  <div class="h-full w-full bg-gray-200 skeleton-shimmer rounded"></div>
                </div>
                <div class="h-4 bg-gray-200 skeleton-shimmer rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-200 skeleton-shimmer rounded w-1/2 mb-3"></div>
                <div class="h-8 bg-gray-200 skeleton-shimmer rounded w-full"></div>
              </div>
            </div>
            <div v-else class="top-sales-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto w-[95%] max-w-6xl gap-3">
          <div v-for="p in newArrivalsProducts" :key="p.id" class="product-box group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 border border-gray-200 overflow-hidden my-2 sm:my-4 py-4 px-3">
            <div class="relative flex justify-center items-center overflow-hidden bg-white h-40 rounded-lg mb-3">
              <div class="product-image cursor-pointer transform group-hover:scale-110 transition-transform duration-300" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" class="h-full scale-150 object-cover" />
              </div>
              <div class="absolute top-2 right-2 bg-[#68A4FE] text-white px-2 py-1 rounded text-xs font-semibold" v-if="p.oldPrice && p.price < p.oldPrice">
                -{{ Math.round((1 - p.price / p.oldPrice) * 100) }}%
              </div>
            </div>
            <div class="product-title text-sm font-semibold capitalize cursor-pointer hover:text-[#68A4FE] line-clamp-2 mb-2 text-gray-800" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="brand-text text-xs text-gray-500 mb-2 font-medium">{{ p.brand }}</div>
            <div class="star-box text-center text-sm text-[#FFCF10] mb-3 flex justify-center gap-1">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star text-[#FFCF10]"></i>
            </div>
            <div class="price-section bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-2 mb-3">
              <div v-if="p.oldPrice && p.price < p.oldPrice" class="deal-price text-xs text-gray-500 font-semibold line-through mb-1">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price text-lg font-bold text-[#FF412C]">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn w-full bg-gradient-to-r from-[#68A4FE] to-[#4A90D9] hover:from-[#4A90D9] hover:to-[#356BA8] text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 ease-in-out text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95" @click="addToCart(p)" :disabled="addingToCartIds.has(p.id)">{{ addingToCartIds.has(p.id) ? 'adding...' : 'add to cart' }}</button>
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

<style scoped>
.carousel-container {
  width: 100%;
  position: relative;
}

/* .slides {
  display: flex;
  width: 300%;
} */

.slide {
  flex: 1 0 100%;
}

/* .prev,
.next {
  font-size: 2rem;
  color: white;
}

.progress-bar {
  height: 3px;
  width: 40px;
  margin-right: 4px;
} */
 
  #prev,
  #next {
    position: absolute;
    height: 3.125rem;
    width: 3.125rem;
    line-height: 3.125rem;
    text-align: center;
    top: 90%;
    transform: translateY(-90%);
    color: #fff;
    font-size: 2.5rem;
    cursor: pointer;
    font-weight: 400;
    background: #384857;
    border-radius: 0.375rem;
  }
  #prev {
    left: 1.25rem;
  }
  #next {
    right: 1.25rem;
  }

  @media only screen and (max-width: 768px) {
    #prev,
    #next {
      top: 30%;
      transform: translateY(-30%);
      height: 2.5rem;
      width: 2.5rem;
      line-height: 2.5rem;
    }
  }

.skeleton-shimmer{
  position: relative;
  overflow: hidden;
}
.skeleton-shimmer::after{
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite
}

@keyframes shimmer{
  100%{
    left: 150%;
  }

}
</style>

