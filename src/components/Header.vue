<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import axiosClient from '@/axiosClient'
import { Bars3BottomLeftIcon, ShoppingCartIcon } from '@heroicons/vue/24/solid'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore, useAdminUserStore } from '@/stores/user'

const show = ref(false)
const cartCount = ref(0)
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const adminUserStore = useAdminUserStore()

const protectedRoutes = ['/checkout', '/orders']

const isClientLoggedIn = computed(() => !!userStore.user && !adminUserStore.adminUser)
const welcomeName = computed(() => {
  const user = userStore.user || {}
  return user.fullName || user.name || user.firstName || user.email || 'User'
})

const handleLogout = () => {
  userStore.clearUser()
  show.value = false
  const isProtected = protectedRoutes.some(p => route.path.startsWith(p))
  if (isProtected) {
    router.push('/')
  }
}

onMounted(() => {
  // Initialize cart count and subscribe to updates
  updateCartCount()
  // If there's no session cart stored but the client is logged in,
  // hydrate the cart from the backend so count survives browser sessions.
  try {
    const hasSessionCart = !!sessionStorage.getItem('cartItems')
    // Do not fetch when we're on the cart page — CartView will load and emit the data
    const onCartPage = route.name === 'cart' || route.path.startsWith('/cart')
    if (!hasSessionCart && isClientLoggedIn.value && !onCartPage) {
      fetchCartFromServer()
    }
  } catch {}
  // Listen for cart-loaded from the CartView so Header can hydrate without an API call
  window.addEventListener('cart-loaded', onCartLoaded)
  window.addEventListener('storage', updateCartCount)
  window.addEventListener('cart-updated', updateCartCount)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') updateCartCount()
  })
})

onUnmounted(() => {
  window.removeEventListener('storage', updateCartCount)
  window.removeEventListener('cart-updated', updateCartCount)
  window.removeEventListener('cart-loaded', onCartLoaded)
})

// Update cart count from sessionStorage (unique items only)
function updateCartCount() {
  try {
    const raw = sessionStorage.getItem('cartItems')
    if (raw) {
      const cart = JSON.parse(raw)
      cartCount.value = Array.isArray(cart) ? cart.length : 0
      return
    }
    // No session cart: if the client is logged in, fetch from backend
    if (isClientLoggedIn.value) {
      const onCartPage = route.name === 'cart' || route.path.startsWith('/cart')
      // If we're on the cart page, avoid duplicating the CartView request — wait for cart-loaded
      if (!onCartPage) {
        fetchCartFromServer()
      }
      return
    }
    cartCount.value = 0
  } catch {
    cartCount.value = 0
  }
}

// Fetch cart items from backend and hydrate sessionStorage and cartCount
async function fetchCartFromServer() {
  try {
    const res = await axiosClient.post('/api/cart/products')
    let items = res.data
    if (!Array.isArray(items)) {
      items = res.data?.cart_items ?? res.data?.items ?? res.data?.data ?? []
    }
    if (!Array.isArray(items)) items = []
    cartCount.value = items.length
    try { sessionStorage.setItem('cartItems', JSON.stringify(items)) } catch {}
  } catch (e) {
    cartCount.value = 0
  }
}

function onCartLoaded(e) {
  try {
    const items = e?.detail?.items ?? []
    if (Array.isArray(items)) {
      cartCount.value = items.length
      try { sessionStorage.setItem('cartItems', JSON.stringify(items)) } catch {}
    }
  } catch {
    // ignore
  }
}

// When a user logs in during the session, hydrate cart from server
watch(() => userStore.user, (u) => {
  if (u) {
    try {
      const hasSessionCart = !!sessionStorage.getItem('cartItems')
      const onCartPage = route.name === 'cart' || route.path.startsWith('/cart')
      if (!hasSessionCart && !onCartPage) fetchCartFromServer()
    } catch { fetchCartFromServer() }
  }
})

</script>

<template>
      <header class="fixed z-60 top-0 right-0 left-0 bg-[#68A4FE] shadow-[0_6px_12px_rgba(56,72,87,0.5)] shadow-gray-500">
      <section class="flex justify-between items-center gap-4 px-[4%] mx-auto lg:max-w-[1500px]">
        <div class="text-2xl font-semibold sm:font-extrabold text-white">MoTech</div>
        <div v-if="isClientLoggedIn" class="hidden md:flex flex-1 justify-end pr-2 xl:pr-4">
          <p class="max-w-[140px] lg:max-w-[180px] xl:max-w-[260px] truncate text-right text-white font-medium text-[11px] lg:text-xs xl:text-sm">
            Welcome back {{ welcomeName }}
          </p>
        </div>
        <div class="py-4">
         <Bars3BottomLeftIcon @click="show = !show"  class="humbuger-btn size-8 text-white font-extrabold cursor-pointer text-3xl"></Bars3BottomLeftIcon>
        </div>
        <Transition class="mobile-menu-navigation-bar">
            <div v-if="show" class="bg-[#68A4FE] absolute top-[4rem] right-0  z-50 h-screen">
                <router-link :to="{name: 'home'}" class="block py-4 px-6  text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">Home</router-link>
                <router-link :to="{name: 'about'}" class="block py-4 px-6  text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">About</router-link>
                <router-link :to="{name: 'products'}" class="block py-4 px-6  text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">Products</router-link>
                <router-link v-if="isClientLoggedIn" :to="{name: 'orders'}" class="block py-4 px-6  text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">My Orders</router-link>
                <router-link :to="{name: 'contact'}" class="block py-4 px-6  text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">contact</router-link>
                <button v-if="isClientLoggedIn" type="button" @click="handleLogout" class="block w-full text-left py-4 px-6 text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">logout</button>
                <router-link v-if="isClientLoggedIn" :to="{name: 'cart'}" class="cart-link  flex items-center text-white capitalize ease-in-ou gap-8 px-6 mt-4">cart<span class="cart-btn p-2"><ShoppingCartIcon class="size-6"></ShoppingCartIcon><span class="count right-4 bottom-0 top-7">{{ cartCount }}</span></span></router-link>
            </div>
        </Transition>
        <nav class="primary-navigation-bar flex items-center justify-between">
          <router-link :to="{name: 'home'}" class="block py-4 px-6  text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">Home</router-link>
          <router-link :to="{name: 'about'}" class="block py-4 px-6  text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">About</router-link>
          <router-link :to="{name: 'products'}" class="py-4 px-3 text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">Products</router-link>
          <router-link v-if="isClientLoggedIn" :to="{name: 'orders'}" class="py-4 px-3 text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">My Orders</router-link>
          <router-link :to="{name: 'contact'}" class="py-4 px-3 text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">contact</router-link>
          <button v-if="isClientLoggedIn" type="button" @click="handleLogout" class="py-4 px-3 text-white capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out">logout</button>
          <router-link v-if="isClientLoggedIn" :to="{name: 'cart'}" class="cart-link flex items-center px-0 text-white capitalize ease-in-out">cart<span class="cart-btn p-2"><ShoppingCartIcon class="size-6 cart-icon"></ShoppingCartIcon><span class="count right-4 bottom-0 top-7">{{ cartCount }}</span></span></router-link>
        </nav>
      </section>
    </header>
</template>
<style scoped>
.v-enter-from, .v-leave-to{
    right: -100%;
}
.v-enter-active, .v-leave-active {
  transition: all 0.5s ease;
}

  @media only screen and (max-width: 880px) {
    .mobile-menu-navigation-bar {
      display: block;
      width: 25rem;
    }
    .primary-navigation-bar {
      display: none;
    }
  }
  @media only screen and (min-width: 880px) {
    .mobile-menu-navigation-bar {
      display: none;
      right: -100%;
    }
    .humbuger-btn {
      display: none;
    }
  }
  @media only screen and (max-width: 640px) {
    .mobile-menu-navigation-bar {
      width: 22rem;
    }
  }
  @media only screen and (max-width: 450px) {
    .mobile-menu-navigation-bar {
      width: 16rem;
    }
  }
</style>
