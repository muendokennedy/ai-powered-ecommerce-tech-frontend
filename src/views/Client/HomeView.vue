<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ChevronRightIcon, ChevronLeftIcon, StarIcon } from '@heroicons/vue/24/solid'

// Products data (same structure as ProductsView.vue)
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

// Hero slider products: Dell Latitude 5320, Redmi Note 12, iPhone 14
const heroSlides = computed(() => {
  const order = ['dell latitude 5320','redmi note 12','iphone 14']
  const colors = ['bg-[#536474]','bg-[#28a9c9]','bg-[#b237be]']
  return order.map((name, idx) => {
    const prod = products.value.find(p => (p.name || '').toLowerCase() === name)
    if (!prod) return null
    return {
      title: 'Mobile Ready',
      productName: prod.name,
      description: prod.description,
      image: prod.image,
      bgColor: colors[idx] || 'bg-[#536474]',
      product: prod
    }
  }).filter(Boolean)
})

const currentIndex = ref(0)
const next = () => { currentIndex.value = (currentIndex.value + 1) % heroSlides.value.length }
const prev = () => { currentIndex.value = (currentIndex.value - 1 + heroSlides.value.length) % heroSlides.value.length }
const startAutoPlay = () => { setInterval(() => { next() }, 3000) }
onMounted(() => { startAutoPlay() })

// Derived lists for sections
const topSales = computed(() => products.value.slice(0, 6))
const specialOffers = computed(() => products.value.slice(6, 12))
// Brand filter for Special Offers (same behavior as ProductsView)
const selectedOfferBrand = ref('All brands')
const filterByBrand = (list, label) => {
  const brandLabel = (label || '').toLowerCase()
  if (!brandLabel || brandLabel === 'all brands') return list
  return list.filter(p => {
    const brand = (p.brand || '').toLowerCase()
    const name = (p.name || '').toLowerCase()
    if (brandLabel === 'redmi') {
      return brand.includes('redmi') || name.includes('redmi')
    }
    return brand === brandLabel
  })
}
const specialOffersFiltered = computed(() => filterByBrand(specialOffers.value, selectedOfferBrand.value))
const setOfferBrand = (label) => { selectedOfferBrand.value = label }
const newArrivals = computed(() => products.value.slice(12, 17))

// Promo products (for clickable offer boxes)
const promoRedmiProduct = computed(() =>
  products.value.find(p => (p.name || '').toLowerCase().includes('redmi note 12'))
)
const promoDellProduct = computed(() =>
  products.value.find(p => (p.name || '').toLowerCase().includes('dell inspiron'))
)

// Navigation to product page (same pattern as ProductsView.vue)
const router = useRouter()
const gotoProduct = (p) => {
  try { sessionStorage.setItem('selectedProduct', JSON.stringify(p)) } catch {}
  router.push({ name: 'product-page', params: { id: p.id } })
}

const formatCurrency = (n) => `$${Number(n).toFixed(0)}`

const shopSlide = (slide) => { if (slide?.product) gotoProduct(slide.product) }

</script>

<template>
    <Header/>
    <main  class="scroll-pt-32 menu-toggle">
      <!-- The landing page home page section -->
    <div class="carousel-container relative overflow-hidden">
    <!-- Slides -->
    <div
      class="slides flex transition-transform duration-500">
      <section
        v-for="(slide, index) in heroSlides"
        :key="index"
        class="slide home min-h-screen w-full px-[6%] sm:px-[4%] md:pl-[4%] mx-auto scroll-mt-[100px]  flex-col-reverse relative md:flex-row pb-16 md:pb-4"
        :class="[slide.bgColor, {'active': currentIndex === index, '': currentIndex !== index}]"
      >
        <div class="slide-content basis-2/4 flex justify-center items-start flex-col">
          <h3 class="text-lg sm:text-xl font-semibold text-white capitalize sm:my-4 my-1">
            {{ slide.title }}
          </h3>
          <h1 class="text-2xl sm:text-3xl text-white font-semibold my-2 sm:my-4">
            {{ slide.productName }}
          </h1>
          <div class="hero-description text-sm sm:text-lg font-normal text-white mb-6">
            {{ slide.description }}
          </div>
          <button @click="shopSlide(slide)" class="shop-btn text-white text-base sm:text-lg font-semibold bg-[#68A4FE] py-2 sm:py-4 px-8 sm:px-11 rounded-md capitalize cursor-pointer hover:bg-[#3b81eb] transition-all
           duration-300 ease-in-out" aria-label="Shop now: view product details">
            shop now
          </button>
          <span class="text-white my-4 block">up to 50% off</span>
        </div>
        <div class="home-1 slide-image basis-2/4 flex justify-center items-center scale-[0.6] md:scale-100 pt-10"
        :class="currentIndex === 0 ? 'home-1' : currentIndex === 1 ? 'home-2' : 'home-3'">
            <div class="hero-image">
                <img :src="slide.image" alt="Slide image" />
            </div>
        </div>
        <!-- Progress Indicators -->
        <div class="progress-container absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-4">
          <div
            v-for="(slide, index) in heroSlides"
            :key="index"
            class="progress-bar h-3 w-10 sm:w-20 rounded-md"
            :class="currentIndex === index ? 'bg-[#68A4FE]' : 'bg-white'"
          ></div>
        </div>
        <!-- Navigation Buttons -->
        <div @click="prev" id="prev" class="flex items-center justify-center prev absolute left-0 cursor-pointer">
          <ChevronLeftIcon class="size-8 font-extrabold" />
        </div>
        <div @click="next" id="next" class="next flex items-center justify-center absolute right-0 cursor-pointer">
          <ChevronRightIcon class="size-8 font-extrabold" />
        </div>
      </section>
    </div>


  </div>

      <!-- The top sales section -->
      <section class="top-sales px-[4%] mx-auto lg:max-w-[1500px]">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4"
        >
          Top<span class="text-[#68A4FE] px-2">Sales</span>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in topSales" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <StarIcon class="inline size-4 sm:size-5 text-[#FFCF10]" v-for="i in p.rating" :key="i" />
            </div>
            <div class="first-price my-1 sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
        </div>
      </section>
      <!-- The products on offer section -->
      <section class="top-sales px-[4%] mx-auto lg:max-w-[1500px]">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >
          on<span class="text-[#68A4FE] px-2">special</span> offer
        </div>
        <div class="filter-bar flex justify-between sm:justify-end items-center my-2 sm:my-4">
          <div class="filter-tags space-x-4 capitalize text-xs sm:text-sm">
            <a href="#" @click.prevent="setOfferBrand('All brands')" :class="{'text-[#68A4FE] font-semibold': selectedOfferBrand==='All brands'}" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" @click.prevent="setOfferBrand('Apple')" :class="{'text-[#68A4FE] font-semibold': selectedOfferBrand==='Apple'}" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" @click.prevent="setOfferBrand('Samsung')" :class="{'text-[#68A4FE] font-semibold': selectedOfferBrand==='Samsung'}" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" @click.prevent="setOfferBrand('redmi')" :class="{'text-[#68A4FE] font-semibold': selectedOfferBrand==='redmi'}" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in specialOffersFiltered" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name" />
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <StarIcon class="inline size-4 sm:size-5 text-[#FFCF10]" v-for="i in p.rating" :key="i" />
            </div>
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50">{{ formatCurrency(p.oldPrice) }}</div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
        </div>
        <div class="offer-container flex my-4 sm:my-8 gap-6 flex-col sm:flex-row">
          <div
            class="offer-box bg-[#ECEEEF] flex flex-col md:flex-row gap-1 md:gap-2 items-center basis-[48%] py-4 px-4 md:p-2 cursor-pointer hover:shadow-lg transition"
            role="button" tabindex="0"
            @click="promoRedmiProduct && gotoProduct(promoRedmiProduct)"
            @keydown.enter.prevent="promoRedmiProduct && gotoProduct(promoRedmiProduct)"
            @keydown.space.prevent="promoRedmiProduct && gotoProduct(promoRedmiProduct)"
            aria-label="View Redmi Note 12 product details"
          >
            <div class="basis-[48%] px-3 sm:px-0">
              <img src="../../assets/images/redmi note 12.png" alt="A product on offer" class=" scale-50 object-cover md:scale-100"/>
            </div>
            <div class="content">
              <div class="content-head font-bold capitalize">
                <span class="pr-2 text-[#68A4FE] text-sm sm:text-base">50% discount</span>Plus free
                shipping
              </div>
              <div class="basis-[48%] content-head text-xs sm:text-sm">
                This applies to all new releases of Xiaomi Redmi 10 for a
                limited amount of time
              </div>
            </div>
          </div>
          <div
            class="offer-box bg-[#ECEEEF] flex flex-col md:flex-row gap-1 md:gap-2 items-center basis-[48%] py-4 px-4 md:p-2 cursor-pointer hover:shadow-lg transition"
            role="button" tabindex="0"
            @click="promoDellProduct && gotoProduct(promoDellProduct)"
            @keydown.enter.prevent="promoDellProduct && gotoProduct(promoDellProduct)"
            @keydown.space.prevent="promoDellProduct && gotoProduct(promoDellProduct)"
            aria-label="View Dell Inspiron product details"
          >
            <div class="basis-[48%] px-3 sm:px-0">
              <img src="../../assets/images/dell inspiron.png" alt="A product on offer" class=" scale-50 object-cover md:scale-100"/>
            </div>
            <div class="content">
              <div class="content-head font-bold capitalize">
                <span class="pr-2 text-[#68A4FE] text-sm sm:text-base">50% discount</span>Plus free
                gift
              </div>
              <div class="basis-[48%] content-head text-xs sm:text-sm">
                This applies to all new releases of Dell inspiron laptops
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- The new arrivals section -->
      <section class="top-sales px-[4%] mx-auto lg:max-w-[1500px]">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4"
        >
          New<span class="text-[#68A4FE] px-2">Arrivals</span>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div v-for="p in newArrivals" :key="p.id" class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image cursor-pointer" role="button" tabindex="0" @click="gotoProduct(p)" @keydown.enter.prevent="gotoProduct(p)" @keydown.space.prevent="gotoProduct(p)">
                <img :src="p.image" :alt="p.name"/>
              </div>
            </div>
            <div class="product-title text-sm font-normal sm:font-semibold capitalize cursor-pointer hover:text-[#68A4FE]" @click="gotoProduct(p)">{{ p.name }}</div>
            <div class="star-box text-center text-xs sm:text-base text-[#FFCF10] my-2 sm:my-4">
              <StarIcon class="inline size-4 sm:size-5 text-[#FFCF10]" v-for="i in p.rating" :key="i" />
            </div>
            <div class="first-price my-1 sm:my-3 font-semibold">{{ formatCurrency(p.price) }}</div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
        </div>
      </section>
    </main>
    <Footer/>
</template>

<style scoped>
.carousel-container {
  width: 100%;
  position: relative;
}

/* .slides {
  display: flex;
  width: 300%;
} */

.slide {
  flex: 1 0 100%;
}

/* .prev,
.next {
  font-size: 2rem;
  color: white;
}

.progress-bar {
  height: 3px;
  width: 40px;
  margin-right: 4px;
} */
 
  #prev,
  #next {
    position: absolute;
    height: 3.125rem;
    width: 3.125rem;
    line-height: 3.125rem;
    text-align: center;
    top: 90%;
    transform: translateY(-90%);
    color: #fff;
    font-size: 2.5rem;
    cursor: pointer;
    font-weight: 400;
    background: #384857;
    border-radius: 0.375rem;
  }
  #prev {
    left: 1.25rem;
  }
  #next {
    right: 1.25rem;
  }

  @media only screen and (max-width: 768px) {
    #prev,
    #next {
      top: 30%;
      transform: translateY(-30%);
      height: 2.5rem;
      width: 2.5rem;
      line-height: 2.5rem;
    }
  }
</style>

