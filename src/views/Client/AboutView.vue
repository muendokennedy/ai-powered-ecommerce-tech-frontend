<script setup>
import { ref, onMounted, computed } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ChevronRightIcon, ChevronLeftIcon, PlusIcon, MinusIcon } from '@heroicons/vue/24/solid'

// FAQ functionality
const activeAccordion = ref(null)

const toggleAccordion = (index) => {
  if (activeAccordion.value === index) {
    activeAccordion.value = null
  } else {
    activeAccordion.value = index
  }
}

const faqs = [
  {
    question: "How do I pay?",
    answer:
      "You can pay using M‑Pesa, PayPal, or a debit/credit card. For M‑Pesa, choose M‑Pesa at checkout, enter your phone number, and confirm the STK push on your phone. For PayPal, select PayPal and sign in to your PayPal account to authorize the payment. For card payments, enter your card number, expiry (MM/YY), CVV, and cardholder name. All payments are processed securely over encrypted connections."
  },
  {
    question: "How do I make an order?",
    answer:
      "Browse products, add your preferred items to the cart, then proceed to Checkout. Confirm your personal details and delivery location, pick your payment method (M‑Pesa, PayPal, or card), review the order summary, and tap ‘Place order’. You’ll receive an order confirmation instantly."
  },
  {
    question: "What are the available payment methods?",
    answer:
      "We currently support M‑Pesa (for customers in supported regions), PayPal, and major debit/credit cards (Visa, Mastercard). More methods may be added over time."
  },
  {
    question: "How long should I wait before delivery?",
    answer:
      "Standard delivery typically takes 1–3 business days within major cities and 3–7 business days for up‑country deliveries. You’ll get tracking updates once your order ships."
  },
  {
    question: "Do you deliver to my location?",
    answer:
      "We deliver nationwide. Enter your delivery address at checkout to see accurate shipping timelines. If your area requires special handling, our team will contact you."
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "If the order hasn’t been shipped yet, you can change or cancel it from your Orders page or by contacting support with your order number. Once shipped, changes aren’t guaranteed, but we’ll do our best to help."
  },
  {
    question: "What is your return policy?",
    answer:
      "You can return eligible items within 7 days of delivery in their original condition and packaging. Reach out to support with your order number to start a return. Certain items (like opened software or personal care items) may be non‑returnable."
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes. We use industry‑standard encryption and PCI‑compliant processors. We never store your full card details on our servers."
  }
]

const reviews = ref([
  {
    name: 'Jane Doe',
    image: '/src/assets/images/client-1.jpeg',
    content:
      'Amazing service! The team went above and beyond to deliver my project on time and with exceptional quality. Their attention to detail and professionalism made the entire experience stress-free.'
  },
  {
    name: 'John Smith',
    image: '/src/assets/images/client-2.jpeg',
    content:
      'Very professional team! They listened carefully to my needs, suggested brilliant ideas, and made sure I was satisfied at every stage. I highly recommend working with them if you want results.'
  },
  {
    name: 'Alice Brown',
    image: '/src/assets/images/client-3.jpeg',
    content:
      'Highly recommended! The communication was smooth, deadlines were met, and the final result exceeded my expectations. They genuinely care about their clients’ success.'
  },
  {
    name: 'Michael Green',
    image: '/src/assets/images/client-1.jpeg',
    content:
      'Love the experience! Everything was handled professionally and efficiently. I especially appreciated the frequent updates and transparency throughout the process.'
  }
])

const currentSlide = ref(0)

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % reviews.value.length
}

const prevSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + reviews.value.length) % reviews.value.length
}

const goToSlide = (index) => {
  currentSlide.value = index
}

// Read more toggles for About texts
const showFullHistory = ref(false)
const showFullMission = ref(false)
const showFullVision = ref(false)
</script>

<template>
    <Header/>
    <main class="menu-toggle">
        <section class="about-home pt-16 px-[4%] mx-auto lg:max-w-[1500px]">
          <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >
          About<span class="text-[#68A4FE] px-2">us</span>
        </div>
          <div class="hero-section flex flex-col md:flex-row gap-4 justify-between my-6 items-start">
            <div class="hero-image basis-[48%]">
              <img
                src="../../assets/images/logo.png"
                alt="The company logo"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="hero-content basis-[48%]">
              <h2 class="history-head text-xl md:text-3xl font-semibold capitalize">
                Our <span class="text-[#68A4FE] mb-2">History</span>
              </h2>
              <p class="history-content text-sm md:text-base font-normal my-4" :class="!showFullHistory ? 'line-clamp-2' : ''">
                MoTech began with a simple idea: make quality tech accessible to everyone.
                From our early days supplying a handful of devices to friends and family, we’ve grown into a trusted ecommerce brand serving customers nationwide. We partner with leading manufacturers and verified distributors so you get genuine products, transparent pricing, and reliable after‑sales support. What hasn’t changed is our customer‑first culture—every decision we make prioritizes your experience.
              </p>
              <button
                @click="showFullHistory = !showFullHistory"
                class="read-more bg-[#68A4FE] capitalize text-sm sm:text-base text-white px-4 py-2 rounded-md hover:bg-[#3b81eb] transition-all ease-in-out duration-300"
              >
                {{ showFullHistory ? 'read less' : 'read more' }}
              </button>
              <h2 class="mission-head my-4 text-xl md:text-3xl font-semibold capitalize">
                Our <span class="text-[#68A4FE]">Mission</span>
              </h2>
              <p class="mission-content text-sm md:text-base font-normal my-4" :class="!showFullMission ? 'line-clamp-2' : ''">
                Our mission is to simplify how people buy tech—through curated products, honest information, and dependable delivery. We work to remove friction at every step: discovering the right device, paying securely (M‑Pesa, PayPal, or card), and receiving your order on time. When questions arise, our support team is here to help until you’re satisfied.
              </p>
              <button
                @click="showFullMission = !showFullMission"
                class="read-more bg-[#68A4FE] capitalize text-sm sm:text-base text-white px-4 py-2 rounded-md hover:bg-[#3b81eb] transition-all ease-in-out duration-300"
              >
                {{ showFullMission ? 'read less' : 'read more' }}
              </button>
              <h2 class="vision-head text-xl md:text-3xl font-semibold capitalize my-4">
                Our <span class="text-[#68A4FE]">vision</span>
              </h2>
              <p class="vision-content text-sm md:text-base" :class="!showFullVision ? 'line-clamp-2' : ''">
                We envision a marketplace where everyone—students, creators, professionals—can access modern technology confidently and affordably. By investing in strong supplier relationships, efficient logistics, and thoughtful customer experiences, MoTech aims to be the most trusted name for tech in the region and beyond.
              </p>
              <button
                @click="showFullVision = !showFullVision"
                class="read-more bg-[#68A4FE] capitalize text-sm sm:text-base text-white px-4 py-2 rounded-md hover:bg-[#3b81eb] transition-all ease-in-out duration-300 mt-3"
              >
                {{ showFullVision ? 'read less' : 'read more' }}
              </button>
            </div>
          </div>
        </section>
        
        <section class="faq px-[4%] mx-auto lg:max-w-[1500px]">
          <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >
        Frequently asked questions(<span class="text-[#68A4FE] px-2">FAQ</span>)
        </div>
          <div class="accordion-container w-4/5 mx-auto my-4 space-y-4">
            <div 
              v-for="(faq, index) in faqs" 
              :key="index"
              class="accordion"
            >
              <header
                @click="toggleAccordion(index)"
                class="flex bg-[#536474] justify-between items-center px-[2%] py-2 md:py-4 text-white cursor-pointer hover:bg-[#4a5a6a] transition-colors duration-200"
              >
                <div class="accordion-head text-sm sm:text-base md:text-xl font-semibold">
                  {{ faq.question }}
                </div>
                <component
                  :is="activeAccordion === index ? MinusIcon : PlusIcon"
                  class="h-6 w-6 transition-transform duration-200"
                />
              </header>
              <div 
                :class="activeAccordion === index ? 'block' : 'hidden'"
                class="accordion-content text-sm md:text-base py-4 px-6 bg-gray-50 transition-all duration-300"
              >
                {{ faq.answer }}
              </div>
            </div>
          </div>
        </section>
        <section class="reviews px-[4%] mx-auto lg:max-w-[800px]">
  <!-- Heading -->
  <div class="heading text-[#384857] border-b-2 border-gray-300 text-xl sm:text-2xl font-semibold py-4 capitalize text-center">
    client<span class="text-[#68A4FE] px-2">reviews</span>
  </div>

  <!-- Carousel Container -->
  <div class="relative flex items-center justify-center mt-8">
    <!-- Previous Button -->
    <button
      @click="prevSlide"
      class="absolute left-0 sm:-left-12 bg-[#68A4FE] hover:bg-[#3b81eb] text-white p-3 rounded-full shadow-lg transition-all duration-200"
    >
      <ChevronLeftIcon class="size-8 font-extrabold cursor-pointer" />
    </button>

    <!-- Card (Only One Visible) -->
    <div class="overflow-hidden w-full max-w-md">
      <div
        class="flex transition-transform duration-500 ease-in-out"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div
          v-for="(review, index) in reviews"
          :key="`review-${index}`"
          class="flex-shrink-0 w-full bg-[#ECEEEF] text-center flex flex-col items-center p-8 rounded-lg shadow-md"
        >
          <!-- Client Image -->
          <div class="client-image w-24 h-24 mb-4">
            <img
              :src="review.image"
              :alt="`Client ${review.name}`"
              class="w-full h-full rounded-full object-cover shadow-md"
            />
          </div>

          <!-- Client Name -->
          <div class="client-name text-[#68A4FE] font-semibold text-lg mb-4">
            {{ review.name }}
          </div>

          <!-- Client Content -->
          <div class="client-content text-sm text-left leading-relaxed">
            {{ review.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- Next Button -->
    <button
      @click="nextSlide"
      class="absolute right-0 sm:-right-12 bg-[#68A4FE] hover:bg-[#3b81eb] text-white p-3 rounded-full shadow-lg transition-all duration-200"
    >
      <ChevronRightIcon class="size-8 font-extrabold" />
    </button>
  </div>

  <!-- Pagination Dots -->
  <div class="flex justify-center mt-6 space-x-2">
    <button
      v-for="(_, index) in reviews"
      :key="index"
      @click="goToSlide(index)"
      :class="currentSlide === index ? 'bg-[#68A4FE]' : 'bg-gray-300'"
      class="w-3 h-3 rounded-full transition-colors duration-200 hover:bg-[#68A4FE]"
    ></button>
  </div>
</section>

        <section class="payment-methods px-[4%] mx-auto lg:max-w-[1500px]">
          <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >
          payment<span class="text-[#68A4FE] px-2">methods</span>
        </div>
          <div class="payment-methods-container grid gap-8 my-8">
            <div class="payment-method-box border border-gray-300 p-4">
              <div
                class="payment-method-name text-[#384857] my-2 font-semibold text-lg sm:text-xl"
              >
                Visa & Mastercard
              </div>
              <div class="payment-method-content text-xs sm:text-sm my-4">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta,
                laboriosam.
              </div>
              <div class="payment-method-image w-full">
                <img
                  src="../../assets/images/visa and mastercard.jpeg"
                  alt="Visa payment card"
                  class="w-full"
                />
              </div>
            </div>
            <div class="payment-method-box border border-gray-300 p-4">
              <div
                class="payment-method-name text-[#384857] my-2 font-semibold text-lg sm:text-xl"
              >
                PayPal
              </div>
              <div class="payment-method-content text-xs sm:text-sm my-4">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta,
                laboriosam.
              </div>
              <div class="payment-method-image w-full">
                <img
                  src="../../assets/images/paypal image.png"
                  alt="Visa payment card"
                  class="w-full"
                />
              </div>
            </div>
            <div class="payment-method-box border border-gray-300 p-4">
              <div
                class="payment-method-name text-[#384857] my-2 font-semibold text-lg sm:text-xl"
              >
                M-Pesa
              </div>
              <div class="payment-method-content text-xs sm:text-sm my-4">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dicta,
                laboriosam.
              </div>
              <div class="payment-method-image w-full">
                <img
                  src="../../assets/images/mpesa4.jpeg"
                  alt="Visa payment card"
                  class="h-24 w-full"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer/>
</template>