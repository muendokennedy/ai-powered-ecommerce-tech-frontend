<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

// Centralized products list with category field
const products = ref([
  // Phones
  { id: 'ph-1', category: 'phones', brand: 'Infinix', name: 'infinix hot 12', image: '/src/assets/images/redmi note 12.png', price: 136, oldPrice: 206, rating: 5,
    originalPrice: 206, discountedPrice: 136,
    description: 'A dependable smartphone with a bright display, capable camera, and long battery for everyday use.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/iphone12.png'],
    specifications: { storage: '128GB', ram: '6GB', displaySize: '6.5"', camera: '48MP', battery: '5000mAh', operatingSystem: 'Android', color: 'Black' }
  },
  { id: 'ph-2', category: 'phones', brand: 'Xiaomi', name: 'redmi note 12', image: '/src/assets/images/redmi note 12.png', price: 136, oldPrice: 206, rating: 5,
    originalPrice: 206, discountedPrice: 136,
    description: 'Vivid display and smooth performance with a versatile camera system, ideal for social and streaming.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/iphone12.png'],
    specifications: { storage: '128GB', ram: '6GB', displaySize: '6.6"', camera: '50MP', battery: '5000mAh', operatingSystem: 'Android', color: 'Blue' }
  },
  { id: 'ph-3', category: 'phones', brand: 'Apple', name: 'iphone 12', image: '/src/assets/images/iphone12.png', price: 699, oldPrice: 799, rating: 5,
    originalPrice: 799, discountedPrice: 699,
    description: 'Fast performance and a great dual‑camera system in a sleek, durable design.',
    images: ['/src/assets/images/iphone12.png','/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png'],
    specifications: { storage: '128GB', ram: '4GB', displaySize: '6.1"', camera: '12MP Dual', battery: '2815mAh', operatingSystem: 'iOS', color: 'Black' }
  },
  { id: 'ph-4', category: 'phones', brand: 'Apple', name: 'iphone 14', image: '/src/assets/images/iphone14.png', price: 899, oldPrice: 999, rating: 5,
    originalPrice: 999, discountedPrice: 899,
    description: 'Advanced camera, vibrant display, and strong battery life for a premium iPhone experience.',
    images: ['/src/assets/images/iphone14.png','/src/assets/images/iphone12.png','/src/assets/images/redmi note 12.png'],
    specifications: { storage: '256GB', ram: '6GB', displaySize: '6.1"', camera: '12MP Dual', battery: '3279mAh', operatingSystem: 'iOS', color: 'Midnight' }
  },
  { id: 'ph-5', category: 'phones', brand: 'Tecno', name: 'tecno camon 18p', image: '/src/assets/images/techno camon 18p.png', price: 249, oldPrice: 299, rating: 5,
    originalPrice: 299, discountedPrice: 249,
    description: 'Balanced performance with a sharp display and reliable battery for daily tasks.',
    images: ['/src/assets/images/techno camon 18p.png','/src/assets/images/techno spark 5.png','/src/assets/images/redmi note 12.png'],
    specifications: { storage: '128GB', ram: '6GB', displaySize: '6.8"', camera: '48MP Triple', battery: '5000mAh', operatingSystem: 'Android', color: 'Gray' }
  },
  { id: 'ph-6', category: 'phones', brand: 'Infinix', name: 'infinix smart 7 plus', image: '/src/assets/images/infinix smart 7 plus.png', price: 129, oldPrice: 169, rating: 5,
    originalPrice: 169, discountedPrice: 129,
    description: 'Entry-level smartphone with a large display and long-lasting battery.',
    images: ['/src/assets/images/infinix smart 7 plus.png','/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png'],
    specifications: { storage: '64GB', ram: '4GB', displaySize: '6.6"', camera: '13MP', battery: '6000mAh', operatingSystem: 'Android', color: 'Green' }
  },
  { id: 'ph-7', category: 'phones', brand: 'Tecno', name: 'tecno spark 5', image: '/src/assets/images/techno spark 5.png', price: 159, oldPrice: 189, rating: 5,
    originalPrice: 189, discountedPrice: 159,
    description: 'Affordable smartphone with a big screen and battery for everyday essentials.',
    images: ['/src/assets/images/techno spark 5.png','/src/assets/images/redmi note 12.png','/src/assets/images/iphone12.png'],
    specifications: { storage: '64GB', ram: '4GB', displaySize: '6.6"', camera: '13MP', battery: '5000mAh', operatingSystem: 'Android', color: 'Black' }
  },
  { id: 'ph-8', category: 'phones', brand: 'Xiaomi', name: 'xiaomi redmi 10 2022 pro', image: '/src/assets/images/xiaomi redmi 10 2022 pro.png', price: 219, oldPrice: 269, rating: 5,
    originalPrice: 269, discountedPrice: 219,
    description: 'Smooth performance, capable cameras, and a vibrant display for great value.',
    images: ['/src/assets/images/xiaomi redmi 10 2022 pro.png','/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png'],
    specifications: { storage: '128GB', ram: '6GB', displaySize: '6.5"', camera: '50MP Quad', battery: '5000mAh', operatingSystem: 'Android', color: 'Silver' }
  },

  // Laptops
  { id: 'lp-1', category: 'laptops', brand: 'Dell', name: 'dell inspiron', image: '/src/assets/images/dell inspiron.png', price: 749, oldPrice: 899, rating: 5,
    originalPrice: 899, discountedPrice: 749,
    description: 'A reliable productivity laptop with FHD display, fast SSD, and all-day efficiency.',
    images: ['/src/assets/images/dell inspiron.png','/src/assets/images/hp laptop 15 ci7.png','/src/assets/images/dell latitude 5320.png'],
    specifications: { processor: 'Intel Core i7', ram: '16GB', storageType: 'SSD', storageSize: '512GB', graphicsCard: 'Integrated', displaySize: '15.6"', operatingSystem: 'Windows 11', batteryLife: '10 hours' }
  },
  { id: 'lp-2', category: 'laptops', brand: 'Dell', name: 'dell latitude 5320', image: '/src/assets/images/dell latitude 5320.png', price: 999, oldPrice: 1149, rating: 5,
    originalPrice: 1149, discountedPrice: 999,
    description: 'Premium build quality with sharp display, fast performance, and great portability.',
    images: ['/src/assets/images/dell latitude 5320.png','/src/assets/images/dell inspiron.png','/src/assets/images/hp laptop 15 ci7.png'],
    specifications: { processor: 'Intel Core i7', ram: '16GB', storageType: 'SSD', storageSize: '512GB', graphicsCard: 'Integrated', displaySize: '13.3"', operatingSystem: 'Windows 11', batteryLife: '12 hours' }
  },
  { id: 'lp-3', category: 'laptops', brand: 'HP', name: 'hp laptop 15 ci7', image: '/src/assets/images/hp laptop 15 ci7.png', price: 1099, oldPrice: 1299, rating: 5,
    originalPrice: 1299, discountedPrice: 1099,
    description: 'Powerful laptop for work and study with bright display and speedy SSD storage.',
    images: ['/src/assets/images/hp laptop 15 ci7.png','/src/assets/images/dell inspiron.png','/src/assets/images/dell latitude 5320.png'],
    specifications: { processor: 'Intel Core i7', ram: '16GB', storageType: 'SSD', storageSize: '1TB', graphicsCard: 'Integrated', displaySize: '15.6"', operatingSystem: 'Windows 11', batteryLife: '9 hours' }
  },
  { id: 'lp-4', category: 'laptops', brand: 'Dell', name: 'dell inspiron (2024)', image: '/src/assets/images/dell inspiron.png', price: 799, oldPrice: 949, rating: 5,
    originalPrice: 949, discountedPrice: 799,
    description: 'Updated Inspiron with efficient performance and solid thermals for everyday tasks.',
    images: ['/src/assets/images/dell inspiron.png','/src/assets/images/dell latitude 5320.png','/src/assets/images/hp laptop 15 ci7.png'],
    specifications: { processor: 'Intel Core i5', ram: '16GB', storageType: 'SSD', storageSize: '512GB', graphicsCard: 'Integrated', displaySize: '15.6"', operatingSystem: 'Windows 11', batteryLife: '11 hours' }
  },
  { id: 'lp-5', category: 'laptops', brand: 'HP', name: 'hp laptop 15 ci7 (2024)', image: '/src/assets/images/hp laptop 15 ci7.png', price: 1029, oldPrice: 1249, rating: 5,
    originalPrice: 1249, discountedPrice: 1029,
    description: 'Thin-and-light design with a fast processor and vivid screen for modern workflows.',
    images: ['/src/assets/images/hp laptop 15 ci7.png','/src/assets/images/dell inspiron.png','/src/assets/images/dell latitude 5320.png'],
    specifications: { processor: 'Intel Core i7', ram: '16GB', storageType: 'SSD', storageSize: '512GB', graphicsCard: 'Integrated', displaySize: '15.6"', operatingSystem: 'Windows 11', batteryLife: '10 hours' }
  },
  { id: 'lp-6', category: 'laptops', brand: 'Dell', name: 'dell inspiron plus', image: '/src/assets/images/dell inspiron.png', price: 899, oldPrice: 1049, rating: 5,
    originalPrice: 1049, discountedPrice: 899,
    description: 'Enhanced Inspiron variant with better cooling and performance headroom.',
    images: ['/src/assets/images/dell inspiron.png','/src/assets/images/hp laptop 15 ci7.png','/src/assets/images/dell latitude 5320.png'],
    specifications: { processor: 'Intel Core i7', ram: '16GB', storageType: 'SSD', storageSize: '512GB', graphicsCard: 'Integrated', displaySize: '15.6"', operatingSystem: 'Windows 11', batteryLife: '10 hours' }
  },
  { id: 'lp-7', category: 'laptops', brand: 'Dell', name: 'dell latitude 5320 pro', image: '/src/assets/images/dell latitude 5320.png', price: 1049, oldPrice: 1199, rating: 5,
    originalPrice: 1199, discountedPrice: 1049,
    description: 'Business-class ultrabook with excellent keyboard, battery, and build quality.',
    images: ['/src/assets/images/dell latitude 5320.png','/src/assets/images/dell inspiron.png','/src/assets/images/hp laptop 15 ci7.png'],
    specifications: { processor: 'Intel Core i7', ram: '16GB', storageType: 'SSD', storageSize: '512GB', graphicsCard: 'Integrated', displaySize: '13.3"', operatingSystem: 'Windows 11 Pro', batteryLife: '12 hours' }
  },
  { id: 'lp-8', category: 'laptops', brand: 'HP', name: 'hp laptop 15 business', image: '/src/assets/images/hp laptop 15 ci7.png', price: 999, oldPrice: 1149, rating: 5,
    originalPrice: 1149, discountedPrice: 999,
    description: 'Balanced performance and value for office tasks, browsing, and conferencing.',
    images: ['/src/assets/images/hp laptop 15 ci7.png','/src/assets/images/dell inspiron.png','/src/assets/images/dell latitude 5320.png'],
    specifications: { processor: 'Intel Core i5', ram: '16GB', storageType: 'SSD', storageSize: '512GB', graphicsCard: 'Integrated', displaySize: '15.6"', operatingSystem: 'Windows 11', batteryLife: '9 hours' }
  },

  // Smartwatches
  { id: 'sw-1', category: 'smartwatches', brand: 'MoTech', name: 'MoTech Watch S1', image: '/src/assets/images/redmi note 12.png', price: 99, oldPrice: 129, rating: 5,
    originalPrice: 129, discountedPrice: 99,
    description: 'Track your fitness, notifications, and sleep with a bright display and long battery life.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { displayType: 'AMOLED', caseSize: '44mm', operatingSystem: 'Wear OS', batteryLife: '24 hours', waterResistance: '5ATM', connectivity: 'Bluetooth + Wi‑Fi', healthSensors: 'Heart Rate, SpO2' }
  },
  { id: 'sw-2', category: 'smartwatches', brand: 'MoTech', name: 'MoTech Watch Pro', image: '/src/assets/images/redmi note 12.png', price: 149, oldPrice: 199, rating: 5,
    originalPrice: 199, discountedPrice: 149,
    description: 'Enhanced smartwatch with advanced health metrics and durable design.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { displayType: 'AMOLED', caseSize: '46mm', operatingSystem: 'Wear OS', batteryLife: '36 hours', waterResistance: '5ATM', connectivity: 'Bluetooth + Wi‑Fi', healthSensors: 'Heart Rate, SpO2' }
  },
  { id: 'sw-3', category: 'smartwatches', brand: 'MoTech', name: 'MoTech Band 5', image: '/src/assets/images/redmi note 12.png', price: 49, oldPrice: 69, rating: 5,
    originalPrice: 69, discountedPrice: 49,
    description: 'Lightweight fitness band for daily activity and sleep tracking.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { displayType: 'AMOLED', caseSize: '—', operatingSystem: 'Proprietary', batteryLife: '7 days', waterResistance: '5ATM', connectivity: 'Bluetooth', healthSensors: 'Heart Rate, SpO2' }
  },
  { id: 'sw-4', category: 'smartwatches', brand: 'MoTech', name: 'MoTech Watch X', image: '/src/assets/images/redmi note 12.png', price: 179, oldPrice: 229, rating: 5,
    originalPrice: 229, discountedPrice: 179,
    description: 'Rugged smartwatch built for outdoor adventures with GPS and water resistance.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { displayType: 'AMOLED', caseSize: '47mm', operatingSystem: 'Wear OS', batteryLife: '48 hours', waterResistance: '5ATM', connectivity: 'Bluetooth + Wi‑Fi + GPS', healthSensors: 'Heart Rate, SpO2' }
  },
  { id: 'sw-5', category: 'smartwatches', brand: 'MoTech', name: 'MoTech Watch Lite', image: '/src/assets/images/redmi note 12.png', price: 79, oldPrice: 109, rating: 5,
    originalPrice: 109, discountedPrice: 79,
    description: 'Essential features in a compact watch with dependable battery life.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { displayType: 'LCD', caseSize: '40mm', operatingSystem: 'Proprietary', batteryLife: '3 days', waterResistance: '3ATM', connectivity: 'Bluetooth', healthSensors: 'Heart Rate' }
  },
  { id: 'sw-6', category: 'smartwatches', brand: 'MoTech', name: 'MoTech Band 6', image: '/src/assets/images/redmi note 12.png', price: 59, oldPrice: 79, rating: 5,
    originalPrice: 79, discountedPrice: 59,
    description: 'Affordable fitness band with smart notifications and basic health tracking.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { displayType: 'AMOLED', caseSize: '—', operatingSystem: 'Proprietary', batteryLife: '10 days', waterResistance: '5ATM', connectivity: 'Bluetooth', healthSensors: 'Heart Rate' }
  },
  { id: 'sw-7', category: 'smartwatches', brand: 'MoTech', name: 'MoTech Watch S2', image: '/src/assets/images/redmi note 12.png', price: 129, oldPrice: 159, rating: 5,
    originalPrice: 159, discountedPrice: 129,
    description: 'Comfortable smartwatch with reliable activity tracking and app notifications.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { displayType: 'AMOLED', caseSize: '44mm', operatingSystem: 'Wear OS', batteryLife: '36 hours', waterResistance: '5ATM', connectivity: 'Bluetooth + Wi‑Fi', healthSensors: 'Heart Rate, SpO2' }
  },
  { id: 'sw-8', category: 'smartwatches', brand: 'MoTech', name: 'MoTech Watch Ultra', image: '/src/assets/images/redmi note 12.png', price: 249, oldPrice: 299, rating: 5,
    originalPrice: 299, discountedPrice: 249,
    description: 'Premium watch with advanced health tracking, GPS, and premium build quality.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { displayType: 'AMOLED', caseSize: '49mm', operatingSystem: 'Wear OS', batteryLife: '2 days', waterResistance: '5ATM', connectivity: 'Bluetooth + Wi‑Fi + GPS', healthSensors: 'Heart Rate, SpO2' }
  },

  // Televisions
  { id: 'tv-1', category: 'televisions', brand: 'MoTech', name: 'MoTech TV 43" FHD', image: '/src/assets/images/redmi note 12.png', price: 299, oldPrice: 349, rating: 5,
    originalPrice: 349, discountedPrice: 299,
    description: 'Full HD smart TV with vivid colors and built-in streaming apps for everyday entertainment.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/xiaomi redmi 10 2022 pro.png','/src/assets/images/techno spark 5.png'],
    specifications: { screenSize: '43"', resolution: '1080p', displayTechnology: 'LED', smartTvOs: 'Android TV', hdrSupport: 'HDR10', refreshRate: '60Hz', audioOutput: '20W' }
  },
  { id: 'tv-2', category: 'televisions', brand: 'MoTech', name: 'MoTech TV 55" 4K', image: '/src/assets/images/redmi note 12.png', price: 499, oldPrice: 599, rating: 5,
    originalPrice: 599, discountedPrice: 499,
    description: 'Sharp 4K resolution with smart features and multiple HDMI ports for devices and consoles.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { screenSize: '55"', resolution: '4K Ultra HD', displayTechnology: 'QLED', smartTvOs: 'Android TV', hdrSupport: 'HDR10+', refreshRate: '60Hz', audioOutput: '20W' }
  },
  { id: 'tv-3', category: 'televisions', brand: 'MoTech', name: 'MoTech TV 65" 4K', image: '/src/assets/images/redmi note 12.png', price: 699, oldPrice: 799, rating: 5,
    originalPrice: 799, discountedPrice: 699,
    description: 'Large-screen 4K TV with great contrast and crisp upscaling for movies and sports.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/xiaomi redmi 10 2022 pro.png','/src/assets/images/techno spark 5.png'],
    specifications: { screenSize: '65"', resolution: '4K Ultra HD', displayTechnology: 'LED', smartTvOs: 'Android TV', hdrSupport: 'Dolby Vision', refreshRate: '120Hz', audioOutput: '30W' }
  },
  { id: 'tv-4', category: 'televisions', brand: 'MoTech', name: 'MoTech TV 75" 4K', image: '/src/assets/images/redmi note 12.png', price: 999, oldPrice: 1199, rating: 5,
    originalPrice: 1199, discountedPrice: 999,
    description: 'Ultra-large 4K TV for immersive viewing with smart OS and smooth motion handling.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { screenSize: '75"', resolution: '4K Ultra HD', displayTechnology: 'LED', smartTvOs: 'Android TV', hdrSupport: 'HDR10+', refreshRate: '120Hz', audioOutput: '40W' }
  },
  { id: 'tv-5', category: 'televisions', brand: 'MoTech', name: 'MoTech TV 32" HD', image: '/src/assets/images/redmi note 12.png', price: 199, oldPrice: 249, rating: 5,
    originalPrice: 249, discountedPrice: 199,
    description: 'Compact HD TV ideal for bedrooms and kitchens with built-in streaming.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { screenSize: '32"', resolution: '720p', displayTechnology: 'LED', smartTvOs: 'Android TV', hdrSupport: '—', refreshRate: '60Hz', audioOutput: '16W' }
  },
  { id: 'tv-6', category: 'televisions', brand: 'MoTech', name: 'MoTech TV 50" 4K', image: '/src/assets/images/redmi note 12.png', price: 399, oldPrice: 499, rating: 5,
    originalPrice: 499, discountedPrice: 399,
    description: 'Feature-packed 4K TV with rich colors and smart connectivity for streaming.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/xiaomi redmi 10 2022 pro.png','/src/assets/images/techno spark 5.png'],
    specifications: { screenSize: '50"', resolution: '4K Ultra HD', displayTechnology: 'LED', smartTvOs: 'Android TV', hdrSupport: 'HDR10', refreshRate: '60Hz', audioOutput: '20W' }
  },
  { id: 'tv-7', category: 'televisions', brand: 'MoTech', name: 'MoTech TV 58" 4K', image: '/src/assets/images/redmi note 12.png', price: 449, oldPrice: 549, rating: 5,
    originalPrice: 549, discountedPrice: 449,
    description: 'Balanced 4K TV with good brightness and sharp detail for movies and TV.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/techno spark 5.png','/src/assets/images/xiaomi redmi 10 2022 pro.png'],
    specifications: { screenSize: '58"', resolution: '4K Ultra HD', displayTechnology: 'LED', smartTvOs: 'Android TV', hdrSupport: 'HDR10', refreshRate: '60Hz', audioOutput: '20W' }
  },
  { id: 'tv-8', category: 'televisions', brand: 'MoTech', name: 'MoTech TV 85" 4K', image: '/src/assets/images/redmi note 12.png', price: 1499, oldPrice: 1699, rating: 5,
    originalPrice: 1699, discountedPrice: 1499,
    description: 'Massive 4K screen for cinematic viewing with smart OS and advanced HDR.',
    images: ['/src/assets/images/redmi note 12.png','/src/assets/images/xiaomi redmi 10 2022 pro.png','/src/assets/images/techno spark 5.png'],
    specifications: { screenSize: '85"', resolution: '4K Ultra HD', displayTechnology: 'LED', smartTvOs: 'Android TV', hdrSupport: 'Dolby Vision', refreshRate: '120Hz', audioOutput: '60W' }
  }
])

// Category filter state
const selectedCategory = ref('All')
const selectedCategoryKey = computed(() => selectedCategory.value.toLowerCase())
const router = useRouter()

const formatCurrency = (n) => `$${Number(n).toFixed(0)}`

// Brand filter per-category
const selectedBrandByCategory = ref({
  phones: 'All brands',
  laptops: 'All brands',
  smartwatches: 'All brands',
  televisions: 'All brands'
})

const setBrand = (category, label) => {
  selectedBrandByCategory.value[category] = label
}

const getFiltered = (category) => {
  const brandLabel = selectedBrandByCategory.value[category]
  let list = products.value.filter(p => p.category === category)
  if (!brandLabel || brandLabel.toLowerCase() === 'all brands') return list
  const key = brandLabel.toLowerCase()
  return list.filter(p => {
    const brand = (p.brand || '').toLowerCase()
    const name = (p.name || '').toLowerCase()
    if (key === 'redmi') {
      // Allow matching by model name for Redmi even if brand is Xiaomi
      return brand.includes('redmi') || name.includes('redmi')
    }
    return brand === key
  })
}

// Search/autocomplete state
const searchTerm = ref('')
const isSearchOpen = ref(false)
const highlightedIndex = ref(-1)
const searchResults = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return []
  let list = products.value
  if (selectedCategoryKey.value !== 'all') {
    list = list.filter(p => p.category === selectedCategoryKey.value)
  }
  return list
    .filter(p => p.name.toLowerCase().includes(term) || (p.brand && p.brand.toLowerCase().includes(term)))
    .slice(0, 8)
})

const openSearch = () => { isSearchOpen.value = true }
const closeSearch = () => { setTimeout(() => { isSearchOpen.value = false }, 120) }
const moveHighlight = (step) => {
  const len = searchResults.value.length
  if (!len) return
  isSearchOpen.value = true
  const next = highlightedIndex.value + step
  highlightedIndex.value = ((next % len) + len) % len
}
const onEnter = () => {
  const list = searchResults.value
  if (!list.length) return
  const idx = highlightedIndex.value >= 0 ? highlightedIndex.value : 0
  selectSuggestion(list[idx])
}
const selectSuggestion = (p) => {
  // Persist a lightweight snapshot for the detail page
  try { sessionStorage.setItem('selectedProduct', JSON.stringify(p)) } catch {}
  searchTerm.value = p.name
  isSearchOpen.value = false
  router.push({ name: 'product-page', params: { id: p.id } })
}

const gotoProduct = (p) => {
  try { sessionStorage.setItem('selectedProduct', JSON.stringify(p)) } catch {}
  router.push({ name: 'product-page', params: { id: p.id } })
}

// Add to cart: persist in sessionStorage under both 'cartItems' and 'cartproducts' for compatibility
const addToCart = (p) => {
  const addToKey = (key) => {
    try {
      const raw = sessionStorage.getItem(key)
      const cart = raw ? JSON.parse(raw) : []
      const idx = Array.isArray(cart) ? cart.findIndex(it => it.id === p.id) : -1
      if (idx >= 0) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1
      } else {
        cart.push({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          oldPrice: p.oldPrice ?? null,
          image: p.image,
          quantity: 1,
        })
      }
      sessionStorage.setItem(key, JSON.stringify(cart))
    } catch {}
  }
  addToKey('cartItems')
  addToKey('cartproducts')
}
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
            type="text"
            name="search-term"
            v-model="searchTerm"
            @focus="openSearch"
            @input="openSearch"
            @keydown.esc="isSearchOpen = false"
            @keydown.down.prevent="moveHighlight(1)"
            @keydown.up.prevent="moveHighlight(-1)"
            @keydown.enter.prevent="onEnter()"
            @blur="closeSearch"
            placeholder="Type the name of product"
            class="relative z-50 w-full p-2 sm:p-4 pr-[6rem] sm:pr-32 border-2 border-gray-300 rounded-md outline-none focus:border-[#68A4FE] placeholder:text-sm sm:placeholder:text-base text-sm sm:text-base bg-white dark:bg-white"
          />
          <button
            type="submit"
            class="z-50 text-sm sm:text-base absolute top-1/2 -translate-y-1/2 right-2 bg-[#68A4FE] rounded-md px-4 py-1 sm:py-2 text-white hover:bg-[#384857] transition-all duration-300 ease-in-out capitalize"
          >
            search
          </button>
          <!-- Backdrop overlay to dim the rest of the page when searching -->
          <div
            v-if="isSearchOpen && searchTerm"
            class="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
            aria-hidden="true"
            @click="isSearchOpen = false"
          ></div>
          <!-- Autocomplete dropdown -->
          <div
            v-if="isSearchOpen && searchTerm"
            class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-auto"
          >
            <ul v-if="searchResults.length > 0" class="divide-y divide-gray-100">
              <li
                v-for="(item, idx) in searchResults"
                :key="item.id"
                class="flex items-center gap-3 p-3 cursor-pointer"
                :class="{ 'bg-gray-100': idx === highlightedIndex, 'hover:bg-gray-50': idx !== highlightedIndex }"
                @mousedown.prevent
                @mouseenter="highlightedIndex = idx"
                @click="selectSuggestion(item)"
              >
                <img :src="item.image" :alt="item.name" class="w-10 h-10 object-contain flex-shrink-0" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-medium text-gray-800 truncate capitalize">{{ item.name }}</span>
                    <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(item.price) }}</span>
                  </div>
                  <div class="text-xs text-gray-500 capitalize">Brand: {{ item.brand || '—' }}</div>
                </div>
              </li>
            </ul>
            <div v-else class="p-3 text-sm text-gray-600">No results for "{{ searchTerm }}"</div>
          </div>
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
            <a href="#" @click.prevent="setBrand('phones','All brands')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.phones==='All brands'}" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" @click.prevent="setBrand('phones','Apple')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.phones==='Apple'}" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" @click.prevent="setBrand('phones','Samsung')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.phones==='Samsung'}" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" @click.prevent="setBrand('phones','redmi')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.phones==='redmi'}" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in getFiltered('phones')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs" @click="addToCart(p)">add to cart</button>
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
            <a href="#" @click.prevent="setBrand('laptops','All brands')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.laptops==='All brands'}" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" @click.prevent="setBrand('laptops','Apple')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.laptops==='Apple'}" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" @click.prevent="setBrand('laptops','Samsung')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.laptops==='Samsung'}" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" @click.prevent="setBrand('laptops','redmi')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.laptops==='redmi'}" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in getFiltered('laptops')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs" @click="addToCart(p)">add to cart</button>
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
            <a href="#" @click.prevent="setBrand('smartwatches','All brands')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.smartwatches==='All brands'}" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" @click.prevent="setBrand('smartwatches','Apple')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.smartwatches==='Apple'}" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" @click.prevent="setBrand('smartwatches','Samsung')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.smartwatches==='Samsung'}" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" @click.prevent="setBrand('smartwatches','redmi')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.smartwatches==='redmi'}" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in getFiltered('smartwatches')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs" @click="addToCart(p)">add to cart</button>
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
            <a href="#" @click.prevent="setBrand('televisions','All brands')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.televisions==='All brands'}" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" @click.prevent="setBrand('televisions','Apple')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.televisions==='Apple'}" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" @click.prevent="setBrand('televisions','Samsung')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.televisions==='Samsung'}" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" @click.prevent="setBrand('televisions','redmi')" :class="{'text-[#68A4FE] font-semibold': selectedBrandByCategory.televisions==='redmi'}" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in getFiltered('televisions')" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <i v-for="i in p.rating" :key="i" class="fa-solid fa-star"></i>
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs" @click="addToCart(p)">add to cart</button>
          </div>
        </div>
      </section>
    </main>
    <Footer/>
</template>
