<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { PlusIcon, MinusIcon, StarIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/vue/24/solid'

const router = useRouter()

// Check if user is logged in
const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true')

// Reactive cart and wishlist loaded from sessionStorage
const cartItems = ref([])
const wishlistItems = ref([])
// Recommendations for "you may also like"
const recommendations = ref([
  { id: 'rec-ph-1', name: 'infinix hot 12', brand: 'Infinix', image: '/src/assets/images/redmi note 12.png', price: 136, rating: 5 },
  { id: 'rec-ph-2', name: 'redmi note 12', brand: 'Xiaomi', image: '/src/assets/images/redmi note 12.png', price: 136, rating: 5 },
  { id: 'rec-ph-3', name: 'iphone 12', brand: 'Apple', image: '/src/assets/images/iphone12.png', price: 699, rating: 5 },
  { id: 'rec-ph-4', name: 'tecno spark 5', brand: 'Tecno', image: '/src/assets/images/techno spark 5.png', price: 159, rating: 5 },
  { id: 'rec-ph-5', name: 'redmi 10 2022 pro', brand: 'Xiaomi', image: '/src/assets/images/xiaomi redmi 10 2022 pro.png', price: 219, rating: 5 },
])

function loadCart() {
  try {
    const raw = sessionStorage.getItem('cartItems')
    const parsed = raw ? JSON.parse(raw) : []
    // Ensure quantity and basic fields
    cartItems.value = Array.isArray(parsed)
      ? parsed.map(it => ({
          id: it.id,
          name: it.name,
          brand: it.brand,
          price: Number(it.price) || 0,
          oldPrice: it.oldPrice ?? null,
          image: it.image,
          quantity: Number(it.quantity) > 0 ? Number(it.quantity) : 1,
        }))
      : []
  } catch {
    cartItems.value = []
  }
}

function saveCart() {
  try { sessionStorage.setItem('cartItems', JSON.stringify(cartItems.value)) } catch {}
}

onMounted(() => {
  loadCart()
  loadWishlist()
})

const itemCount = computed(() => cartItems.value.reduce((sum, it) => sum + (it.quantity || 0), 0))
const subtotal = computed(() => cartItems.value.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0))
const formatCurrency = (n) => `$${Number(n).toFixed(0)}`

function increment(it) {
  it.quantity = (it.quantity || 1) + 1
  saveCart()
}

function decrement(it) {
  if ((it.quantity || 1) > 1) {
    it.quantity -= 1
  } else {
    removeItem(it)
    return
  }
  saveCart()
}

function removeItem(it) {
  cartItems.value = cartItems.value.filter(x => x.id !== it.id)
  saveCart()
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
  }
}

function wishlistRemove(it) {
  wishlistItems.value = wishlistItems.value.filter(x => x.id !== it.id)
  saveWishlist()
}

function wishlistAddToCart(it) {
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
    showToast(`${it.name} is already in the cart`, 'info')
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
  const idx = cartItems.value.findIndex(x => x.id === it.id)
  if (idx >= 0) {
    showToast(`${it.name} is already in the cart`, 'info')
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
function resolveImg(p) {
  if (!p || typeof p !== 'string') return ''
  // External or data URLs
  if (/^(https?:)?\/\//.test(p) || p.startsWith('data:')) return p
  // Normalize slashes and trim
  let path = p.replace(/\\/g, '/').trim()
  // Fix erroneous '/src/views/' to '/src/'
  path = path.replace('/src/views/', '/src/')
  // Already absolute to src
  if (path.startsWith('/src/')) return path
  // Alias to src
  if (path.startsWith('@/')) return path.replace(/^@\//, '/src/')
  // Public assets patterns
  if (path.startsWith('/assets/') || path.startsWith('/images/') || path.startsWith('/img/')) return `/src${path}`
  // Relative paths containing assets/ -> coerce to /src/assets/...
  const idx = path.indexOf('assets/')
  if (idx !== -1) return `/src/${path.slice(idx)}`
  // As a last resort, return normalized original
  return path
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
      <div class="cart-section flex flex-col lg:flex-row justify-between w-full">
        <div class="shopping-cart-container text-[#384857] w-full lg:w-3/5">
          <div
          v-for="item in cartItems"
          :key="item.id"
          class="shopping-cart-box flex flex-col sm:flex-row justify-between items-center sm:items-start p-4 h-auto sm:h-48 w-full border-b-2 border-gray-300 my-4"
          >
              <div class="cart-image h-full w-40">
                <img
                  :src="resolveImg(item.image)"
                  :alt="item.name"
                  class="md:-translate-y-4 h-auto scale-30 sm:h-full object-contain"
                />
              </div>
              <div class="cart-info h-full flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="product-name font-semibold text-base sm:text-xl capitalize">
                    {{ item.name }}
                  </div>
                  <div class="product-text text-sm">From {{ item.brand }}</div>
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
                <div class="quantity-box mt-4 sm:mt-0 flex gap-4 items-center">
                  <PlusIcon @click="increment(item)" class="size-6 inline cursor-pointer hover:text-[#68a4fe] transition-all duration-300 ease-in-out"></PlusIcon>
                  <input
                    v-model.number="item.quantity"
                    @change="saveCart()"
                    type="number"
                    min="1"
                    class="p-2 border-2 rounded-md outline-none w-24"
                  />
                  <MinusIcon @click="decrement(item)" class="size-6 inline cursor-pointer hover:text-[#68a4fe] transition-all duration-300 ease-in-out"></MinusIcon>
                </div>
              </div>
              <div class="action-box h-full flex flex-col justify-between">
                <div class="self-end text-right">
                  <div class="text-[#384857] text-sm font-medium">
                    {{ item.quantity }} x {{ formatCurrency(item.price) }}
                  </div>
                  <div class="product-price text-[#FF412C] text-lg font-semibold">
                    {{ formatCurrency(item.price * item.quantity) }}
                  </div>
                </div>
                <div class="action-button mt-4 sm:mt-0 flex items-center gap-4">
                  <button
                    type="button"
                    @click="removeItem(item)"
                    class="px-4 py-2 bg-[#ffcf10] rounded-md text-white text-center"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    @click="saveForLater(item)"
                    class="px-4 py-2 bg-[#68a4fe] rounded-md text-white text-center"
                  >
                    Save for later
                  </button>
                </div>
              </div>
            </div>
            <div v-if="cartItems.length === 0" class="p-6 text-center text-sm text-gray-500">Your cart is empty.</div>
          </div>
          <div class="cart-total border-2 border-gray-300  h-52 sm:h-56 lg:h-64 xl:h-56 w-full md:w-3/5 lg:w-1/3 my-2">
            <h2
              class="cart-total-title capitalize border-b-2 border-gray-300 px-1 py-4 text-center space-x-2 sm:space-x-4 text-base sm:text-xl font-semibold text-black"
            >
              <i class="fa-solid fa-check font-extrabold text-2xl"></i>
              <span>order items</span>
            </h2>
            <div class="cart-total-content flex flex-col gap-4 p-2">
              <div class="content-title space-y-2">
                <h2 class="p-2 text-base sm:text-xl text-[#384857] font-semibold">
                  subtotal({{ itemCount }} items):
                </h2>
                <div class="price px-2 text-[#FF412C] text-sm sm:text-xl font-semibold">
                  {{ formatCurrency(subtotal) }}
                </div>
              </div>
              <button
                @click="proceedToCheckout"
                type="button"
                class="self-end px-4 py-2 bg-[#68a4fe] hover:bg-[#5496f8] rounded-md text-white text-center transition-colors duration-300"
              >
                Proceed to checkout
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
      <section class="shopping-cart mx-auto px-[4%] lg:max-w-[1500px]">
        <div
        class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
      >
        you may also<span class="text-[#68A4FE] px-2"> like</span>
      </div>
      <div class="top-sales-container grid mx-auto w-[95%]">
        <div
          v-for="rec in recommendations"
          :key="rec.id"
          class="product-box text-center my-2 sm:my-4"
        >
          <div class="flex justify-center items-center">
            <div class="product-image">
              <img :src="resolveImg(rec.image)" :alt="rec.name" />
            </div>
          </div>
          <div class="product-title text-sm font-normal sm:font-semibold capitalize">
            {{ rec.name }}
          </div>
          <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
            <i v-for="i in (rec.rating || 0)" :key="`r-${rec.id}-${i}`" class="fa-solid fa-star"></i>
          </div>
          <div class="first-price my-1 sm:my-3 font-semibold">{{ formatCurrency(rec.price) }}</div>
          <button class="add-cart-btn text-xs" @click="addToCartQuick(rec)">add to cart</button>
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
          'bg-emerald-500/90 border-emerald-300': toast.type === 'success' || toast.type === 'info',
          'bg-red-600/95 border-red-400': toast.type === 'error'
        }"
      >
        <CheckCircleIcon class="size-6 flex-shrink-0 opacity-95" />
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
