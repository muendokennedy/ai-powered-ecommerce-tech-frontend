<script setup>
import { ref, computed } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

// Centralized products list with category field
const products = ref([
  // Phones
  { id: 'ph-1', category: 'phones', name: 'infinix hot 12', image: '/src/assets/images/redmi note 12.png', price: 136, oldPrice: 206, rating: 5 },
  { id: 'ph-2', category: 'phones', name: 'redmi note 12', image: '/src/assets/images/redmi note 12.png', price: 136, oldPrice: 206, rating: 5 },
  { id: 'ph-3', category: 'phones', name: 'iphone 12', image: '/src/assets/images/iphone12.png', price: 699, oldPrice: 799, rating: 5 },
  { id: 'ph-4', category: 'phones', name: 'iphone 14', image: '/src/assets/images/iphone14.png', price: 899, oldPrice: 999, rating: 5 },
  { id: 'ph-5', category: 'phones', name: 'tecno camon 18p', image: '/src/assets/images/techno camon 18p.png', price: 249, oldPrice: 299, rating: 5 },
  { id: 'ph-6', category: 'phones', name: 'infinix smart 7 plus', image: '/src/assets/images/infinix smart 7 plus.png', price: 129, oldPrice: 169, rating: 5 },
  { id: 'ph-7', category: 'phones', name: 'tecno spark 5', image: '/src/assets/images/techno spark 5.png', price: 159, oldPrice: 189, rating: 5 },
  { id: 'ph-8', category: 'phones', name: 'xiaomi redmi 10 2022 pro', image: '/src/assets/images/xiaomi redmi 10 2022 pro.png', price: 219, oldPrice: 269, rating: 5 },

  // Laptops
  { id: 'lp-1', category: 'laptops', name: 'dell inspiron', image: '/src/assets/images/dell inspiron.png', price: 749, oldPrice: 899, rating: 5 },
  { id: 'lp-2', category: 'laptops', name: 'dell latitude 5320', image: '/src/assets/images/dell latitude 5320.png', price: 999, oldPrice: 1149, rating: 5 },
  { id: 'lp-3', category: 'laptops', name: 'hp laptop 15 ci7', image: '/src/assets/images/hp laptop 15 ci7.png', price: 1099, oldPrice: 1299, rating: 5 },
  { id: 'lp-4', category: 'laptops', name: 'dell inspiron (2024)', image: '/src/assets/images/dell inspiron.png', price: 799, oldPrice: 949, rating: 5 },
  { id: 'lp-5', category: 'laptops', name: 'hp laptop 15 ci7 (2024)', image: '/src/assets/images/hp laptop 15 ci7.png', price: 1029, oldPrice: 1249, rating: 5 },
  { id: 'lp-6', category: 'laptops', name: 'dell inspiron plus', image: '/src/assets/images/dell inspiron.png', price: 899, oldPrice: 1049, rating: 5 },
  { id: 'lp-7', category: 'laptops', name: 'dell latitude 5320 pro', image: '/src/assets/images/dell latitude 5320.png', price: 1049, oldPrice: 1199, rating: 5 },
  { id: 'lp-8', category: 'laptops', name: 'hp laptop 15 business', image: '/src/assets/images/hp laptop 15 ci7.png', price: 999, oldPrice: 1149, rating: 5 },

  // Smartwatches
  { id: 'sw-1', category: 'smartwatches', name: 'MoTech Watch S1', image: '/src/assets/images/redmi note 12.png', price: 99, oldPrice: 129, rating: 5 },
  { id: 'sw-2', category: 'smartwatches', name: 'MoTech Watch Pro', image: '/src/assets/images/redmi note 12.png', price: 149, oldPrice: 199, rating: 5 },
  { id: 'sw-3', category: 'smartwatches', name: 'MoTech Band 5', image: '/src/assets/images/redmi note 12.png', price: 49, oldPrice: 69, rating: 5 },
  { id: 'sw-4', category: 'smartwatches', name: 'MoTech Watch X', image: '/src/assets/images/redmi note 12.png', price: 179, oldPrice: 229, rating: 5 },
  { id: 'sw-5', category: 'smartwatches', name: 'MoTech Watch Lite', image: '/src/assets/images/redmi note 12.png', price: 79, oldPrice: 109, rating: 5 },
  { id: 'sw-6', category: 'smartwatches', name: 'MoTech Band 6', image: '/src/assets/images/redmi note 12.png', price: 59, oldPrice: 79, rating: 5 },
  { id: 'sw-7', category: 'smartwatches', name: 'MoTech Watch S2', image: '/src/assets/images/redmi note 12.png', price: 129, oldPrice: 159, rating: 5 },
  { id: 'sw-8', category: 'smartwatches', name: 'MoTech Watch Ultra', image: '/src/assets/images/redmi note 12.png', price: 249, oldPrice: 299, rating: 5 },

  // Televisions
  { id: 'tv-1', category: 'televisions', name: 'MoTech TV 43" FHD', image: '/src/assets/images/redmi note 12.png', price: 299, oldPrice: 349, rating: 5 },
  { id: 'tv-2', category: 'televisions', name: 'MoTech TV 55" 4K', image: '/src/assets/images/redmi note 12.png', price: 499, oldPrice: 599, rating: 5 },
  { id: 'tv-3', category: 'televisions', name: 'MoTech TV 65" 4K', image: '/src/assets/images/redmi note 12.png', price: 699, oldPrice: 799, rating: 5 },
  { id: 'tv-4', category: 'televisions', name: 'MoTech TV 75" 4K', image: '/src/assets/images/redmi note 12.png', price: 999, oldPrice: 1199, rating: 5 },
  { id: 'tv-5', category: 'televisions', name: 'MoTech TV 32" HD', image: '/src/assets/images/redmi note 12.png', price: 199, oldPrice: 249, rating: 5 },
  { id: 'tv-6', category: 'televisions', name: 'MoTech TV 50" 4K', image: '/src/assets/images/redmi note 12.png', price: 399, oldPrice: 499, rating: 5 },
  { id: 'tv-7', category: 'televisions', name: 'MoTech TV 58" 4K', image: '/src/assets/images/redmi note 12.png', price: 449, oldPrice: 549, rating: 5 },
  { id: 'tv-8', category: 'televisions', name: 'MoTech TV 85" 4K', image: '/src/assets/images/redmi note 12.png', price: 1499, oldPrice: 1699, rating: 5 }
])

// Category filter state
const selectedCategory = ref('All')
const selectedCategoryKey = computed(() => selectedCategory.value.toLowerCase())

const formatCurrency = (n) => `$${Number(n).toFixed(0)}`
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
        <div class="product-search flex w-full relative my-4">
          <input
            type="search"
            name="search-term"
            placeholder="Search here..."
            class="w-full p-2 sm:p-4 pr-[6rem] sm:pr-32 border-2 border-gray-300 rounded-md outline-none focus:border-[#68A4FE] placeholder:text-sm sm:placeholder:text-base text-sm sm:text-base"
          />
          <button
            type="submit"
            class="text-sm sm:text-base absolute top-1/2 -translate-y-1/2 right-2 bg-[#68A4FE] rounded-md px-4 py-1 sm:py-2 text-white hover:bg-[#384857] transition-all duration-300 ease-in-out capitalize"
          >
            search
          </button>
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
            <a href="#" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in products.filter(p => p.category==='phones')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
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
            <a href="#" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in products.filter(p => p.category==='laptops')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
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
            <a href="#" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in products.filter(p => p.category==='smartwatches')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
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
            <a href="#" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in products.filter(p => p.category==='televisions')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
        </div>
      </section>
    </main>
    <Footer/>
</template>
