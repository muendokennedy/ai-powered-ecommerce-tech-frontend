<script setup>

import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const route = useRoute()
const router = useRouter()
const product = ref(null)
const activeImage = ref('')
const galleryImages = ref([])

onMounted(() => {
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
})

const title = computed(() => product.value?.name ?? 'Product')
const brand = computed(() => product.value?.brand ?? '—')
const image = computed(() => activeImage.value || product.value?.image || '../../assets/images/redmi note 12.png')
const price = computed(() => product.value?.price ?? 0)
const oldPrice = computed(() => product.value?.oldPrice ?? null)
const formatCurrency = (n) => `$${Number(n).toFixed(0)}`

function resolveImg(p) {
  if (!p) return ''
  // External or data URLs
  if (/^(https?:)?\/\//.test(p) || /^data:/.test(p)) return p
  // Public assets (served from /public)
  if (p.startsWith('/images/') || p.startsWith('/img/') || p.startsWith('/assets/')) return p
  // Convert common aliases to a relative path from this file
  let cleaned = p
  if (p.startsWith('/src/')) {
    // from project root to this file: src/views/Client -> ../../
    cleaned = p.replace(/^\/src\//, '../../')
  } else if (p.startsWith('@/')) {
    cleaned = p.replace(/^@\//, '../../')
  }
  try {
    return new URL(cleaned, import.meta.url).href
  } catch (_e) {
    return p // fallback to original
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
      { id: 'lp-1', name: 'dell inspiron', image: '../../assets/images/dell inspiron.png', price: 749, oldPrice: 899, rating: 5, brand: 'Dell', category: 'laptops' },
      { id: 'lp-2', name: 'dell latitude 5320', image: '../../assets/images/dell latitude 5320.png', price: 999, oldPrice: 1149, rating: 5, brand: 'Dell', category: 'laptops' },
      { id: 'lp-3', name: 'hp laptop 15 ci7', image: '../../assets/images/hp laptop 15 ci7.png', price: 1099, oldPrice: 1299, rating: 5, brand: 'HP', category: 'laptops' },
      { id: 'lp-8', name: 'hp laptop 15 business', image: '../../assets/images/hp laptop 15 ci7.png', price: 999, oldPrice: 1149, rating: 5, brand: 'HP', category: 'laptops' },
    ]
  }
  if (cat === 'televisions') {
    return [
      { id: 'tv-2', name: 'MoTech TV 55" 4K', image: '../../assets/images/redmi note 12.png', price: 499, oldPrice: 599, rating: 5, brand: 'MoTech', category: 'televisions' },
      { id: 'tv-3', name: 'MoTech TV 65" 4K', image: '../../assets/images/redmi note 12.png', price: 699, oldPrice: 799, rating: 5, brand: 'MoTech', category: 'televisions' },
      { id: 'tv-6', name: 'MoTech TV 50" 4K', image: '../../assets/images/redmi note 12.png', price: 399, oldPrice: 499, rating: 5, brand: 'MoTech', category: 'televisions' },
      { id: 'tv-8', name: 'MoTech TV 85" 4K', image: '../../assets/images/redmi note 12.png', price: 1499, oldPrice: 1699, rating: 5, brand: 'MoTech', category: 'televisions' },
    ]
  }
  if (cat === 'smartwatches') {
    return [
      { id: 'sw-1', name: 'MoTech Watch S1', image: '../../assets/images/redmi note 12.png', price: 99, oldPrice: 129, rating: 5, brand: 'MoTech', category: 'smartwatches' },
      { id: 'sw-2', name: 'MoTech Watch Pro', image: '../../assets/images/redmi note 12.png', price: 149, oldPrice: 199, rating: 5, brand: 'MoTech', category: 'smartwatches' },
      { id: 'sw-7', name: 'MoTech Watch S2', image: '../../assets/images/redmi note 12.png', price: 129, oldPrice: 159, rating: 5, brand: 'MoTech', category: 'smartwatches' },
      { id: 'sw-8', name: 'MoTech Watch Ultra', image: '../../assets/images/redmi note 12.png', price: 249, oldPrice: 299, rating: 5, brand: 'MoTech', category: 'smartwatches' },
    ]
  }
  // phones default
  return [
    { id: 'ph-2', name: 'redmi note 12', image: '../../assets/images/redmi note 12.png', price: 136, oldPrice: 206, rating: 5, brand: 'Xiaomi', category: 'phones' },
    { id: 'ph-7', name: 'tecno spark 5', image: '../../assets/images/techno spark 5.png', price: 159, oldPrice: 189, rating: 5, brand: 'Tecno', category: 'phones' },
    { id: 'ph-8', name: 'redmi 10 2022 pro', image: '../../assets/images/xiaomi redmi 10 2022 pro.png', price: 219, oldPrice: 269, rating: 5, brand: 'Xiaomi', category: 'phones' },
    { id: 'ph-3', name: 'iphone 12', image: '../../assets/images/iphone12.png', price: 699, oldPrice: 799, rating: 5, brand: 'Apple', category: 'phones' },
  ]
})

const gotoProduct = (p) => {
  try { sessionStorage.setItem('selectedProduct', JSON.stringify(p)) } catch {}
  router.push({ name: 'product-page', params: { id: p.id } })
}

function uniq(arr) {
  return arr.filter((v, i, a) => a.indexOf(v) === i)
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
            <button type="submit" class="text-sm sm:text-base px-2 sm:px-4 py-3 rounded-md w-40 bg-[#ffcf10] basis-[48%] capitalize">Proceed to buy</button>
            <button type="submit" class="text-sm sm:text-base px-2 sm:px-4 py-3 rounded-md w-40 bg-[#68a4fe] basis-[48%] text-white capitalize">save for later</button>
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
          <div class="delivery-timeline text-sm my-4">Delivery by: <span>March 29 - April 1</span></div>
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
          <div class="flex justify-center items-center">
            <button type="button" class="product-image" @click="gotoProduct(rp)">
              <img :src="resolveImg(rp.image)" :alt="rp.name" />
            </button>
          </div>
          <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(rp)">
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
          <button class="add-cart-btn text-xs">add to cart</button>
        </div>
      </div>
      </section>
    </main>
    <Footer/>
</template>