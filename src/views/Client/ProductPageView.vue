<script setup>

import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/solid'

const route = useRoute()
const router = useRouter()
const product = ref(null)
const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true')
const activeImage = ref('')
const galleryImages = ref([])

function initProductFromSession() {
  try {
    const raw = sessionStorage.getItem('selectedProduct')
    const parsed = raw ? JSON.parse(raw) : null
    if (parsed && parsed.id === route.params.id) {
      product.value = parsed
    }
  } catch {}
  // Initialize gallery and active image
  const imgs = Array.isArray(product.value?.images) ? product.value.images : []
  if (imgs.length > 0) {
    const capped = uniq(imgs).slice(0, 3)
    galleryImages.value = capped
    activeImage.value = capped[0]
  } else {
    const fallback = product.value?.image ? [product.value.image] : []
    const capped = uniq(fallback).slice(0, 3)
    galleryImages.value = capped
    activeImage.value = capped[0] || ''
  }
}

onMounted(() => {
  initProductFromSession()
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch {}
})

// When navigating to this same view with a different :id, reinitialize product and gallery
watch(
  () => route.params.id,
  () => {
    initProductFromSession()
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }
)

const title = computed(() => product.value?.name ?? 'Product')
const brand = computed(() => product.value?.brand ?? '—')
const image = computed(() => activeImage.value || product.value?.image || '../../assets/images/redmi note 12.png')
const price = computed(() => product.value?.price ?? 0)
const oldPrice = computed(() => product.value?.oldPrice ?? null)
const formatCurrency = (n) => `$${Number(n).toFixed(0)}`

// Delivery window: start = tomorrow, end = start + 4 days
const deliveryWindow = computed(() => {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 4)
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
  return `${fmt(start)} - ${fmt(end)}`
})

function resolveImg(p) {
  if (!p) return ''
  // External or data URLs
  if (/^(https?:)?\/\//.test(p) || /^data:/.test(p)) return p
    if (typeof p !== 'string') return ''
    // Already absolute (http/https or data URIs)
    if (/^(https?:)?\/\//.test(p) || p.startsWith('data:')) return p
    // Normalize slashes
    let path = p.replace(/\\/g, '/').trim()
    // Remove leading './' or '../'
    path = path.replace(/^\.\/+/, '')
    while (path.startsWith('../')) path = path.slice(3)

    // Unify common aliases/prefixes to /src/assets
    // Examples we may see:
    // - '@/assets/...'
    // - 'src/assets/...'
    // - '/src/assets/...'
    // - 'assets/...'
    // - '/assets/...'
    // - erroneously '/src/views/assets/...'
    if (path.startsWith('@/')) path = path.replace('@/', 'src/')
    // Fix erroneous '/src/views/...'
    path = path.replace(/^src\/views\//, 'src/')
    path = path.replace(/^\/src\/views\//, '/src/')

    // Ensure we end up under src/assets
    if (path.startsWith('/src/assets/')) {
      // ok
    } else if (path.startsWith('src/assets/')) {
      path = '/' + path
    } else if (path.startsWith('/assets/')) {
      path = '/src' + path
    } else if (path.startsWith('assets/')) {
      path = '/src/' + path
    } else if (path.startsWith('/src/')) {
      // already under /src but not assets — leave as-is
    } else if (path.startsWith('src/')) {
      path = '/' + path
    } else {
      // bare filename or unknown: assume under /src/assets/images or /src/assets root
      // Prefer placing under /src/assets/ without forcing images/ to avoid wrong subdirs
      path = '/src/assets/' + path.replace(/^\//, '')
    }

    try {
      return new URL(path, import.meta.url).href
    } catch (e) {
      return path
    }
}


const specs = computed(() => {
  const cat = (product.value?.category || '').toLowerCase()
  if (cat === 'laptops') {
    return { ram: '16GB', resolution: '1920 × 1080 (FHD)', camera: '720p HD' }
  }
  if (cat === 'smartwatches') {
    return { ram: '512MB', resolution: '390 × 390', camera: '—' }
  }
  if (cat === 'televisions') {
    return { ram: '—', resolution: '3840 × 2160 (4K)', camera: '—' }
  }
  // phones default
  return { ram: '6GB', resolution: '1080 × 2400 (FHD+)', camera: '48MP' }
})

const descriptionText = computed(() => {
  const desc = product.value?.description
  if (desc && String(desc).trim().length > 0) return desc
  const cat = (product.value?.category || '').toLowerCase()
  if (cat === 'laptops') {
    return `${title.value} is a reliable productivity laptop with a sharp ${specs.value.resolution} display, fast ${specs.value.ram} memory, and an efficient processor for everyday multitasking. Ideal for work, study, and light creative tasks, with long battery life and quiet thermals.`
  }
  if (cat === 'smartwatches') {
    return `${title.value} keeps you on top of your day with health tracking, notifications, and multi‑day battery life. The crisp ${specs.value.resolution} display and water‑resistant design make it perfect for workouts and daily wear.`
  }
  if (cat === 'televisions') {
    return `${title.value} delivers stunning ${specs.value.resolution} visuals with vivid colors and deep contrast. Enjoy smart streaming apps, multiple HDMI ports, and smooth motion for sports, movies, and gaming.`
  }
  // phones default
  return `${title.value} offers a vibrant ${specs.value.resolution} display, capable ${specs.value.camera} camera system, and smooth performance with ${specs.value.ram} RAM. A great all‑rounder for social, streaming, and photography.`
})

// Display specs tailored per category using product.specifications when available
const displaySpecs = computed(() => {
  const cat = (product.value?.category || '').toLowerCase()
  const s = product.value?.specifications || {}
  if (cat === 'laptops') {
    return [
      { label: 'RAM', value: s.ram || '16GB' },
      { label: 'Processor', value: s.processor || 'Intel Core i7 (11th Gen)' },
      { label: 'Storage', value: s.storage || '512GB SSD' },
    ]
  }
  if (cat === 'televisions') {
    return [
      { label: 'Resolution', value: s.resolution || '3840 × 2160 (4K)' },
      { label: 'Screen Size', value: s.screenSize || '55 inch' },
      { label: 'Refresh Rate', value: s.refreshRate || '120 Hz' },
    ]
  }
  if (cat === 'smartwatches') {
    return [
      { label: 'Display', value: s.resolution || '390 × 390 AMOLED' },
      { label: 'Battery Life', value: s.batteryLife || 'Up to 7 days' },
      { label: 'Water Resistance', value: s.waterResistance || '5 ATM' },
    ]
  }
  // phones (default)
  return [
    { label: 'RAM', value: s.ram || '6GB' },
    { label: 'Battery', value: s.battery || '5000 mAh' },
    { label: 'Camera', value: s.camera || '48 MP' },
  ]
})

const relatedProducts = computed(() => {
  const cat = (product.value?.category || 'phones').toLowerCase()
  if (cat === 'laptops') {
    return [
      {
        id: 'lp-1',
        name: 'dell inspiron',
        brand: 'Dell',
        category: 'laptops',
        image: '../../assets/images/dell inspiron.png',
        images: [
          '../../assets/images/dell inspiron.png',
          '../../assets/images/hp laptop 15 ci7.png',
          '../../assets/images/dell latitude 5320.png',
        ],
        price: 749,
        oldPrice: 899,
        originalPrice: 899,
        discountedPrice: 749,
        rating: 5,
        description: 'Slim productivity laptop with FHD display, fast SSD storage, and long battery life—great for school and work.',
        specifications: {
          ram: '16GB',
          processor: 'Intel Core i7 (11th Gen)',
          storage: '512GB SSD',
          resolution: '1920 × 1080 (FHD)'
        },
      },
      {
        id: 'lp-2',
        name: 'dell latitude 5320',
        brand: 'Dell',
        category: 'laptops',
        image: '../../assets/images/dell latitude 5320.png',
        images: [
          '../../assets/images/dell latitude 5320.png',
          '../../assets/images/dell inspiron.png',
          '../../assets/images/hp laptop 15 ci7.png',
        ],
        price: 999,
        oldPrice: 1149,
        originalPrice: 1149,
        discountedPrice: 999,
        rating: 5,
        description: 'Business-class ultrabook with premium build, strong security, and all-day battery.',
        specifications: {
          ram: '16GB',
          processor: 'Intel Core i7 (11th Gen) vPro',
          storage: '512GB SSD',
          resolution: '1920 × 1080 (FHD)'
        },
      },
      {
        id: 'lp-3',
        name: 'hp laptop 15 ci7',
        brand: 'HP',
        category: 'laptops',
        image: '../../assets/images/hp laptop 15 ci7.png',
        images: [
          '../../assets/images/hp laptop 15 ci7.png',
          '../../assets/images/dell inspiron.png',
          '../../assets/images/dell latitude 5320.png',
        ],
        price: 1099,
        oldPrice: 1299,
        originalPrice: 1299,
        discountedPrice: 1099,
        rating: 5,
        description: '15-inch performance laptop with Core i7, ample RAM, and speedy SSD for demanding tasks.',
        specifications: {
          ram: '16GB',
          processor: 'Intel Core i7 (11th Gen)',
          storage: '1TB SSD',
          resolution: '1920 × 1080 (FHD)'
        },
      },
      {
        id: 'lp-8',
        name: 'hp laptop 15 business',
        brand: 'HP',
        category: 'laptops',
        image: '../../assets/images/hp laptop 15 ci7.png',
        images: [
          '../../assets/images/hp laptop 15 ci7.png',
          '../../assets/images/dell latitude 5320.png',
          '../../assets/images/dell inspiron.png',
        ],
        price: 999,
        oldPrice: 1149,
        originalPrice: 1149,
        discountedPrice: 999,
        rating: 5,
        description: 'Reliable business notebook with FHD screen, quiet thermals, and excellent keyboard.',
        specifications: {
          ram: '16GB',
          processor: 'Intel Core i5 (12th Gen)',
          storage: '512GB SSD',
          resolution: '1920 × 1080 (FHD)'
        },
      },
    ]
  }
  if (cat === 'televisions') {
    return [
      {
        id: 'tv-2',
        name: 'MoTech TV 55" 4K',
        brand: 'MoTech',
        category: 'televisions',
        image: '../../assets/images/redmi note 12.png',
        images: [
          '../../assets/images/redmi note 12.png',
          '../../assets/images/iphone12.png',
          '../../assets/images/techno spark 5.png',
        ],
        price: 499,
        oldPrice: 599,
        originalPrice: 599,
        discountedPrice: 499,
        rating: 5,
        description: '55-inch 4K smart TV with vivid colors, rich contrast, and popular streaming apps built-in.',
        specifications: {
          resolution: '3840 × 2160 (4K)',
          screenSize: '55 inch',
          refreshRate: '120 Hz'
        },
      },
      {
        id: 'tv-3',
        name: 'MoTech TV 65" 4K',
        brand: 'MoTech',
        category: 'televisions',
        image: '../../assets/images/redmi note 12.png',
        images: [
          '../../assets/images/redmi note 12.png',
          '../../assets/images/techno spark 5.png',
          '../../assets/images/xiaomi redmi 10 2022 pro.png',
        ],
        price: 699,
        oldPrice: 799,
        originalPrice: 799,
        discountedPrice: 699,
        rating: 5,
        description: '65-inch 4K TV with HDR support, smooth motion for sports, and multiple HDMI ports.',
        specifications: {
          resolution: '3840 × 2160 (4K)',
          screenSize: '65 inch',
          refreshRate: '120 Hz'
        },
      },
      {
        id: 'tv-6',
        name: 'MoTech TV 50" 4K',
        brand: 'MoTech',
        category: 'televisions',
        image: '../../assets/images/redmi note 12.png',
        images: [
          '../../assets/images/redmi note 12.png',
          '../../assets/images/iphone12.png',
          '../../assets/images/xiaomi redmi 10 2022 pro.png',
        ],
        price: 399,
        oldPrice: 499,
        originalPrice: 499,
        discountedPrice: 399,
        rating: 5,
        description: 'Compact 50-inch 4K TV perfect for bedrooms and apartments with built-in streaming.',
        specifications: {
          resolution: '3840 × 2160 (4K)',
          screenSize: '50 inch',
          refreshRate: '60 Hz'
        },
      },
      {
        id: 'tv-8',
        name: 'MoTech TV 85" 4K',
        brand: 'MoTech',
        category: 'televisions',
        image: '../../assets/images/redmi note 12.png',
        images: [
          '../../assets/images/redmi note 12.png',
          '../../assets/images/iphone12.png',
          '../../assets/images/techno spark 5.png',
        ],
        price: 1499,
        oldPrice: 1699,
        originalPrice: 1699,
        discountedPrice: 1499,
        rating: 5,
        description: 'Massive 85-inch cinematic 4K TV with immersive visuals and premium HDR.',
        specifications: {
          resolution: '3840 × 2160 (4K)',
          screenSize: '85 inch',
          refreshRate: '120 Hz'
        },
      },
    ]
  }
  if (cat === 'smartwatches') {
    return [
      {
        id: 'sw-1',
        name: 'MoTech Watch S1',
        brand: 'MoTech',
        category: 'smartwatches',
        image: '../../assets/images/redmi note 12.png',
        images: [
          '../../assets/images/redmi note 12.png',
          '../../assets/images/techno spark 5.png',
          '../../assets/images/iphone12.png',
        ],
        price: 99,
        oldPrice: 129,
        originalPrice: 129,
        discountedPrice: 99,
        rating: 5,
        description: 'Lightweight smartwatch with AMOLED display, health tracking, and 7-day battery life.',
        specifications: {
          resolution: '390 × 390',
          batteryLife: 'Up to 7 days',
          waterResistance: '5 ATM'
        },
      },
      {
        id: 'sw-2',
        name: 'MoTech Watch Pro',
        brand: 'MoTech',
        category: 'smartwatches',
        image: '../../assets/images/redmi note 12.png',
        images: [
          '../../assets/images/redmi note 12.png',
          '../../assets/images/xiaomi redmi 10 2022 pro.png',
          '../../assets/images/iphone12.png',
        ],
        price: 149,
        oldPrice: 199,
        originalPrice: 199,
        discountedPrice: 149,
        rating: 5,
        description: 'Premium smartwatch with GPS, voice assistant, and advanced training metrics.',
        specifications: {
          resolution: '410 × 410',
          batteryLife: 'Up to 10 days',
          waterResistance: '5 ATM'
        },
      },
      {
        id: 'sw-7',
        name: 'MoTech Watch S2',
        brand: 'MoTech',
        category: 'smartwatches',
        image: '../../assets/images/redmi note 12.png',
        images: [
          '../../assets/images/redmi note 12.png',
          '../../assets/images/techno spark 5.png',
          '../../assets/images/xiaomi redmi 10 2022 pro.png',
        ],
        price: 129,
        oldPrice: 159,
        originalPrice: 159,
        discountedPrice: 129,
        rating: 5,
        description: 'Balanced smartwatch with essential health features and comfortable fit.',
        specifications: {
          resolution: '360 × 360',
          batteryLife: 'Up to 5 days',
          waterResistance: 'IP68'
        },
      },
      {
        id: 'sw-8',
        name: 'MoTech Watch Ultra',
        brand: 'MoTech',
        category: 'smartwatches',
        image: '../../assets/images/redmi note 12.png',
        images: [
          '../../assets/images/redmi note 12.png',
          '../../assets/images/iphone12.png',
          '../../assets/images/techno spark 5.png',
        ],
        price: 249,
        oldPrice: 299,
        originalPrice: 299,
        discountedPrice: 249,
        rating: 5,
        description: 'Rugged smartwatch with large display, dual-band GPS, and extended multi-day battery.',
        specifications: {
          resolution: '454 × 454',
          batteryLife: 'Up to 14 days',
          waterResistance: '10 ATM'
        },
      },
    ]
  }
  // phones default
  return [
    {
      id: 'ph-2',
      name: 'redmi note 12',
      brand: 'Xiaomi',
      category: 'phones',
      image: '../../assets/images/redmi note 12.png',
      images: [
        '../../assets/images/redmi note 12.png',
        '../../assets/images/xiaomi redmi 10 2022 pro.png',
        '../../assets/images/techno spark 5.png',
      ],
      price: 136,
      oldPrice: 206,
      originalPrice: 206,
      discountedPrice: 136,
      rating: 5,
      description: 'Affordable smartphone with vibrant display and long-lasting battery.',
      specifications: {
        ram: '6GB',
        battery: '5000 mAh',
        camera: '50 MP',
        resolution: '1080 × 2400 (FHD+)'
      },
    },
    {
      id: 'ph-7',
      name: 'tecno spark 5',
      brand: 'Tecno',
      category: 'phones',
      image: '../../assets/images/techno spark 5.png',
      images: [
        '../../assets/images/techno spark 5.png',
        '../../assets/images/xiaomi redmi 10 2022 pro.png',
        '../../assets/images/redmi note 12.png',
      ],
      price: 159,
      oldPrice: 189,
      originalPrice: 189,
      discountedPrice: 159,
      rating: 5,
      description: 'Great value device with solid battery and AI camera features.',
      specifications: {
        ram: '4GB',
        battery: '5000 mAh',
        camera: '16 MP',
        resolution: '720 × 1600 (HD+)'
      },
    },
    {
      id: 'ph-8',
      name: 'redmi 10 2022 pro',
      brand: 'Xiaomi',
      category: 'phones',
      image: '../../assets/images/xiaomi redmi 10 2022 pro.png',
      images: [
        '../../assets/images/xiaomi redmi 10 2022 pro.png',
        '../../assets/images/redmi note 12.png',
        '../../assets/images/iphone12.png',
      ],
      price: 219,
      oldPrice: 269,
      originalPrice: 269,
      discountedPrice: 219,
      rating: 5,
      description: 'Balanced mid-ranger with crisp FHD+ display and high-res main camera.',
      specifications: {
        ram: '6GB',
        battery: '5000 mAh',
        camera: '64 MP',
        resolution: '1080 × 2400 (FHD+)'
      },
    },
    {
      id: 'ph-3',
      name: 'iphone 12',
      brand: 'Apple',
      category: 'phones',
      image: '../../assets/images/iphone12.png',
      images: [
        '../../assets/images/iphone12.png',
        '../../assets/images/redmi note 12.png',
        '../../assets/images/xiaomi redmi 10 2022 pro.png',
      ],
      price: 699,
      oldPrice: 799,
      originalPrice: 799,
      discountedPrice: 699,
      rating: 5,
      description: 'Iconic Apple design with powerful A14 Bionic and excellent dual-camera system.',
      specifications: {
        ram: '4GB',
        battery: '2815 mAh',
        camera: '12 MP',
        resolution: '1170 × 2532 (Super Retina XDR)'
      },
    },
  ]
})

const gotoProduct = (p) => {
  try { sessionStorage.setItem('selectedProduct', JSON.stringify(p)) } catch {}
  router.push({ name: 'product-page', params: { id: p.id } })
}

// For RouterLink-based navigation: set selection and let the link handle routing
function setSelectedProduct(p) {
  try { sessionStorage.setItem('selectedProduct', JSON.stringify(p)) } catch {}
}

function uniq(arr) {
  return arr.filter((v, i, a) => a.indexOf(v) === i)
}

// Add to cart without navigating; uses sessionStorage 'cartItems'
function addToCart(p) {
  try {
    const raw = sessionStorage.getItem('cartItems')
    const cart = raw ? JSON.parse(raw) : []
    const idx = cart.findIndex((it) => it.id === p.id)
    if (idx >= 0) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1
    } else {
      cart.push({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        oldPrice: p.oldPrice || null,
        image: p.image,
        quantity: 1,
      })
    }
    sessionStorage.setItem('cartItems', JSON.stringify(cart))
  } catch {}
}

function proceedToBuy() {
  if (!product.value) return
  // Behave exactly like add to cart (no navigation)
  // Capture name before mutation for message
  const name = product.value.name || 'Item'
  // Check current cart for duplicates before adding
  try {
    const raw = sessionStorage.getItem('cartItems')
    const cart = raw ? JSON.parse(raw) : []
    if (Array.isArray(cart)) {
      const exists = cart.findIndex(it => it.id === product.value.id) >= 0
      if (exists) {
        showToast(`${name} is already in the cart`, 'warning')
        return
      }
    }
  } catch {}
  // Not in cart: add then remove from wishlist if present
  addToCart(product.value)
  try {
    const rawWish = sessionStorage.getItem('wishlistItems')
    if (rawWish) {
      const wishArr = JSON.parse(rawWish)
      if (Array.isArray(wishArr)) {
        const filtered = wishArr.filter(w => w.id !== product.value.id)
        if (filtered.length !== wishArr.length) {
          sessionStorage.setItem('wishlistItems', JSON.stringify(filtered))
        }
      }
    }
  } catch {}
  showToast(`${name} added to cart`, 'success')
}

// Toast utilities (success/warning/error)
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

// Save current product for later (wishlist)
function saveForLaterFromProduct() {
  try {
    const raw = sessionStorage.getItem('wishlistItems')
    const wish = raw ? JSON.parse(raw) : []
    const p = product.value
    if (!p) return
    const idx = Array.isArray(wish) ? wish.findIndex((it) => it.id === p.id) : -1
    if (idx >= 0) {
      showToast(`${p.name} is already in your wishlist`, 'warning')
    } else {
      const entry = {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        oldPrice: p.oldPrice || null,
        image: p.image,
      }
      const next = Array.isArray(wish) ? [...wish, entry] : [entry]
      sessionStorage.setItem('wishlistItems', JSON.stringify(next))
      showToast(`${p.name} saved for later`, 'success')
    }
  } catch {}
}
</script>
<template>
    <Header/>
    <main class="menu-toggle">
      <section class="product-home mt-16 px-[4%] mx-auto lg:max-w-[1500px]">
        <div
        class="heading text-[#384857] border-b-2 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
      >
        <span class="text-[#68A4FE] px-2">product</span> page
      </div>
      <div class="product flex items-center flex-col md:flex-row justify-between w-full">
        <div class="w-full md:basis-[48%] p-2 sm:p-4 flex flex-col items-center">
          <div class="master-image w-[15rem] md:w-[16rem] h-[15rem] md:h-[20rem] flex justify-center items-center my-6">
            <img :src="resolveImg(image)" :alt="title" class="m-auto w-full h-full object-contain">
          </div>
          <div class="w-full sm:w-4/5 flex justify-between gap-2 md:gap-4 mx-auto">
            <button
              v-for="(img, idx) in galleryImages"
              :key="idx"
              type="button"
              class="small-image h-20 border-2 p-1 sm:p-2 rounded-md cursor-pointer focus:outline-none"
              :class="{ 'border-[#68a4fe]': img === image }"
              @click="activeImage = img"
            >
              <img :src="resolveImg(img)" :alt="`thumb-${idx}`" class="h-full object-contain">
            </button>
          </div>
          <div class="action-button-container my-4 sm:my-8 flex w-full justify-between">
            <button type="button" @click="proceedToBuy" class="text-sm sm:text-base px-2 sm:px-4 py-3 rounded-md w-40 bg-[#ffcf10] basis-[48%] capitalize">Proceed to buy</button>
            <button type="button" @click="saveForLaterFromProduct" class="text-sm sm:text-base px-2 sm:px-4 py-3 rounded-md w-40 bg-[#68a4fe] basis-[48%] text-white capitalize">save for later</button>
          </div>
        </div>
        <div class="product-content-details w-full md:basis-[48%] p-2 sm:p-4 my-2 md:my-4">
          <div class="product-title font-semibold text-lg sm:text-xl mb-4 text-[#384857] capitalize">{{ title }}</div>
          <div class="product-manufacturer text-sm text-[#384857]">Brand: <span class="capitalize">{{ brand }}</span></div>
          <div class="flex gap-4 items-center my-2 border-b-2 py-4">
            <div class="text-xs text-[#ffcf10] flex items-center">
              <svg v-for="i in (product?.rating || 5)" :key="`star-${i}`" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mr-0.5">
                <polygon points="12,17.27 18.18,21 16.54,13.97 22,9.24 14.81,8.62 12,2 9.19,8.62 2,9.24 7.46,13.97 5.82,21" />
              </svg>
            </div>
            <div class="rating-text text-xs text-[#68a4fe]">
              100,450+ ratings | over 100k delivered
            </div>
          </div>
          <div class="price-details my-2 border-b-2">
            <p class="first-price text-sm py-2 text-[#384857]" v-if="oldPrice">Most recent price: <span>{{ formatCurrency(oldPrice) }}</span></p>
            <p class="deal-price text-sm py-2 text-[#384857]">Deal price: <span class="text-[#FF412C]">{{ formatCurrency(price) }}</span> inclusive of <span class="inline font-semibold text-[#384857]">VAT</span></p>
            <p class="save-amount text-sm py-2 capitalize text-[#384857]" v-if="oldPrice && price">save: <span class="text-[#FF412C]">{{ formatCurrency(oldPrice - price) }}</span></p>
          </div>
          <div class="delivery-timeline text-sm my-4">Delivery by: <span class="font-bold">{{ deliveryWindow }}</span></div>
          <div class="vendor-name text-sm my-4">
            <span>Sold by MoTech electronics</span> <span>(250 out of 300 already sold)</span>
          </div>
          <div class="product-specification-details grid grid-cols-3 gap-3 my-6 text-[#384857] mb-auto">
            <div class="spec flex flex-col gap-2" v-for="(spec, idx) in displaySpecs" :key="`spec-${idx}`">
              <span class="block font-semibold text-[#384857] text-base sm:text-xl">{{ spec.label }}:</span>
              <span class="border-2 px-2 sm:px-6 md:px-3 py-2 rounded-md font-normal sm:font-semibold text-base sm:text-xl">{{ spec.value }}</span>
            </div>
          </div>
        </div>
      </div>
      </section>
      <section class="product-description px-[4%] mx-auto lg:max-w-[1500px]">
        <div
        class="heading text-[#384857] border-b-2 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
      >
        product description
      </div>
      <p class="description-text text-sm my-4">{{ descriptionText }}</p>
      </section>
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
      <section class="related-products px-[4%] mx-auto lg:max-w-[1500px]">
        <div
        class="heading text-[#384857] border-b-2 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
      >
        <span class="text-[#68A4FE] px-2">related</span> products
      </div>
      <div class="top-sales-container grid mx-auto w-[95%] gap-3">
        <div
          v-for="rp in relatedProducts"
          :key="rp.id"
          class="product-box text-center my-2 sm:my-4 border-2 py-4"
        >
          <RouterLink
            class="product-box block"
            :to="{ name: 'product-page', params: { id: rp.id } }"
            :aria-label="`View details for ${rp.name}`"
            @click="setSelectedProduct(rp)"
          >
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img :src="resolveImg(rp.image)" :alt="rp.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize hover:text-[#68A4FE]">
              {{ rp.name }}
            </div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4 flex justify-center">
              <svg v-for="i in (rp.rating || 5)" :key="`rp-star-${rp.id}-${i}`" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 mx-0.5">
                <polygon points="12,17.27 18.18,21 16.54,13.97 22,9.24 14.81,8.62 12,2 9.19,8.62 2,9.24 7.46,13.97 5.82,21" />
              </svg>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50" v-if="rp.oldPrice">
                {{ formatCurrency(rp.oldPrice) }}
              </div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(rp.price) }}</div>
            </div>
          </RouterLink>
          <button class="add-cart-btn text-xs mt-2" @click.stop.prevent="addToCart(rp)">add to cart</button>
        </div>
      </div>
      </section>
    </main>
    <Footer/>
</template>