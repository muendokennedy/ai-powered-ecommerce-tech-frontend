<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { StarIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/solid'

// Reactive data
const selectedPaymentMethod = ref('')
const showLocationModal = ref(false) // legacy – no longer used for UX, kept to avoid breakage
const showOrderSummaryModal = ref(false)
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
const personalInfo = ref({
  name: '',
  email: '',
  phone: ''
})
const personalInfoErrors = ref({
  name: '',
  email: '',
  phone: ''
})
const countryOptions = ref([
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'UG', name: 'Uganda', dial: '+256', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' }
])
const selectedCountry = ref(countryOptions.value[0])
const showCountryDropdown = ref(false)
const countryDropdownEl = ref(null)

function getFlagUrl(code) {
  return `https://flagcdn.com/24x18/${String(code || '').toLowerCase()}.png`
}

function selectCountry(c) {
  selectedCountry.value = c
  showCountryDropdown.value = false
}

function toggleCountryDropdown() {
  showCountryDropdown.value = !showCountryDropdown.value
}

function onDocClick(e) {
  if (!showCountryDropdown.value) return
  const el = countryDropdownEl.value
  if (el && !el.contains(e.target)) {
    showCountryDropdown.value = false
  }
}
const locationErrors = ref({
  address: '',
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
const deliverySectionEl = ref(null)
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
  document.addEventListener('click', onDocClick)
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

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
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

// Payment validation error state
const paymentErrors = ref({
  cardNumber: '',
  cardholderName: '',
  expiryDate: '',
  cvv: '',
  paypalEmail: '',
  paypalPassword: '',
  mpesaPhone: ''
})

function clearPaymentError(field) {
  if (paymentErrors.value[field]) paymentErrors.value[field] = ''
}

function luhnCheck(number) {
  const digits = number.replace(/\D/g, '')
  let sum = 0, shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits.charAt(i), 10)
    if (shouldDouble) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    shouldDouble = !shouldDouble
  }
  return (sum % 10) === 0
}

function validatePaymentDetails() {
  // Reset only relevant fields each run
  const errs = paymentErrors.value
  // Don't blank unrelated method errors here; instead clear per validation run
  if (selectedPaymentMethod.value === 'card') {
    errs.cardNumber = errs.cardholderName = errs.expiryDate = errs.cvv = ''
    const raw = cardDetails.value.cardNumber.replace(/\s+/g, '')
    if (!raw) errs.cardNumber = 'Card number is required'
    else if (!/^\d{13,19}$/.test(raw)) errs.cardNumber = 'Card number must be 13–19 digits'
    else if (!luhnCheck(raw)) errs.cardNumber = 'Invalid card number'
    const name = cardDetails.value.cardholderName.trim()
    if (!name) errs.cardholderName = 'Cardholder name is required'
    else if (name.length < 2) errs.cardholderName = 'Name too short'
    const exp = cardDetails.value.expiryDate.trim()
    if (!exp) errs.expiryDate = 'Expiry date is required'
    else if (!/^\d{2}\/\d{2}$/.test(exp)) errs.expiryDate = 'Use MM/YY format'
    else {
      const [mm, yy] = exp.split('/').map(x => parseInt(x, 10))
      if (mm < 1 || mm > 12) errs.expiryDate = 'Invalid month'
      else {
        const now = new Date()
        const year = 2000 + yy
        const expDate = new Date(year, mm)
        if (expDate <= now) errs.expiryDate = 'Card expired'
      }
    }
    const cvv = cardDetails.value.cvv.trim()
    if (!cvv) errs.cvv = 'CVV is required'
    else if (!/^\d{3,4}$/.test(cvv)) errs.cvv = 'CVV must be 3 or 4 digits'
    return !(errs.cardNumber || errs.cardholderName || errs.expiryDate || errs.cvv)
  }
  if (selectedPaymentMethod.value === 'paypal') {
    errs.paypalEmail = errs.paypalPassword = ''
    const email = paypalDetails.value.email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!email) errs.paypalEmail = 'Email is required'
    else if (!emailRegex.test(email)) errs.paypalEmail = 'Enter a valid email'
    const pw = paypalDetails.value.password
    if (!pw) errs.paypalPassword = 'Password is required'
    else if (pw.length < 6) errs.paypalPassword = 'Minimum 6 characters'
    return !(errs.paypalEmail || errs.paypalPassword)
  }
  if (selectedPaymentMethod.value === 'mpesa') {
    errs.mpesaPhone = ''
    const phone = mpesaDetails.value.phoneNumber.trim()
    if (!phone) errs.mpesaPhone = 'Phone number is required'
    else if (!/^(\+?254|0)?7\d{8}$/.test(phone)) errs.mpesaPhone = 'Enter valid Safaricom number'
    return !errs.mpesaPhone
  }
  return true
}

// Load cart items from session storage (populated in CartView / Product actions)
const orderItems = ref([])

function loadCartItems() {
  const raw = sessionStorage.getItem('cartItems')
  let parsed = []
  if (raw) {
    try { parsed = JSON.parse(raw) || [] } catch (_) { parsed = [] }
  }
  // Ensure each item has a quantity (default 1) and keep shape consistent
  orderItems.value = Array.isArray(parsed)
    ? parsed.map(p => ({ ...p, quantity: p.quantity || 1 }))
    : []
}

onMounted(() => {
  loadCartItems()
})

function resolveImg(path) {
  if (!path) return ''
  // Accept arrays (prefer first) or strings
  let p = Array.isArray(path) ? (path[0] || '') : String(path)
  p = p.trim().replace(/\\/g, '/')

  // If already an absolute URL or data URI, return as-is
  if (/^(https?:)?\/\//i.test(p) || /^data:/i.test(p)) return p

  // Remove current origin if it's been inlined accidentally
  const originEsc = window.location.origin.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  p = p.replace(new RegExp('^' + originEsc), '')

  // Strip leading slashes
  p = p.replace(/^\/+/, '')

  // Collapse duplicated src/assets/images prefixes anywhere in the string
  p = p.replace(/(^|\/)src\/assets\/images\//ig, '$1images/')
  p = p.replace(/^src\/assets\//i, '')
  p = p.replace(/^assets\//i, '')
  p = p.replace(/^public\//i, '')
  p = p.replace(/^src\/views\//i, '')

  // Ensure `images/` prefix
  if (!/^images\//i.test(p)) {
    // if it's like assets/images/foo after previous steps, normalize
    p = p.replace(/^assets\/images\//i, 'images/')
    if (!/^images\//i.test(p)) p = 'images/' + p
  }

  // Build absolute URL to match Vite dev served path
  const finalPath = '/src/assets/' + p.replace(/^images\//i, 'images/')
  return new URL(finalPath, window.location.origin).toString()
}

// Router
const router = useRouter()

// Reactive totals
const subtotal = computed(() => orderItems.value.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0))
const shipping = computed(() => orderItems.value.length ? 15 : 0)
const tax = computed(() => Math.round(subtotal.value * 0.08))
const total = computed(() => subtotal.value + shipping.value + tax.value)

// Order summary for modal
const orderSummary = computed(() => ({
  personal: {
    name: personalInfo.value.name,
    email: personalInfo.value.email,
    phone: getInternationalPhone()
  },
  location: { ...userLocation.value },
  payment: selectedPaymentMethod.value,
  totals: { subtotal: subtotal.value, shipping: shipping.value, tax: tax.value, total: total.value },
  items: orderItems.value
}))

const placingOrder = ref(false)
async function placeOrder() {
  try {
    placingOrder.value = true
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1200))
    showOrderSummaryModal.value = false
    router.push({ name: 'orders' })
  } finally {
    placingOrder.value = false
  }
}

// Methods
const selectPaymentMethod = (method) => {
  selectedPaymentMethod.value = method
}

const completeOrder = () => {
  // Ensure a payment method is selected (still early exit because no specific inputs to validate yet)
  if (!selectedPaymentMethod.value) {
    showErrorMessage.value = true
    setTimeout(() => { showErrorMessage.value = false }, 3000)
    // Still run location + personal validations so user sees all issues
  }

  // Run all validations without short‑circuiting so every section shows its errors together
  const personalOk = validatePersonalInfo()
  const paymentOk = selectedPaymentMethod.value ? validatePaymentDetails() : false
  const locationOk = validateLocation()

  if (personalOk && paymentOk && locationOk && selectedPaymentMethod.value) {
    showOrderSummaryModal.value = true
    return
  }

  // Scroll to the first section that has errors (priority: personal -> payment -> location)
  if (!personalOk) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  if (!paymentOk) {
    if (paymentSectionEl.value) paymentSectionEl.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  if (!locationOk) {
    if (deliverySectionEl.value) deliverySectionEl.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleLocationSubmit = () => {
  // Validate once more in case user changed values in modal
  if (!validateLocation()) {
    if (deliverySectionEl.value) {
      deliverySectionEl.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    showLocationModal.value = false
    return
  }
  // Process order
  showLocationModal.value = false
  const fullPhone = getInternationalPhone()
  alert(`Order placed successfully!\nPhone: ${fullPhone}`)
}

const closeModals = () => {
  showLocationModal.value = false
}

function validateLocation() {
  let ok = true
  const v = userLocation.value
  const errs = { address: '', city: '', state: '', postalCode: '', country: '' }
  if (!v.address || !v.address.trim()) {
    errs.address = 'Street address is required'
    ok = false
  }
  if (!v.city || !v.city.trim()) {
    errs.city = 'City / Town is required'
    ok = false
  }
  if (!v.state || !v.state.trim()) {
    errs.state = 'State / Region is required'
    ok = false
  }
  if (!v.postalCode || !v.postalCode.trim()) {
    errs.postalCode = 'Postal code is required'
    ok = false
  }
  if (!v.country || !v.country.trim()) {
    errs.country = 'Country is required'
    ok = false
  }
  locationErrors.value = errs
  return ok
}

function validatePersonalInfo() {
  const errs = { name: '', email: '', phone: '' }
  let ok = true
  const n = personalInfo.value.name.trim()
  if (!n) { errs.name = 'Full name is required'; ok = false }
  else if (n.length < 2) { errs.name = 'Name must be at least 2 characters'; ok = false }
  const e = personalInfo.value.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!e) { errs.email = 'Email is required'; ok = false }
  else if (!emailRegex.test(e)) { errs.email = 'Enter a valid email address'; ok = false }
  const p = personalInfo.value.phone.trim()
  const digits = p.replace(/[^0-9+]/g, '')
  if (!digits) { errs.phone = 'Phone number is required'; ok = false }
  else if (!/^\+?[0-9]{7,15}$/.test(digits)) { errs.phone = 'Phone must be 7–15 digits (may start with +)'; ok = false }
  personalInfoErrors.value = errs
  return ok
}

function clearPersonalError(field) {
  if (personalInfoErrors.value[field]) personalInfoErrors.value[field] = ''
}

function clearLocationError(field) {
  if (locationErrors.value[field]) {
    locationErrors.value[field] = ''
  }
}

function getInternationalPhone() {
  const dial = selectedCountry.value?.dial || ''
  const num = String(personalInfo.value.phone || '').trim()
  // If user typed with +countrycode, keep as-is; else prefix selected dial code
  if (num.startsWith('+')) return num
  return `${dial}${num}`
}
</script>

<template>
  <Header/>
  <main class="menu-toggle">
    <section class="checkout mx-auto pt-16 px-[4%] lg:max-w-[1500px]">
      <div class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize">
        checkout
      </div>
      
      <!-- Confirm Personal Information Details (full-width) -->
  <div class="personal-info-container border-2 border-gray-300 rounded-lg mt-6 mb-6 overflow-visible w-full">
        <h2 class="border-b-2 border-gray-300 px-4 py-4 text-center text-base sm:text-xl font-semibold text-[#384857] capitalize">
          <i class="fa-solid fa-user-check font-extrabold text-xl mr-2"></i>
          <span>confirm personal information details</span>
        </h2>
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
            <!-- Full Name -->
            <div class="min-w-0">
              <input
                v-model="personalInfo.name"
                @input="clearPersonalError('name')"
                type="text"
                placeholder="Full name (e.g., John Doe)"
                :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe] min-w-0', personalInfoErrors.name ? 'border-red-400' : 'border-gray-300']"
                :aria-invalid="!!personalInfoErrors.name"
                aria-describedby="pi-name-error"
              />
              <p v-if="personalInfoErrors.name" id="pi-name-error" class="mt-1 text-xs text-red-600">{{ personalInfoErrors.name }}</p>
            </div>
            <!-- Email Address -->
            <div class="min-w-0">
              <input
                v-model="personalInfo.email"
                @input="clearPersonalError('email')"
                type="email"
                placeholder="Email address (e.g., john.doe@example.com)"
                :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe] min-w-0', personalInfoErrors.email ? 'border-red-400' : 'border-gray-300']"
                :aria-invalid="!!personalInfoErrors.email"
                aria-describedby="pi-email-error"
              />
              <p v-if="personalInfoErrors.email" id="pi-email-error" class="mt-1 text-xs text-red-600">{{ personalInfoErrors.email }}</p>
            </div>
            <!-- Phone (Country + Number) -->
            <div class="min-w-0">
              <div class="flex w-full items-stretch min-w-0" :aria-invalid="!!personalInfoErrors.phone">
                <div ref="countryDropdownEl" class="relative flex-none">
                  <button
                    type="button"
                    @click="toggleCountryDropdown"
                    :class="['px-2 h-full border-2 border-r-0 rounded-l-md bg-white text-[#384857] outline-none focus:border-[#68a4fe] flex items-center gap-1 min-w-[56px]', personalInfoErrors.phone ? 'border-red-400' : 'border-gray-300']"
                    aria-haspopup="listbox"
                    :aria-expanded="showCountryDropdown"
                  >
                    <img :src="getFlagUrl(selectedCountry.code)" alt="flag" class="w-5 h-3.5 object-cover rounded-sm"/>
                    <span class="text-xs">{{ selectedCountry.dial }}</span>
                    <svg class="w-3 h-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/></svg>
                  </button>
                  <ul
                    v-if="showCountryDropdown"
                    class="absolute left-0 top-full mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-64 overflow-auto"
                    role="listbox"
                  >
                    <li
                      v-for="c in countryOptions"
                      :key="c.code"
                      @click="selectCountry(c)"
                      class="px-3 py-2 flex items-center cursor-pointer hover:bg-gray-50"
                      role="option"
                      :aria-selected="selectedCountry.code === c.code"
                    >
                      <img :src="getFlagUrl(c.code)" alt="flag" class="w-5 h-3.5 object-cover rounded-sm"/>
                      <span class="ml-2 text-sm">{{ c.dial }}</span>
                      <span class="ml-2 text-[10px] text-gray-500 truncate">{{ c.name }}</span>
                    </li>
                  </ul>
                </div>
                <input
                  v-model="personalInfo.phone"
                  @input="clearPersonalError('phone')"
                  type="tel"
                  placeholder="Phone number (e.g., 712345678)"
                  :class="['flex-1 min-w-0 p-3 border-2 rounded-r-md outline-none focus:border-[#68a4fe] border-l-0', personalInfoErrors.phone ? 'border-red-400' : 'border-gray-300']"
                  aria-describedby="pi-phone-error"
                />
              </div>
              <p v-if="personalInfoErrors.phone" id="pi-phone-error" class="mt-1 text-xs text-red-600">{{ personalInfoErrors.phone }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Delivery Location (full-width) -->
  <div ref="deliverySectionEl" class="delivery-location-container border-2 border-gray-300 rounded-lg mt-6 mb-6 overflow-hidden w-full">
        <h2 class="border-b-2 border-gray-300 px-4 py-4 text-center text-base sm:text-xl font-semibold text-[#384857] capitalize">
          <i class="fa-solid fa-location-dot font-extrabold text-xl mr-2"></i>
          <span>delivery location</span>
        </h2>
        <div class="p-4 space-y-4">
          <div class="grid grid-cols-1 gap-3">
            <div>
              <input v-model="userLocation.address" @input="clearLocationError('address')" type="text" placeholder="Street address (e.g., 123 Moi Ave)" :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', locationErrors.address ? 'border-red-400' : 'border-gray-300']" />
              <p v-if="locationErrors.address" class="mt-1 text-xs text-red-600">{{ locationErrors.address }}</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input v-model="userLocation.apartment" type="text" placeholder="Apartment / Suite (optional) (e.g., Apt 4B)" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]" />
              <input v-model="userLocation.landmark" type="text" placeholder="Nearby landmark (optional) (e.g., Near Sarit Centre)" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input v-model="userLocation.city" @input="clearLocationError('city')" type="text" placeholder="City / Town (e.g., Nairobi)" :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', locationErrors.city ? 'border-red-400' : 'border-gray-300']" />
                <p v-if="locationErrors.city" class="mt-1 text-xs text-red-600">{{ locationErrors.city }}</p>
              </div>
              <div>
                <input v-model="userLocation.state" @input="clearLocationError('state')" type="text" placeholder="State / Region (e.g., Nairobi County)" :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', locationErrors.state ? 'border-red-400' : 'border-gray-300']" />
                <p v-if="locationErrors.state" class="mt-1 text-xs text-red-600">{{ locationErrors.state }}</p>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input v-model="userLocation.postalCode" @input="clearLocationError('postalCode')" type="text" placeholder="Postal Code (e.g., 00100)" :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', locationErrors.postalCode ? 'border-red-400' : 'border-gray-300']" />
                <p v-if="locationErrors.postalCode" class="mt-1 text-xs text-red-600">{{ locationErrors.postalCode }}</p>
              </div>
              <div>
                <input v-model="userLocation.country" @input="clearLocationError('country')" type="text" placeholder="Country (e.g., Kenya)" :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', locationErrors.country ? 'border-red-400' : 'border-gray-300']" />
                <p v-if="locationErrors.country" class="mt-1 text-xs text-red-600">{{ locationErrors.country }}</p>
              </div>
            </div>
            <textarea v-model="userLocation.instructions" rows="3" placeholder="Delivery instructions (optional) (e.g., Leave at reception)" class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe]"></textarea>
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
              <div v-if="!orderItems.length" class="text-sm text-gray-600 italic">No items in cart.</div>
              <div
                v-for="item in orderItems"
                :key="item.id"
                class="order-item flex items-center gap-4 pb-4 border-b border-gray-200"
              >
                <img
                  :src="resolveImg(item.image)"
                  :alt="item.name"
                  class="w-16 h-16 object-contain"
                />
                <div class="item-details flex-1">
                  <div class="product-name font-semibold text-sm text-[#384857] capitalize">
                    {{ item.name }}
                  </div>
                  <div class="product-brand text-xs text-gray-600">{{ item.brand }}</div>
                  <div class="rating-box flex gap-1 items-center mt-1" v-if="item.rating">
                    <div class="star-box text-[#FFCF10]">
                      <StarIcon class="size-3 inline" v-for="n in item.rating" :key="n"></StarIcon>
                    </div>
                  </div>
                  <div class="quantity-price text-xs text-[#384857] mt-1">
                    Qty: {{ item.quantity }} × ${{ item.price }}
                  </div>
                </div>
                <div class="item-total text-[#FF412C] font-semibold">
                  ${{ (item.price * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>
            
            <div class="order-totals p-4 space-y-3">
              <div class="subtotal flex justify-between text-[#384857]">
                <span>Subtotal:</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="shipping flex justify-between text-[#384857]">
                <span>Shipping:</span>
                <span>${{ shipping.toFixed(2) }}</span>
              </div>
              <div class="tax flex justify-between text-[#384857]">
                <span>Tax:</span>
                <span>${{ tax.toFixed(2) }}</span>
              </div>
              <div class="border-t pt-3">
                <div class="total flex justify-between text-[#384857] font-semibold text-lg">
                  <span>Total:</span>
                  <span class="text-[#FF412C]">${{ total.toFixed(2) }}</span>
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
        <div class="payment-section w-full lg:w-3/5 order-1 lg:order-2" ref="paymentSectionEl">
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
                    <div>
                      <input
                        v-model="cardDetails.cardNumber"
                        @input="clearPaymentError('cardNumber')"
                        type="text"
                        placeholder="Card number (e.g., 1234 1234 1234 1234)"
                        :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', paymentErrors.cardNumber ? 'border-red-400' : 'border-gray-300']"
                        maxlength="19"
                      />
                      <p v-if="paymentErrors.cardNumber" class="mt-1 text-xs text-red-600">{{ paymentErrors.cardNumber }}</p>
                    </div>
                    <div>
                      <input
                        v-model="cardDetails.cardholderName"
                        @input="clearPaymentError('cardholderName')"
                        type="text"
                        placeholder="Cardholder name (e.g., John Doe)"
                        :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', paymentErrors.cardholderName ? 'border-red-400' : 'border-gray-300']"
                      />
                      <p v-if="paymentErrors.cardholderName" class="mt-1 text-xs text-red-600">{{ paymentErrors.cardholderName }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          v-model="cardDetails.expiryDate"
                          @input="clearPaymentError('expiryDate')"
                          type="text"
                          placeholder="Expiry (e.g., 09/27)"
                          :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', paymentErrors.expiryDate ? 'border-red-400' : 'border-gray-300']"
                          maxlength="5"
                        />
                        <p v-if="paymentErrors.expiryDate" class="mt-1 text-xs text-red-600">{{ paymentErrors.expiryDate }}</p>
                      </div>
                      <div>
                        <input
                          v-model="cardDetails.cvv"
                          @input="clearPaymentError('cvv')"
                          type="text"
                          placeholder="CVV (e.g., 123)"
                          :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', paymentErrors.cvv ? 'border-red-400' : 'border-gray-300']"
                          maxlength="4"
                        />
                        <p v-if="paymentErrors.cvv" class="mt-1 text-xs text-red-600">{{ paymentErrors.cvv }}</p>
                      </div>
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
                  <div>
                    <input
                      v-model="paypalDetails.email"
                      @input="clearPaymentError('paypalEmail')"
                      type="email"
                      placeholder="PayPal email (e.g., john.doe@example.com)"
                      :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', paymentErrors.paypalEmail ? 'border-red-400' : 'border-gray-300']"
                    />
                    <p v-if="paymentErrors.paypalEmail" class="mt-1 text-xs text-red-600">{{ paymentErrors.paypalEmail }}</p>
                  </div>
                  <div>
                    <input
                      v-model="paypalDetails.password"
                      @input="clearPaymentError('paypalPassword')"
                      type="password"
                      placeholder="PayPal password (enter your password)"
                      :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', paymentErrors.paypalPassword ? 'border-red-400' : 'border-gray-300']"
                    />
                    <p v-if="paymentErrors.paypalPassword" class="mt-1 text-xs text-red-600">{{ paymentErrors.paypalPassword }}</p>
                  </div>
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
                  <div>
                    <input
                      v-model="mpesaDetails.phoneNumber"
                      @input="clearPaymentError('mpesaPhone')"
                      type="tel"
                      placeholder="Phone number (e.g., 0712345678 or +254712345678)"
                      :class="['w-full p-3 border-2 rounded-md outline-none focus:border-[#68a4fe]', paymentErrors.mpesaPhone ? 'border-red-400' : 'border-gray-300']"
                    />
                    <p v-if="paymentErrors.mpesaPhone" class="mt-1 text-xs text-red-600">{{ paymentErrors.mpesaPhone }}</p>
                  </div>
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

  <!-- Order Summary Modal -->
  <div v-if="showOrderSummaryModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-2xl mx-4 shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <h3 class="text-xl font-semibold text-[#384857]">Review and place your order</h3>
        <button
          @click="showOrderSummaryModal = false"
          class="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100"
          aria-label="Close"
        >
          <XMarkIcon class="w-5 h-5"/>
        </button>
      </div>
      <div class="p-6 space-y-6 max-h-[55vh] overflow-auto">
        <!-- Personal Info -->
        <section>
          <h4 class="text-[#384857] font-semibold mb-2">Personal information</h4>
          <div class="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div><span class="font-medium">Name:</span> {{ orderSummary.personal.name }}</div>
            <div><span class="font-medium">Email:</span> {{ orderSummary.personal.email }}</div>
            <div class="sm:col-span-2"><span class="font-medium">Phone:</span> {{ orderSummary.personal.phone }}</div>
          </div>
        </section>
        <!-- Delivery Location -->
        <section>
          <h4 class="text-[#384857] font-semibold mb-2">Delivery location</h4>
          <div class="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="sm:col-span-2"><span class="font-medium">Address:</span> {{ orderSummary.location.address }}</div>
            <div><span class="font-medium">Apartment:</span> {{ orderSummary.location.apartment || '—' }}</div>
            <div><span class="font-medium">Landmark:</span> {{ orderSummary.location.landmark || '—' }}</div>
            <div><span class="font-medium">City:</span> {{ orderSummary.location.city }}</div>
            <div><span class="font-medium">State:</span> {{ orderSummary.location.state }}</div>
            <div><span class="font-medium">Postal Code:</span> {{ orderSummary.location.postalCode }}</div>
            <div><span class="font-medium">Country:</span> {{ orderSummary.location.country }}</div>
          </div>
        </section>
        <!-- Items -->
        <section>
          <h4 class="text-[#384857] font-semibold mb-2">Items ({{ orderSummary.items.length }})</h4>
          <div class="divide-y border rounded-md">
            <div v-for="it in orderSummary.items" :key="it.id" class="flex items-center justify-between px-3 py-2 text-sm">
              <div class="flex items-center gap-3">
                <img :src="it.image" class="w-10 h-10 object-cover rounded" alt=""/>
                <div>
                  <p class="text-[#384857] font-medium capitalize">{{ it.name }}</p>
                  <p class="text-gray-500">Qty: {{ it.quantity }}</p>
                </div>
              </div>
              <div class="text-[#384857] font-semibold">${{ (it.price * it.quantity).toFixed(2) }}</div>
            </div>
          </div>
        </section>
        <!-- Totals and payment -->
        <section>
          <h4 class="text-[#384857] font-semibold mb-2">Payment</h4>
          <p class="text-sm text-gray-700 mb-3">Method: <span class="capitalize font-medium">{{ orderSummary.payment }}</span></p>
          <div class="bg-gray-50 rounded-md p-3 text-sm text-[#384857] space-y-1">
            <div class="flex justify-between"><span>Subtotal</span><span>${{ subtotal.toFixed(2) }}</span></div>
            <div class="flex justify-between"><span>Shipping</span><span>${{ shipping.toFixed(2) }}</span></div>
            <div class="flex justify-between"><span>Tax</span><span>${{ tax.toFixed(2) }}</span></div>
            <div class="flex justify-between font-semibold text-lg pt-2 border-t"><span>Total</span><span class="text-[#FF412C]">${{ total.toFixed(2) }}</span></div>
          </div>
        </section>
      </div>
      <div class="px-6 py-4 border-t flex justify-end gap-3">
        <button @click="showOrderSummaryModal = false" class="px-4 py-2 border-2 border-gray-300 rounded-md text-[#384857] hover:bg-gray-50">Back</button>
        <button @click="placeOrder" :disabled="placingOrder" class="px-5 py-2.5 bg-[#68a4fe] hover:bg-[#5496f8] disabled:opacity-60 rounded-md text-white font-semibold">
          <span v-if="!placingOrder">Proceed to payment</span>
          <span v-else>Processing…</span>
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