<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/vue/24/solid'

const slides = ref([
      {
        title: "Mobile Ready",
        product: "Xiaomi Redmi Note 4",
        description: "The Redmi 8A Dual Comes With AI Portrait Mode And AI Scene Detection",
        image: "../../public/images/redmi note 12.png",
        bgColor: "bg-[#536474]",
      },
      {
        title: "Mobile Ready",
        product: "Techno Spark 10P",
        description: "The Redmi 8A Dual Comes With AI Portrait Mode And AI Scene Detection",
        image: "../../public/images/redmi note 12.png",
        bgColor: "bg-[#28a9c9]",
      },
      {
        title: "Mobile Ready",
        product: "Samsung Galaxy A50",
        description: "The Redmi 8A Dual Comes With AI Portrait Mode And AI Scene Detection",
        image: "../../public/images/redmi note 12.png",
        bgColor: "bg-[#b237be]",
      },
    ]);

    const currentIndex = ref(0);
    let intervalId = null;

    const next = () => {
      currentIndex.value = (currentIndex.value + 1) % slides.value.length;
    };

    const prev = () => {
      currentIndex.value =
        (currentIndex.value - 1 + slides.value.length) % slides.value.length;
    };

    const startAutoPlay = () => {
      intervalId = setInterval(() => {
        next();
      }, 3000);
    };

    const stopAutoPlay = () => {
      clearInterval(intervalId);
    };

    onMounted(() => {
      startAutoPlay();
    });

    onBeforeUnmount(() => {
      stopAutoPlay();
    });


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
        v-for="(slide, index) in slides"
        :key="index"
        class="slide home min-h-screen w-full px-[6%] sm:px-[4%] md:pl-[4%] mx-auto scroll-mt-[100px] lg:max-w-[1500px] flex-col-reverse relative md:flex-row pb-16 md:pb-4"
        :class="[slide.bgColor, {'active': currentIndex === index, '': currentIndex !== index}]"
      >
        <div class="slide-content basis-2/4 flex justify-center items-start flex-col">
          <h3 class="text-lg sm:text-xl font-semibold text-white capitalize sm:my-4 my-1">
            {{ slide.title }}
          </h3>
          <h1 class="text-2xl sm:text-3xl text-white font-semibold my-2 sm:my-4">
            {{ slide.product }}
          </h1>
          <div class="hero-description text-sm sm:text-lg font-normal text-white mb-6">
            {{ slide.description }}
          </div>
          <button class="shop-btn text-white text-base sm:text-lg font-semibold bg-[#68A4FE] py-2 sm:py-4 px-8 sm:px-11 rounded-md capitalize cursor-pointer hover:bg-[#3b81eb] transition-all
           duration-300 ease-in-out">
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
            v-for="(slide, index) in slides"
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
        <div class="top-sales-container grid mx-auto w-[95%]">
          <div class="product-box text-center my-2 sm:my-4">
            <div class="flex justify-center items-center">
              <a href="productpage.html" class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
              </a>
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
              <a href="productpage.html" class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
              </a>
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
              <a href="productpage.html" class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
              </a>
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
              <a href="productpage.html" class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
              </a>
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
              <a href="productpage.html" class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
              </a>
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
      <!-- The products on offer section -->
      <section class="top-sales px-[4%] mx-auto lg:max-w-[1500px]">
        <div
          class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize"
        >
          on<span class="text-[#68A4FE] px-2">special</span> offer
        </div>
        <div class="filter-bar flex justify-between sm:justify-end items-center my-2 sm:my-4">
          <div class="filter-tags space-x-4 capitalize text-xs sm:text-sm">
            <a href="#" class="hover:text-[#68A4FE]">All brands</a>
            <a href="#" class="hover:text-[#68A4FE]">Apple</a>
            <a href="#" class="hover:text-[#68A4FE]">Samsung</a>
            <a href="#" class="hover:text-[#68A4FE]">redmi</a>
          </div>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%] gap-3">
          <div class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone" />
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
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div
                class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50"
              >
                $206
              </div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">$136</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
          <div class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone" />
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
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div
                class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50"
              >
                $206
              </div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">$136</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
          <div class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone" />
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
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div
                class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50"
              >
                $206
              </div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">$136</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
          <div class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone" />
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
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div
                class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50"
              >
                $206
              </div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">$136</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
          <div class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone" />
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
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div
                class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50"
              >
                $206
              </div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">$136</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
          <div class="product-box text-center my-2 sm:my-4 border-2 border-gray-300 py-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone" />
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
            <div class="flex justify-between w-20 sm:w-24 mx-auto">
              <div
                class="deal-price my-1 text-xs sm:text-base sm:my-3 font-semibold line-through opacity-50"
              >
                $206
              </div>
              <div class="first-price my-1 text-xs sm:text-base sm:my-3 font-semibold">$136</div>
            </div>
            <button class="add-cart-btn text-xs">add to cart</button>
          </div>
        </div>
        <div class="offer-container flex my-4 sm:my-8 gap-6 flex-col sm:flex-row">
          <div
            class="offer-box bg-[#ECEEEF] flex flex-col md:flex-row gap-1 md:gap-2 items-center basis-[48%] py-4 px-4 md:p-2"
          >
            <div class="basis-[48%] px-3 sm:px-0">
              <img src="../../public/images/redmi note 12.png" alt="A product on offer" class=" scale-50 object-cover md:scale-100"/>
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
            class="offer-box bg-[#ECEEEF] flex flex-col md:flex-row gap-1 md:gap-2 items-center basis-[48%] py-4 px-4 md:p-2"
          >
            <div class="basis-[48%] px-3 sm:px-0">
              <img src="../../public/images/dell inspiron.png" alt="A product on offer" class=" scale-50 object-cover md:scale-100"/>
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
          Top<span class="text-[#68A4FE] px-2">Sales</span>
        </div>
        <div class="top-sales-container grid mx-auto w-[95%]">
          <div class="product-box text-center my-2 sm:my-4">
            <div class="flex justify-center items-center">
              <div class="product-image">
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
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
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
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
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
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
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
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
                <img src="../../public/images/redmi note 12.png" alt="A mobile phone"/>
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

