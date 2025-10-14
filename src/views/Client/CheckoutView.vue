<script setup>
import { ref, onMounted } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { StarIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'

// Reactive data
const selectedPaymentMethod = ref('')
const showLocationModal = ref(false)
const showErrorMessage = ref(false)
const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true') // Check login status from localStorage
const userLocation = ref({
  address: '',
  apartment: '',
  landmark: '',
  city: '',
  state: '',
  postalCode: '',
  country: ''
})

// Map & geolocation state
const mapVisible = ref(false)
const isLoadingMap = ref(false)
const geolocating = ref(false)
const coords = ref({ lat: null, lng: null })
const mapError = ref('')
let mapInstance = null
let mapMarker = null
const mapEl = ref(null)
let leafletLoaded = false
const mapProvider = ref('') // 'google' | 'leaflet'
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
function isKeyEnabled(val) {
  if (val === undefined || val === null) return false
  const s = String(val).trim()
  if (!s) return false
  return !/^(false|0|no|off|null|undefined)$/i.test(s)
}
const GOOGLE_KEY_ENABLED = isKeyEnabled(GOOGLE_MAPS_API_KEY)
let googleLoaded = false

function loadLeafletAssetsOnce() {
  return new Promise((resolve, reject) => {
    if (leafletLoaded && window.L) return resolve()
    // CSS
    const cssId = 'leaflet-css'
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link')
      link.id = cssId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    // JS
    const scriptId = 'leaflet-js'
    if (document.getElementById(scriptId)) {
      const check = () => window.L ? resolve() : setTimeout(check, 50)
      return check()
    }
    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.async = true
    script.onload = () => { leafletLoaded = true; resolve() }
    script.onerror = (e) => reject(e)
    document.body.appendChild(script)
  })
}

async function initMap() {
  if (mapInstance || !mapEl.value) return
  isLoadingMap.value = true
  try {
    if (GOOGLE_KEY_ENABLED) {
      try {
        await loadGoogleMapsOnce()
      } catch (e) {
        mapError.value = (e && e.message) ? e.message : 'Failed to load Google Maps. Falling back to OpenStreetMap.'
        await fallbackToLeaflet()
        return
      }
      const gmaps = window.google.maps
      mapProvider.value = 'google'
      mapInstance = new gmaps.Map(mapEl.value, {
        center: { lat: 0.0236, lng: 37.9062 },
        zoom: 5,
        disableDefaultUI: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })
      mapInstance.addListener('click', (e) => {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        setMarker(lat, lng)
        reverseGeocode(lat, lng)
      })
    } else {
      await fallbackToLeaflet()
    }
  } finally {
    isLoadingMap.value = false
  }
}

async function fallbackToLeaflet() {
  try {
    await loadLeafletAssetsOnce()
    const L = window.L
    mapProvider.value = 'leaflet'
    mapInstance = L.map(mapEl.value).setView([0.0236, 37.9062], 5) // Default: Kenya view
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance)
    mapInstance.on('click', (e) => {
      setMarker(e.latlng.lat, e.latlng.lng)
      reverseGeocode(e.latlng.lat, e.latlng.lng)
    })
  } catch (e) {
    mapError.value = mapError.value || 'Failed to initialize fallback map.'
  }
}

function setMarker(lat, lng) {
  coords.value = { lat, lng }
  if (mapProvider.value === 'google') {
    const gmaps = window.google.maps
    if (!gmaps || !mapInstance) return
    if (mapMarker) {
      mapMarker.setPosition({ lat, lng })
    } else {
      mapMarker = new gmaps.Marker({ position: { lat, lng }, map: mapInstance, draggable: true })
      mapMarker.addListener('dragend', () => {
        const pos = mapMarker.getPosition()
        const nlat = pos.lat()
        const nlng = pos.lng()
        coords.value = { lat: nlat, lng: nlng }
        reverseGeocode(nlat, nlng)
      })
    }
    mapInstance.setCenter({ lat, lng })
    mapInstance.setZoom(15)
  } else {
    const L = window.L
    if (!L || !mapInstance) return
    if (mapMarker) {
      mapMarker.setLatLng([lat, lng])
    } else {
      mapMarker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance)
      mapMarker.on('dragend', () => {
        const pos = mapMarker.getLatLng()
        coords.value = { lat: pos.lat, lng: pos.lng }
        reverseGeocode(pos.lat, pos.lng)
      })
    }
    mapInstance.setView([lat, lng], 15)
  }
}

async function reverseGeocode(lat, lng) {
  try {
    if (mapProvider.value === 'google' && window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      const result = await geocoder.geocode({ location: { lat, lng } })
        .then(r => (r && r.results && r.results.length > 0) ? r.results[0] : null)
        .catch(() => null)
      if (result) {
        const comps = result.address_components || []
        const get = (type) => {
          const c = comps.find(x => x.types && x.types.includes(type))
          return c ? (c.long_name || c.short_name || '') : ''
        }
        const streetNumber = get('street_number')
        const route = get('route')
        const addressLine = [streetNumber, route].filter(Boolean).join(' ') || result.formatted_address?.split(',')[0] || ''
        const city = get('locality') || get('postal_town') || get('sublocality') || get('administrative_area_level_2')
        const state = get('administrative_area_level_1')
        const postalCode = get('postal_code')
        const country = get('country')

        userLocation.value.address = addressLine || userLocation.value.address
        userLocation.value.city = city || userLocation.value.city
        userLocation.value.state = state || userLocation.value.state
        userLocation.value.postalCode = postalCode || userLocation.value.postalCode
        userLocation.value.country = country || userLocation.value.country
      }
    } else {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) {
        return
      }
      const data = await res.json()
      const addr = data.address || {}
      const addressLine = data.display_name?.split(',').slice(0, 2).join(', ')
      userLocation.value.address = addressLine || userLocation.value.address
      userLocation.value.city = addr.city || addr.town || addr.village || userLocation.value.city
      userLocation.value.state = addr.state || userLocation.value.state
      userLocation.value.postalCode = addr.postcode || userLocation.value.postalCode
      userLocation.value.country = addr.country || userLocation.value.country
    }
  } catch (e) {
    // silently ignore
  }
}

function toggleMap() {
  mapVisible.value = !mapVisible.value
  if (mapVisible.value) {
    // next tick not imported; simple timeout to allow DOM paint
    setTimeout(() => initMap(), 0)
  }
}

function useMyLocation() {
  if (!navigator.geolocation) return
  geolocating.value = true
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords
    if (!mapInstance) await initMap()
    setMarker(latitude, longitude)
    reverseGeocode(latitude, longitude)
    geolocating.value = false
    if (!mapVisible.value) mapVisible.value = true
  }, () => {
    geolocating.value = false
  }, { enableHighAccuracy: true, timeout: 10000 })
}

onMounted(() => {
  // Optionally preload assets in background for faster open
  if (GOOGLE_KEY_ENABLED) {
    loadGoogleMapsOnce().catch((e) => {
      mapError.value = (e && e.message) ? e.message : 'Failed to preload Google Maps.'
      // Preload Leaflet as a fallback so the first open is still fast
      loadLeafletAssetsOnce().catch(() => {})
    })
  } else {
    loadLeafletAssetsOnce().catch(() => {})
  }
})

function loadGoogleMapsOnce() {
  return new Promise((resolve, reject) => {
    if (googleLoaded && window.google && window.google.maps) return resolve()
    const scriptId = 'google-maps-js'
    if (document.getElementById(scriptId)) {
      const check = () => (window.google && window.google.maps) ? resolve() : setTimeout(check, 50)
      return check()
    }
    // Handle Google auth failures (e.g., invalid key, billing, referrer restrictions)
    window.gm_authFailure = async () => {
      mapError.value = 'Google Maps authentication failed. Falling back to OpenStreetMap. Verify API key, enable billing, allow your domain (e.g., http://localhost:5173), and enable the Maps JavaScript API.'
      await fallbackToLeaflet()
    }
    if (!GOOGLE_KEY_ENABLED) {
      return reject(new Error('Missing or disabled Google Maps API Key'))
    }
    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=quarterly`
    script.async = true
    script.defer = true
    script.onload = () => { googleLoaded = true; resolve() }
    script.onerror = async (e) => {
      mapError.value = 'Failed to load Google Maps script. Falling back to OpenStreetMap.'
      await fallbackToLeaflet()
      reject(e)
    }
    document.body.appendChild(script)
  })
}

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
  // Check if payment method is selected
  if (!selectedPaymentMethod.value) {
    showErrorMessage.value = true
    // Auto-hide error message after 3 seconds
    setTimeout(() => {
      showErrorMessage.value = false
    }, 3000)
    return
  }
  
  // Since we're on checkout page, user should already be logged in
  // If not logged in, they wouldn't have reached this page
  showLocationModal.value = true
}

const handleLocationSubmit = () => {
  // Process order
  showLocationModal.value = false
  alert('Order placed successfully!')
}

const closeModals = () => {
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
      
      <!-- Delivery Location (full-width) -->
      <div class="delivery-location-container border-2 border-gray-300 rounded-lg mt-6 mb-6 overflow-hidden w-full">
        <h2 class="border-b-2 border-gray-300 px-4 py-4 text-center text-base sm:text-xl font-semibold text-[#384857] capitalize">
          <i class="fa-solid fa-location-dot font-extrabold text-xl mr-2"></i>
          <span>delivery location</span>
        </h2>
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-1 gap-3">
            <input v-model="userLocation.address" type="text" placeholder="Street address" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]" />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input v-model="userLocation.apartment" type="text" placeholder="Apartment / Suite (optional)" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]" />
              <input v-model="userLocation.landmark" type="text" placeholder="Nearby landmark (optional)" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input v-model="userLocation.city" type="text" placeholder="City / Town" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]" />
              <input v-model="userLocation.state" type="text" placeholder="State / Region" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input v-model="userLocation.postalCode" type="text" placeholder="Postal Code" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]" />
              <input v-model="userLocation.country" type="text" placeholder="Country" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]" />
            </div>
            <textarea v-model="userLocation.instructions" rows="3" placeholder="Delivery instructions (optional)" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"></textarea>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="text-xs text-gray-600">
              <span class="font-medium text-[#384857]">Coordinates:</span>
              <span class="ml-2">{{ coords.lat ? coords.lat.toFixed(5) : '—' }}, {{ coords.lng ? coords.lng.toFixed(5) : '—' }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="toggleMap" class="px-3 py-2 border-2 border-gray-300 rounded-md text-[#384857] hover:bg-gray-50 text-sm">
                {{ mapVisible ? 'Hide map' : 'Pick on map' }}
              </button>
              <button @click="useMyLocation" class="px-3 py-2 bg-[#68a4fe] hover:bg-[#5496f8] rounded-md text-white text-sm flex items-center gap-2">
                <i class="fa-solid fa-location-crosshairs"></i>
                <span>{{ geolocating ? 'Locating…' : 'Use my location' }}</span>
              </button>
            </div>
          </div>
          <div v-show="mapVisible" class="rounded-md border-2 border-gray-300 overflow-hidden relative z-0">
            <div ref="mapEl" class="h-60 w-full relative z-0"></div>
            <div v-if="isLoadingMap" class="p-3 text-center text-sm text-gray-600">Loading map…</div>
            <div v-if="mapError" class="p-3 text-sm text-red-600 bg-red-50 border-t border-red-200">
              <p class="font-medium mb-1">Map error</p>
              <p class="mb-2">{{ mapError }}</p>
              <ul class="list-disc ml-5 text-red-700">
                <li>Ensure VITE_GOOGLE_MAPS_API_KEY is set in .env.local</li>
                <li>Enable billing and the Maps JavaScript API in Google Cloud Console</li>
                <li>Check HTTP referrers (add your dev URL, e.g., http://localhost:5173)</li>
                <li>Reload the dev server after changing env variables</li>
              </ul>
            </div>
          </div>
        </div>
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
              <!-- Error Message -->
              <div 
                v-if="showErrorMessage" 
                class="error-message mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm animate-slide-in flex items-center"
              >
                <ExclamationTriangleIcon class="w-5 h-5 mr-2" />
                Please select a payment method before completing your order.
              </div>
              
              <button
                @click="completeOrder"
                class="w-full px-6 py-3 bg-[#68a4fe] hover:bg-[#5496f8] rounded-md text-white font-semibold text-center transition-colors duration-300"
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
                      <img src="../../assets/images/visa and mastercard.jpeg" alt="" class="w-full h-full">
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
                    <img src="../../assets/images/paypal image.png" class="w-full h-full" alt="">
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
                    <img src="../../assets/images/mpesa image.png" alt="" class="w-full h-full">
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

/* Error message slide-in animation */
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
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

/* Ensure map layers never overlay fixed headers/menus */
:deep(.leaflet-container) { z-index: 0 !important; }
:deep(.leaflet-pane) { z-index: 0 !important; }
:deep(.leaflet-top), :deep(.leaflet-bottom) { z-index: 0 !important; }
:deep(.gm-style) { z-index: 0 !important; }
</style>