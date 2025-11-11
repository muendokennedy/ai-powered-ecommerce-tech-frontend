<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { PlusIcon, MinusIcon, StarIcon } from '@heroicons/vue/24/solid'

const router = useRouter()

// Check if user is logged in
const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true')

// Reactive cart loaded from sessionStorage
const cartItems = ref([])

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

function resolveImg(p) {

  console.log(p)
  // Normalize to '/src/assets/...'
  // const fallback = '../../src/assets/images/redmi note 12.png'
  // if (!p) return fallback
  // if (/^(https?:)\/\//.test(p) || /^data:/.test(p)) return p
  // Already absolute to src
  if (p.startsWith('/src/')) return p
  // Alias to src
  if (p.startsWith('@/')) return p.replace(/^@\//, '/src/')
  // Public assets patterns
  if (p.startsWith('/assets/') || p.startsWith('/images/') || p.startsWith('/img/')) return `/src${p}`
  // Relative paths containing assets/ -> coerce to /src/assets/...
  const idx = p.indexOf('assets/')
  if (idx !== -1) return `/src/${p.slice(idx)}`
  // As a last resort, return as-is
  return p
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
                  class="h-auto scale-30 sm:h-full object-contain"
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
            class="shopping-cart-box flex flex-col sm:flex-row justify-between items-center sm:items-start p-4 h-auto sm:h-48 w-full border-b-2 border-gray-300 my-4"
          >
            <div class="cart-image h-full">
              <img
                src="../assets/images/redmi note 12.png"
                alt="A cart item"
                class="md:-translate-y-4 h-auto scale-50 sm:scale-100 sm:h-full"
              />
            </div>
            <div class="cart-info h-full flex flex-col justify-between">
              <div class="space-y-2">
                <div class="product-name font-semibold text-base sm:text-xl capitalize">
                  redmi note 12
                </div>
                <div class="product-text text-sm">From redmi</div>
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
              <div
                class="product-price self-end text-[#FF412C] text-lg font-normal"
              >
                $316
              </div>
              <div class="action-button mt-4 sm:mt-0 flex items-center gap-4">
                <button
                  type="submit"
                  class="px-4 py-2 bg-[#ffcf10] rounded-md text-white text-center"
                >
                  Remove
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-[#68a4fe] rounded-md text-white text-center"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          <div
            class="shopping-cart-box flex flex-col sm:flex-row justify-between items-center sm:items-start p-4 h-auto sm:h-48 w-full border-b-2 border-gray-300 my-4"
          >
            <div class="cart-image h-full">
              <img
                src="../assets/images/redmi note 12.png"
                alt="A cart item"
                class="md:-translate-y-4 h-auto scale-50 sm:scale-100 sm:h-full"
              />
            </div>
            <div class="cart-info h-full flex flex-col justify-between">
              <div class="space-y-2">
                <div class="product-name font-semibold text-base sm:text-xl capitalize">
                  redmi note 12
                </div>
                <div class="product-text text-sm">From redmi</div>
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
              <div
                class="product-price self-end text-[#FF412C] text-lg font-normal"
              >
                $316
              </div>
              <div class="action-button mt-4 sm:mt-0 flex items-center gap-4">
                <button
                  type="submit"
                  class="px-4 py-2 bg-[#ffcf10] rounded-md text-white text-center"
                >
                  Remove
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-[#68a4fe] rounded-md text-white text-center"
                >
                Add to Cart
                </button>
              </div>
            </div>
          </div>
          <div
            class="shopping-cart-box flex flex-col sm:flex-row justify-between items-center sm:items-start p-4 h-auto sm:h-48 w-full border-b-2 border-gray-300 my-4"
          >
            <div class="cart-image h-full">
              <img
                src="../assets/images/redmi note 12.png"
                alt="A cart item"
                class="md:-translate-y-4 h-auto scale-50 sm:scale-100 sm:h-full"
              />
            </div>
            <div class="cart-info h-full flex flex-col justify-between">
              <div class="space-y-2">
                <div class="product-name font-semibold text-base sm:text-xl capitalize">
                  redmi note 12
                </div>
                <div class="product-text text-sm">From redmi</div>
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
              <div
                class="product-price self-end text-[#FF412C] text-lg font-normal"
              >
                $316
              </div>
              <div class="action-button mt-4 sm:mt-0 flex items-center gap-4">
                <button
                  type="submit"
                  class="px-4 py-2 bg-[#ffcf10] rounded-md text-white text-center"
                >
                  Remove
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-[#68a4fe] rounded-md text-white text-center"
                >
                Add to Cart
                </button>
              </div>
            </div>
          </div>
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
        <div class="product-box text-center my-2 sm:my-4">
          <div class="flex justify-center items-center">
            <div class="product-image">
              <img src="../assets/images/redmi note 12.png" alt="A mobile phone"/>
            </div>
          </div>
          <div class="product-title text-sm font-normal sm:font-semibold">
            infinix hot 12
          </div>
          <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
          </div>
          <div class="first-price my-1 sm:my-3 font-semibold">$136</div>
          <button class="add-cart-btn text-xs">add to cart</button>
        </div>
        <div class="product-box text-center my-2 sm:my-4">
          <div class="flex justify-center items-center">
            <div class="product-image">
              <img src="../assets/images/redmi note 12.png" alt="A mobile phone"/>
            </div>
          </div>
          <div class="product-title text-sm font-normal sm:font-semibold">
            infinix hot 12
          </div>
          <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
          </div>
          <div class="first-price my-1 sm:my-3 font-semibold">$136</div>
          <button class="add-cart-btn text-xs">add to cart</button>
        </div>
        <div class="product-box text-center my-2 sm:my-4">
          <div class="flex justify-center items-center">
            <div class="product-image">
              <img src="../assets/images/redmi note 12.png" alt="A mobile phone"/>
            </div>
          </div>
          <div class="product-title text-sm font-normal sm:font-semibold">
            infinix hot 12
          </div>
          <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
          </div>
          <div class="first-price my-1 sm:my-3 font-semibold">$136</div>
          <button class="add-cart-btn text-xs">add to cart</button>
        </div>
        <div class="product-box text-center my-2 sm:my-4">
          <div class="flex justify-center items-center">
            <div class="product-image">
              <img src="../assets/images/redmi note 12.png" alt="A mobile phone"/>
            </div>
          </div>
          <div class="product-title text-sm font-normal sm:font-semibold">
            infinix hot 12
          </div>
          <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
          </div>
          <div class="first-price my-1 sm:my-3 font-semibold">$136</div>
          <button class="add-cart-btn text-xs">add to cart</button>
        </div>
        <div class="product-box text-center my-2 sm:my-4">
          <div class="flex justify-center items-center">
            <div class="product-image">
              <img src="../assets/images/redmi note 12.png" alt="A mobile phone"/>
            </div>
          </div>
          <div class="product-title text-sm font-normal sm:font-semibold">
            infinix hot 12
          </div>
          <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
          </div>
          <div class="first-price my-1 sm:my-3 font-semibold">$136</div>
          <button class="add-cart-btn text-xs">add to cart</button>
        </div>
      </div>
      </section>
    </main>
    <Footer/>
</template>
