<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { CreditCardIcon, DevicePhoneMobileIcon, StarIcon } from '@heroicons/vue/24/solid'

// Reactive data
const selectedPaymentMethod = ref('')
const showLoginModal = ref(false)
const showLocationModal = ref(false)
const isLoggedIn = ref(false) // Change this to true to simulate logged in user
const userLocation = ref({
  address: '',
  city: '',
  country: ''
})

// Payment form data
const cardDetails = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardholderName: ''
})

const paypalDetails = ref({
  email: '',
  password: ''
})

const mpesaDetails = ref({
  phoneNumber: ''
})

// Order items (you can replace this with props or store data)
const orderItems = ref([
  {
    id: 1,
    name: 'redmi note 12',
    brand: 'From redmi',
    price: 316,
    quantity: 2,
    image: '/src/assets/images/redmi note 12.png',
    rating: 5,
    reviews: '100,450 Ratings'
  }
])

// Computed values
const subtotal = orderItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
const shipping = 15
const tax = Math.round(subtotal * 0.08)
const total = subtotal + shipping + tax

// Methods
const selectPaymentMethod = (method) => {
  selectedPaymentMethod.value = method
}

const completeOrder = () => {
  if (!isLoggedIn.value) {
    showLoginModal.value = true
  } else {
    showLocationModal.value = true
  }
}

const handleLogin = () => {
  // Simulate login
  isLoggedIn.value = true
  showLoginModal.value = false
  showLocationModal.value = true
}

const handleLocationSubmit = () => {
  // Process order
  showLocationModal.value = false
  alert('Order placed successfully!')
}

const closeModals = () => {
  showLoginModal.value = false
  showLocationModal.value = false
}
</script>

<template>
  <Header/>
  <main class="menu-toggle">
    <section class="checkout mx-auto pt-16 px-[4%] lg:max-w-[1500px]">
      <div class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize">
        checkout
      </div>
      
      <div class="checkout-section flex flex-col lg:flex-row justify-between w-full gap-8 mt-8">
        <!-- Order Summary Section (Now on the left on larger screens) -->
        <div class="order-summary w-full lg:w-2/5 order-2 lg:order-1">
          <div class="order-summary-container border-2 border-gray-300 rounded-lg">
            <h2 class="order-summary-title capitalize border-b-2 border-gray-300 px-4 py-4 text-center text-base sm:text-xl font-semibold text-[#384857]">
              <i class="fa-solid fa-receipt font-extrabold text-xl mr-2"></i>
              <span>order summary</span>
            </h2>
            
            <div class="order-items p-4 space-y-4">
              <div 
                v-for="item in orderItems" 
                :key="item.id"
                class="order-item flex items-center gap-4 pb-4 border-b border-gray-200"
              >
                <img 
                  :src="item.image" 
                  :alt="item.name"
                  class="w-16 h-16 object-contain"
                />
                <div class="item-details flex-1">
                  <div class="product-name font-semibold text-sm text-[#384857] capitalize">
                    {{ item.name }}
                  </div>
                  <div class="product-brand text-xs text-gray-600">{{ item.brand }}</div>
                  <div class="rating-box flex gap-1 items-center mt-1">
                    <div class="star-box text-[#FFCF10]">
                      <StarIcon class="size-3 inline" v-for="n in item.rating" :key="n"></StarIcon>
                    </div>
                  </div>
                  <div class="quantity-price text-xs text-[#384857] mt-1">
                    Qty: {{ item.quantity }} × ${{ item.price }}
                  </div>
                </div>
                <div class="item-total text-[#FF412C] font-semibold">
                  ${{ item.price * item.quantity }}
                </div>
              </div>
            </div>
            
            <div class="order-totals p-4 space-y-3">
              <div class="subtotal flex justify-between text-[#384857]">
                <span>Subtotal:</span>
                <span>${{ subtotal }}</span>
              </div>
              <div class="shipping flex justify-between text-[#384857]">
                <span>Shipping:</span>
                <span>${{ shipping }}</span>
              </div>
              <div class="tax flex justify-between text-[#384857]">
                <span>Tax:</span>
                <span>${{ tax }}</span>
              </div>
              <div class="border-t pt-3">
                <div class="total flex justify-between text-[#384857] font-semibold text-lg">
                  <span>Total:</span>
                  <span class="text-[#FF412C]">${{ total }}</span>
                </div>
              </div>
            </div>
            
            <div class="p-4">
              <button
                @click="completeOrder"
                class="w-full px-6 py-3 bg-[#ffcf10] hover:bg-[#e6ba0f] rounded-md text-white font-semibold text-center transition-colors duration-300"
              >
                Complete Order
              </button>
            </div>
          </div>
        </div>
        
        <!-- Payment Methods Section (Now on the right) -->
        <div class="payment-section w-full lg:w-3/5 order-1 lg:order-2">
          <div class="payment-methods bg-white border-2 border-gray-300 rounded-lg p-6">
            <h2 class="text-[#384857] text-lg sm:text-xl font-semibold mb-6 capitalize">
              payment method
            </h2>
            
            <div class="payment-options space-y-4">
              <!-- Credit/Debit Card Option (Combined like Stripe) -->
              <div class="card-payment">
                <div 
                  @click="selectPaymentMethod('card')"
                  class="payment-option flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:border-[#68a4fe]"
                  :class="selectedPaymentMethod === 'card' ? 'border-[#68a4fe] bg-blue-50' : 'border-gray-300'"
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card" 
                    v-model="selectedPaymentMethod"
                    class="w-4 h-4 text-[#68a4fe]"
                  >
                  <div class="flex items-center mx-4 space-x-2">
                    <div class="w-20 h-4 mx-4">
                      <img src="../assets/images/visa and mastercard.jpeg" alt="" class="w-full h-full">
                    </div>
                  </div>
                  <span class="text-[#384857] font-medium">Credit or Debit Card</span>
                </div>
                
                <!-- Card Details Form (Expandable) -->
                <div v-if="selectedPaymentMethod === 'card'" class="card-form mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div class="grid grid-cols-1 gap-4">
                    <input
                      v-model="cardDetails.cardNumber"
                      type="text"
                      placeholder="1234 1234 1234 1234"
                      class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
                      maxlength="19"
                    />
                    <input
                      v-model="cardDetails.cardholderName"
                      type="text"
                      placeholder="Cardholder Name"
                      class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
                    />
                    <div class="grid grid-cols-2 gap-4">
                      <input
                        v-model="cardDetails.expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
                        maxlength="5"
                      />
                      <input
                        v-model="cardDetails.cvv"
                        type="text"
                        placeholder="CVV"
                        class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
                        maxlength="4"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- PayPal -->
              <div class="paypal-payment">
                <div 
                  @click="selectPaymentMethod('paypal')"
                  class="payment-option flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:border-[#68a4fe]"
                  :class="selectedPaymentMethod === 'paypal' ? 'border-[#68a4fe] bg-blue-50' : 'border-gray-300'"
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="paypal" 
                    v-model="selectedPaymentMethod"
                    class="w-4 h-4 text-[#68a4fe]"
                  >
                  <div class="w-20 h-4 mx-4">
                    <img src="../assets/images/paypal image.png" class="w-full h-full" alt="">
                  </div>
                  <span class="text-[#384857] font-medium">PayPal</span>
                </div>
                
                <!-- PayPal Details Form (Expandable) -->
                <div v-if="selectedPaymentMethod === 'paypal'" class="paypal-form mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <input
                    v-model="paypalDetails.email"
                    type="email"
                    placeholder="PayPal Email"
                    class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
                  />
                  <input
                    v-model="paypalDetails.password"
                    type="password"
                    placeholder="PayPal Password"
                    class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
                  />
                </div>
              </div>
              
              <!-- M-Pesa -->
              <div class="mpesa-payment">
                <div 
                  @click="selectPaymentMethod('mpesa')"
                  class="payment-option flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:border-[#68a4fe]"
                  :class="selectedPaymentMethod === 'mpesa' ? 'border-[#68a4fe] bg-blue-50' : 'border-gray-300'"
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="mpesa" 
                    v-model="selectedPaymentMethod"
                    class="w-4 h-4 text-[#68a4fe]"
                  >
                  <div class="w-24 h-8 mx-4">
                    <img src="../assets/images/mpesa image.png" alt="" class="w-full h-full">
                  </div>
                  <span class="text-[#384857] font-medium">M-Pesa</span>
                </div>
                
                <!-- M-Pesa Details Form (Expandable) -->
                <div v-if="selectedPaymentMethod === 'mpesa'" class="mpesa-form mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <input
                    v-model="mpesaDetails.phoneNumber"
                    type="tel"
                    placeholder="Phone Number (e.g., +254712345678)"
                    class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
                  />
                  <div class="text-sm text-gray-600">
                    <p>You will receive an M-Pesa prompt on your phone to complete the payment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        

      </div>
    </section>
  </main>
  
  <!-- Login Modal -->
  <div v-if="showLoginModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
      <h3 class="text-xl font-semibold text-[#384857] mb-4">Login Required</h3>
      <p class="text-[#384857] mb-6">Please login to complete your order</p>
      <div class="space-y-4">
        <input
          type="email"
          placeholder="Email"
          class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
        />
        <input
          type="password"
          placeholder="Password"
          class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
        />
      </div>
      <div class="flex gap-4 mt-6">
        <button
          @click="closeModals"
          class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md text-[#384857] hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="handleLogin"
          class="flex-1 px-4 py-2 bg-[#68a4fe] rounded-md text-white hover:bg-[#5a94fe]"
        >
          Login
        </button>
      </div>
    </div>
  </div>
  
  <!-- Location Modal -->
  <div v-if="showLocationModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
      <h3 class="text-xl font-semibold text-[#384857] mb-4">Delivery Information</h3>
      <p class="text-[#384857] mb-6">Please provide your delivery address</p>
      <div class="space-y-4">
        <input
          v-model="userLocation.address"
          type="text"
          placeholder="Street Address"
          class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
        />
        <input
          v-model="userLocation.city"
          type="text"
          placeholder="City"
          class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
        />
        <input
          v-model="userLocation.country"
          type="text"
          placeholder="Country"
          class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"
        />
      </div>
      <div class="flex gap-4 mt-6">
        <button
          @click="closeModals"
          class="flex-1 px-4 py-2 border-2 border-gray-300 rounded-md text-[#384857] hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="handleLocationSubmit"
          class="flex-1 px-4 py-2 bg-[#ffcf10] rounded-md text-white hover:bg-[#e6ba0f]"
        >
          Place Order
        </button>
      </div>
    </div>
  </div>
  
  <Footer/>
</template>

<style scoped>
/* Additional custom styles if needed */
.payment-option {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.payment-option:hover {
  box-shadow: 0 4px 12px rgba(104, 164, 254, 0.15);
}

/* Smooth transitions for expandable forms */
.card-form, .paypal-form, .mpesa-form {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced backdrop blur for modals */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}
</style>