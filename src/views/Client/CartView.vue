<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { PlusIcon, MinusIcon, StarIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/solid'
import { useUserStore, useAdminUserStore } from '@/stores/user'
import axiosClient from '@/axiosClient'

const router = useRouter()
const userStore = useUserStore()
const adminUserStore = useAdminUserStore()

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

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

const resolveImg = (path) => {
  if(!path || typeof path !== 'string'){
    return ''
  }

  const cleaned = path.trim()

  if(/^https?:\/\//i.test(cleaned)){
    return cleaned
  }

  const normalized = cleaned.replace(/^\/+/, '')

  return `${apiBaseUrl}/storage/${normalized}`
}

// A cart action is allowed only for a normal user session, never an admin session.
const isLoggedIn = computed(() => !!userStore.user && !adminUserStore.adminUser)

// Reactive cart and wishlist loaded from sessionStorage
const cartItems = ref([])
const wishlistItems = ref([])
const isLoadingCart = ref(false)
const relatedProducts = ref([])
const isLoadingRelated = ref(false)

// Hide recommendations if both cart and wishlist are empty
const showRecommendations = computed(() => {
  return cartItems.value.length > 0 || wishlistItems.value.length > 0
})

const fetchRelatedProducts = async () => {
  isLoadingRelated.value = true
  try {
    const response = await axiosClient.get('/api/cart/related-products')
    const raw = response.data.related_products || []
    // Normalize each related product so the template can use `rp.image`, `rp.price`, `rp.oldPrice`, etc.
    relatedProducts.value = raw.map(p => {
      const imgs = Array.isArray(p.images) ? p.images : []
      const primary = imgs.find(i => i.image_type === 'primary') || null
      const imagePath = primary ? primary.image_path || primary : (p.image || '')
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        // keep raw path here; template calls `resolveImg(rp.image)`
        image: imagePath,
        images: imgs.map(i => i.image_path),
        // normalize prices to numbers used by template helpers
        price: Number(p.discount_price ?? p.discountPrice ?? p.price) || 0,
        oldPrice: Number(p.base_price ?? p.old_price ?? p.oldPrice) || null,
        rating: p.rating ?? 5,
      }
    })
  } catch (error) {
    relatedProducts.value = []
    showToast(error.response?.data?.message, 'error')
  } finally {
    isLoadingRelated.value = false
  }
}

function loadCart() {
  isLoadingCart.value = true
  try {
    axiosClient.post('/api/cart/products')
      .then(response => {
        const payload = response.data
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.cartItems)
                ? payload.cartItems
                : []
        
        // Ensure quantity and basic fields
        cartItems.value = list.map(it => ({
          id: it.cart_item_id || it.id || it.product_id,
          productId: it.product_id,
          name: it.name,
          brand: it.brand,
          price: Number(it.discount_price || it.price) || 0,
          oldPrice: it.oldPrice ?? null,
          image: getImagePath(it.image),
          quantity: Number(it.quantity) > 0 ? Number(it.quantity) : 1,
        }))
        // Persist loaded cart and notify other components (Header)
        try { saveCart() } catch {}
        try { window.dispatchEvent(new CustomEvent('cart-loaded', { detail: { items: cartItems.value } })) } catch {}
        // Fetch related products after cart loads
        fetchRelatedProducts()
      })
      .catch(error => {
        console.error('Failed to load cart:', error)
        cartItems.value = []
        showToast(error.response?.data?.message || 'Failed to load cart', 'error')
        // Still fetch related products even if cart fails
        fetchRelatedProducts()
      })
      .finally(() => {
        isLoadingCart.value = false
      })
  } catch (error) {
    console.error('Error loading cart:', error)
    cartItems.value = []
    isLoadingCart.value = false
    // Still fetch related products even if cart fails
    fetchRelatedProducts()
  }
}

function saveCart() {
  try { sessionStorage.setItem('cartItems', JSON.stringify(cartItems.value)) } catch {}
  try { window.dispatchEvent(new CustomEvent('cart-updated')) } catch {}
}

onMounted(() => {
  loadCart()
  loadWishlist()
})

const itemCount = computed(() => cartItems.value.reduce((sum, it) => sum + (it.quantity || 0), 0))
const subtotal = computed(() => cartItems.value.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0))
const formatCurrency = (n) => {
  const num = Number(n);
  return `KSH ${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

function increment(it) {
  axiosClient.post(`/api/cart/items/${it.id}/update-quantity`, {
    quantity: 1,
    action: 'increment'
  })
    .then(response => {
      it.quantity = (it.quantity || 1) + 1
      saveCart()
      showToast(response.data?.message || `${it.name} quantity updated`, 'success')
    })
    .catch(error => {
      showToast(error.response?.data?.message || 'Failed to update quantity', 'error')
    })
}

function decrement(it) {
  const currentQuantity = it.quantity || 1
  // Don't go below 1
  if (currentQuantity > 1) {
    axiosClient.post(`/api/cart/items/${it.id}/update-quantity`, {
      quantity: 1,
      action: 'decrement'
    })
      .then(response => {
        it.quantity = currentQuantity - 1
        saveCart()
        showToast(response.data?.message || `${it.name} quantity updated`, 'success')
      })
      .catch(error => {
        showToast(error.response?.data?.message || 'Failed to update quantity', 'error')
      })
  }
}

function updateQuantityOnEnter(it) {
  const newQuantity = it.quantity || 1
  if (newQuantity < 1) {
    it.quantity = 1
    return
  }
  axiosClient.post(`/api/cart/items/${it.id}/update-quantity`, {
    quantity: newQuantity,
    action: null
  })
    .then(response => {
      saveCart()
      showToast(response.data?.message || `${it.name} quantity updated`, 'success')
    })
    .catch(error => {
      showToast(error.response?.data?.message || 'Failed to update quantity', 'error')
    })
}

function removeItem(it) {
  axiosClient.delete(`/api/cart/items/${it.id}`)
    .then(response => {
      cartItems.value = cartItems.value.filter(x => x.id !== it.id)
      saveCart()
      showToast(response.data?.message || `${it.name} removed from cart`, 'success')
      try { window.dispatchEvent(new CustomEvent('cart-updated')) } catch {}
    })
    .catch(error => {
      showToast(error.response?.data?.message || 'Failed to remove item from cart', 'error')
    })
}

function loadWishlist() {
  try {
    const raw = sessionStorage.getItem('wishlistItems')
    const parsed = raw ? JSON.parse(raw) : []
    wishlistItems.value = Array.isArray(parsed)
      ? parsed.map(it => ({
          id: it.id,
          name: it.name,
          brand: it.brand,
          price: Number(it.price) || 0,
          oldPrice: it.oldPrice ?? null,
          image: it.image,
        }))
      : []
  } catch {
    wishlistItems.value = []
  }
}

function saveWishlist() {
  try { sessionStorage.setItem('wishlistItems', JSON.stringify(wishlistItems.value)) } catch {}
}

function requireLoginForCartAction() {
  if (!isLoggedIn.value) {
    router.push({ path: '/login', query: { returnTo: router.currentRoute.value.fullPath } })
    return true
  }
  return false
}

function saveForLater(it) {
  // Move from cart to wishlist
  // Remove from cart
  cartItems.value = cartItems.value.filter(x => x.id !== it.id)
  saveCart()
  // Add to wishlist if not present
  const idx = wishlistItems.value.findIndex(x => x.id === it.id)
  if (idx === -1) {
    wishlistItems.value.push({
      id: it.id,
      name: it.name,
      brand: it.brand,
      price: it.price,
      oldPrice: it.oldPrice ?? null,
      image: it.image,
    })
    saveWishlist()
    showToast(`${it.name} saved for later`, 'success')
  } else {
    showToast(`${it.name} is already in your wishlist`, 'warning')
  }
}

function wishlistRemove(it) {
  wishlistItems.value = wishlistItems.value.filter(x => x.id !== it.id)
  saveWishlist()
}

function wishlistAddToCart(it) {
  if (requireLoginForCartAction()) return
  // Add to cart (no duplicate increment)
  const idx = cartItems.value.findIndex(x => x.id === it.id)
  if (idx === -1) {
    cartItems.value.push({
      id: it.id,
      name: it.name,
      brand: it.brand,
      price: it.price,
      oldPrice: it.oldPrice ?? null,
      image: it.image,
      quantity: 1,
    })
    showToast(`${it.name} added to cart`, 'success')
  } else {
    showToast(`${it.name} is already in the cart`, 'warning')
  }
  saveCart()
  // Remove from wishlist
  wishlistRemove(it)
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

// Quick add to cart from recommendations (no duplicate increment)
function addToCartQuick(it) {
  if (requireLoginForCartAction()) return
  const idx = cartItems.value.findIndex(x => x.id === it.id)
  if (idx >= 0) {
    showToast(`${it.name} is already in the cart`, 'warning')
    return
  }
  {
    cartItems.value.push({
      id: it.id,
      name: it.name,
      brand: it.brand,
      price: it.price,
      oldPrice: it.oldPrice ?? null,
      image: it.image,
      quantity: 1,
    })
  }
  saveCart()
  showToast(`${it.name} added to cart`, 'success')
}

// Method to handle proceed to checkout
const proceedToCheckout = () => {
  if (!isLoggedIn.value) {
    // Redirect to login page with return URL
    router.push({ path: '/login', query: { returnTo: '/checkout' } })
  } else {
    // Redirect directly to checkout
    router.push('/checkout')
  }
}
</script>
<template>
    <Header/>
    <main class="menu-toggle">
      <section class="shopping-cart mx-auto pt-16 px-[4%] lg:max-w-[1500px]">
        <div
        class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
      >
        shopping<span class="text-[#68A4FE] px-2"> cart</span>
      </div>
      <div class="cart-section flex flex-col lg:flex-row justify-between w-full gap-6">
        <div class="shopping-cart-container text-[#384857] w-full lg:w-3/5">
          <!-- Loading Skeleton -->
          <div v-if="isLoadingCart" class="space-y-2 sm:space-y-3">
            <div v-for="i in 3" :key="`skeleton-${i}`" class="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm animate-pulse">
              <!-- Image Skeleton -->
              <div class="w-24 h-20 sm:w-40 sm:h-32 rounded-md bg-gray-200 skeleton-shimmer"></div>
              <!-- Info Skeleton -->
              <div class="flex-1 space-y-2">
                <div class="h-4 sm:h-5 bg-gray-200 skeleton-shimmer rounded w-3/4"></div>
                <div class="h-3 sm:h-4 bg-gray-200 skeleton-shimmer rounded w-1/2"></div>
                <div class="h-3 sm:h-4 bg-gray-200 skeleton-shimmer rounded w-2/3"></div>
              </div>
              <!-- Price Skeleton -->
              <div class="w-16 sm:w-24 h-8 sm:h-10 bg-gray-200 skeleton-shimmer rounded"></div>
            </div>
          </div>

          <!-- Actual Cart Items -->
          <template v-else-if="cartItems.length > 0">
            <div
            v-for="item in cartItems"
            :key="item.id"
            class="shopping-cart-box flex flex-col sm:flex-row gap-3 p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 my-2 sm:my-3"
            >
              <div class="cart-image h-24 w-32 sm:h-32 sm:w-40 rounded-md bg-gray-50 flex items-center justify-center">
                <img
                  :src="resolveImg(item.image)"
                  :alt="item.name"
                  class="h-auto w-auto max-h-full max-w-full object-contain"
                />
              </div>
              <div class="cart-info flex-1 flex flex-col justify-between">
                <div class="space-y-1">
                  <div class="product-name font-semibold text-xs sm:text-base md:text-lg capitalize text-gray-900">
                    {{ item.name }}
                  </div>
                  <div class="product-text text-xs sm:text-sm text-gray-600">From <span class="font-medium">{{ item.brand }}</span></div>
                  <div class="rating-box flex gap-2 items-center mt-1 sm:mt-2">
                    <div class="star-box text-xs sm:text-sm text-[#FFCF10]">
                      <StarIcon class="size-3 sm:size-4 inline"></StarIcon>
                      <StarIcon class="size-3 sm:size-4 inline"></StarIcon>
                      <StarIcon class="size-3 sm:size-4 inline"></StarIcon>
                      <StarIcon class="size-3 sm:size-4 inline"></StarIcon>
                      <StarIcon class="size-3 sm:size-4 inline"></StarIcon>
                    </div>
                    <div class="rating-text text-xs text-[#68A4FE] font-medium hidden sm:block">
                      100,450 Ratings
                    </div>
                  </div>
                </div>
                <div class="quantity-box mt-2 sm:mt-3 flex gap-2 sm:gap-3 items-center">
                  <button @click="decrement(item)" class="p-1 rounded hover:bg-gray-100 transition-colors">
                    <MinusIcon class="size-4 sm:size-5 text-gray-600 hover:text-[#68a4fe]"></MinusIcon>
                  </button>
                  <input
                    v-model.number="item.quantity"
                    @keyup.enter="updateQuantityOnEnter(item)"
                    type="number"
                    min="1"
                    class="p-1 sm:p-2 border border-gray-300 rounded-md outline-none w-12 sm:w-16 text-center text-xs sm:text-base"
                  />
                  <button @click="increment(item)" class="p-1 rounded hover:bg-gray-100 transition-colors">
                    <PlusIcon class="size-4 sm:size-5 text-gray-600 hover:text-[#68a4fe]"></PlusIcon>
                  </button>
                </div>
              </div>
              <div class="action-box flex flex-col justify-between items-end sm:w-32">
                <div class="text-right">
                  <div class="text-[#384857] text-xs sm:text-sm font-medium mb-1">
                    {{ item.quantity }} x {{ formatCurrency(item.price) }}
                  </div>
                  <div class="product-price text-[#FF412C] text-base sm:text-xl font-bold bg-gradient-to-r from-blue-50 to-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-red-100">
                    {{ formatCurrency(item.price * item.quantity) }}
                  </div>
                </div>
                <div class="action-button mt-2 sm:mt-4 flex flex-col gap-1 sm:gap-2 w-full">
                  <button
                    type="button"
                    @click="removeItem(item)"
                    class="px-2 sm:px-3 py-1 sm:py-2 bg-red-500 hover:bg-red-600 rounded-md text-white text-xs sm:text-sm font-medium transition-colors duration-300"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    @click="saveForLater(item)"
                    class="px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-[#68A4FE] to-[#4A90D9] hover:shadow-md rounded-md text-white text-xs sm:text-sm font-medium transition-all duration-300"
                  >
                    Save for later
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Empty Cart Message -->
          <div v-else class="text-center py-12">
            <div class="text-6xl mb-4">🛒</div>
            <p class="text-lg text-gray-600 font-medium">Your cart is empty</p>
            <p class="text-gray-500 text-sm mt-2">Start shopping to add items to your cart</p>
          </div>
        </div>

        <!-- Cart Summary Card -->
        <div class="cart-total rounded-lg sm:rounded-xl shadow-lg border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-3 sm:p-6 h-fit w-full lg:w-1/3 my-2 sm:my-3 lg:my-0">
          <div class="cart-total-title mb-2 sm:mb-4 pb-2 sm:pb-4 border-b-2 border-gray-200">
            <h2 class="flex items-center gap-2 text-base sm:text-xl font-bold text-gray-900">
              <i class="fa-solid fa-check text-xl sm:text-2xl text-emerald-500"></i>
              <span>Order Summary</span>
            </h2>
          </div>
          <div class="cart-total-content space-y-2 sm:space-y-4">
            <div class="content-item flex justify-between items-center">
              <span class="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Subtotal ({{ itemCount }} items):</span>
              <span class="text-sm sm:text-base md:text-lg font-semibold text-gray-900">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="content-item flex justify-between items-center pb-4 border-b-2 border-gray-200">
              <span class="text-xs sm:text-sm md:text-base text-gray-700 font-medium">VAT (16%):</span>
              <span class="text-sm sm:text-base md:text-lg font-semibold text-gray-900">{{ formatCurrency(subtotal * 0.16) }}</span>
            </div>
            <div class="content-total flex justify-between items-center pt-2 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-lg">
              <span class="text-xs sm:text-sm md:text-base font-bold text-gray-900">Total:</span>
              <span class="text-lg sm:text-xl md:text-2xl font-bold text-[#FF412C]">{{ formatCurrency(subtotal * 1.16) }}</span>
            </div>
            <button
              @click="proceedToCheckout"
              type="button"
              class="w-full mt-4 sm:mt-6 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-[#68A4FE] to-[#4A90D9] hover:shadow-lg rounded-lg text-white text-center text-sm sm:text-base font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Proceed to Checkout
            </button>
            <button
              type="button"
              class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-center text-sm sm:text-base font-semibold transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      </section>
      <section class="shopping-cart mx-auto px-[4%] lg:max-w-[1500px]">
        <div
        class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
      >
        wishlist
      </div>
        <div class="cart-section">
          <div class="shopping-cart-container text-[#384857] w-full lg:w-5/6">
            <div
              v-for="it in wishlistItems"
              :key="`wish-${it.id}`"
              class="shopping-cart-box flex flex-col sm:flex-row justify-between items-center sm:items-start p-4 h-auto sm:h-48 w-full border-b-2 border-gray-300 my-4"
            >
              <div class="cart-image h-full w-40">
                <img
                  :src="resolveImg(it.image)"
                  :alt="it.name"
                  class="md:-translate-y-4 h-auto scale-30  sm:h-full object-contain"
                />
              </div>
              <div class="cart-info h-full flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="product-name font-semibold text-base sm:text-xl capitalize">
                    {{ it.name }}
                  </div>
                  <div class="product-text text-sm">From {{ it.brand }}</div>
                  <div class="rating-box flex gap-2 items-center">
                    <div class="star-box text-sm text-[#FFCF10]">
                      <StarIcon class="size-4 inline"></StarIcon>
                      <StarIcon class="size-4 inline"></StarIcon>
                      <StarIcon class="size-4 inline"></StarIcon>
                      <StarIcon class="size-4 inline"></StarIcon>
                      <StarIcon class="size-4 inline"></StarIcon>
                    </div>
                    <div class="rating-text text-xs text-[#68A4FE]">
                      100,450 Ratings
                    </div>
                  </div>
                </div>
              </div>
              <div class="action-box h-full flex flex-col justify-between">
                <div class="product-price self-end text-[#FF412C] text-lg font-normal">
                  {{ formatCurrency(it.price) }}
                </div>
                <div class="action-button mt-4 sm:mt-0 flex items-center gap-4">
                  <button
                    type="button"
                    @click="wishlistRemove(it)"
                    class="px-4 py-2 bg-[#ffcf10] rounded-md text-white text-center"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    @click="wishlistAddToCart(it)"
                    class="px-4 py-2 bg-[#68a4fe] rounded-md text-white text-center"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            <div v-if="wishlistItems.length === 0" class="p-6 text-center text-sm text-gray-500">Your wishlist is empty.</div>
          </div>
        </div>
      </section>
      <!-- Pre-loading skeleton for related products -->
      <section v-if="isLoadingCart" class="shopping-cart mx-auto px-[4%] lg:max-w-[1500px]">
        <div class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize">
          you may also<span class="text-[#68A4FE] px-2"> like</span>
        </div>
        <div class="top-sales-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mx-auto w-full gap-3">
          <div v-for="i in 4" :key="`rp-pre-skel-${i}`" class="product-box group bg-white rounded-lg shadow-md transition-all duration-300 border border-gray-200 overflow-hidden my-2 sm:my-4 py-4 px-3">
            <div class="relative flex justify-center items-center overflow-hidden bg-white h-32 sm:h-40 rounded-lg mb-3">
              <div class="h-full w-full bg-gray-200 skeleton-shimmer rounded"></div>
            </div>
            <div class="h-4 bg-gray-200 skeleton-shimmer rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 skeleton-shimmer rounded w-1/2 mb-3"></div>
            <div class="star-box flex justify-center gap-1 mb-3">
              <div v-for="j in 5" :key="`star-${i}-${j}`" class="h-4 w-4 bg-gray-200 skeleton-shimmer rounded-full"></div>
            </div>
            <div class="h-8 bg-gray-200 skeleton-shimmer rounded w-full mb-3"></div>
            <div class="h-10 bg-gray-200 skeleton-shimmer rounded w-full"></div>
          </div>
        </div>
      </section>
      <!-- Related products section -->
      <section v-if="showRecommendations" class="shopping-cart mx-auto px-[4%] lg:max-w-[1500px]">
        <div class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize">
          you may also<span class="text-[#68A4FE] px-2"> like</span>
        </div>
        <div v-if="isLoadingRelated" class="top-sales-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mx-auto w-full gap-3">
          <div v-for="i in 4" :key="`rp-skel-${i}`" class="product-box group bg-white rounded-lg shadow-md transition-all duration-300 border border-gray-200 overflow-hidden my-2 sm:my-4 py-4 px-3">
            <div class="relative flex justify-center items-center overflow-hidden bg-white h-32 sm:h-40 rounded-lg mb-3">
              <div class="h-full w-full bg-gray-200 skeleton-shimmer rounded"></div>
            </div>
            <div class="h-4 bg-gray-200 skeleton-shimmer rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 skeleton-shimmer rounded w-1/2 mb-3"></div>
            <div class="star-box flex justify-center gap-1 mb-3">
              <div v-for="j in 5" :key="`star-${i}-${j}`" class="h-4 w-4 bg-gray-200 skeleton-shimmer rounded-full"></div>
            </div>
            <div class="h-8 bg-gray-200 skeleton-shimmer rounded w-full mb-3"></div>
            <div class="h-10 bg-gray-200 skeleton-shimmer rounded w-full"></div>
          </div>
        </div>
        <div v-else class="top-sales-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mx-auto w-full gap-3">
          <div v-for="rec in relatedProducts" :key="rec.id" class="product-box group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 border border-gray-200 overflow-hidden my-2 sm:my-4 py-4 px-3">
            <div class="relative flex justify-center items-center overflow-hidden bg-white h-40 rounded-lg mb-3">
              <div class="product-image cursor-pointer transform group-hover:scale-110 transition-transform duration-300">
                <img :src="resolveImg(rec.image)" :alt="rec.name" class="h-full object-contain" />
              </div>
              <div class="absolute top-2 right-2 bg-[#68A4FE] text-white px-2 py-1 rounded text-xs font-semibold" v-if="rec.oldPrice && rec.price < rec.oldPrice">
                -{{ Math.round((1 - rec.price / rec.oldPrice) * 100) }}%
              </div>
            </div>
            <div class="product-title text-sm font-semibold capitalize cursor-pointer hover:text-[#68A4FE] line-clamp-2 mb-2 text-gray-800">
              {{ rec.name }}
            </div>
            <div class="brand-text text-xs text-gray-500 mb-2 font-medium">{{ rec.brand }}</div>
            <div class="star-box text-center text-sm text-[#FFCF10] mb-3 flex justify-center gap-1">
              <svg v-for="i in (rec.rating || 0)" :key="`r-${rec.id}-${i}`" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <polygon points="12,17.27 18.18,21 16.54,13.97 22,9.24 14.81,8.62 12,2 9.19,8.62 2,9.24 7.46,13.97 5.82,21" />
              </svg>
            </div>
            <div class="price-section bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-2 mb-3">
              <div v-if="rec.oldPrice && rec.price < rec.oldPrice" class="deal-price text-xs text-gray-500 font-semibold line-through mb-1">{{ formatCurrency(rec.oldPrice) }}</div>
              <div class="first-price text-lg font-bold text-[#FF412C]">{{ formatCurrency(rec.price) }}</div>
            </div>
            <button class="add-cart-btn w-full bg-gradient-to-r from-[#68A4FE] to-[#4A90D9] hover:from-[#4A90D9] hover:to-[#356BA8] text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 ease-in-out text-xs sm:text-sm transform hover:scale-105 active:scale-95" @click="addToCartQuick(rec)">add to cart</button>
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
@keyframes shimmer {
  100%{
    left: 150%;
  }
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes skeleton-wave {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-shimmer {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, rgb(229, 231, 235) 0%, rgb(243, 244, 246) 20%, rgb(229, 231, 235) 40%);
  background-size: 1000px 100%;
  animation: skeleton-wave 2s infinite;
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite
}
</style>
