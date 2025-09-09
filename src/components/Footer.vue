<script setup>
</script>

<template>
    <footer class="bg-[#384857] px-[4%] pt-6 sm:pt-10 mt-8 mx-auto lg:max-w-[1500px]">
      <div
        class="footer-box gap-10 grid footer-grid border-b py-4 sm:py-8 border-[#8DAFCF]"
      >
        <div class="footer-box flex flex-col">
          <div
            class="box-heading text-white py-6 text-xl font-semibold capitalize"
          >
            Quick Links
          </div>
          <a href="index.html" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Home</a
          >
          <a href="about.html" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >About us</a
          >
          <a href="products.html" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Products</a
          >
          <a href="cart.html" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Cart</a
          >
        </div>
        <div class="footer-box flex flex-col">
          <div
            class="box-heading text-white py-6 text-xl font-semibold capitalize"
          >
            Social media
          </div>
          <a href="#" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Facebook</a
          >
          <a href="#" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Twitter</a
          >
          <a href="#" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Instagram</a
          >
          <a href="#" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Pinterest</a
          >
        </div>
        <div class="footer-box flex flex-col">
          <div
            class="box-heading text-white py-6 text-xl font-semibold capitalize"
          >
            MoTech
          </div>
          <p class="text-sm text-[#8DAFCF]">
            Eius Vel Sequi Maiores Atque Voluptates Fugiat. Aut Fugit Nobis
          </p>
        </div>
        <div class="footer-box flex flex-col">
          <div class="box-heading text-white py-6 text-xl font-semibold">
            Newsletter
          </div>
          <div class="input-box  flex w-full relative h-10">
            <input
              type="text"
              name="newsletter-email"
              placeholder="Enter your email"
              class="w-full h-full bg-white outline-none rounded-md px-3 text-xs pr-24"
            />
            <button type="submit" class="absolute bg-[#68A4FE] py-2 px-3 text-xs top-1/2 -translate-y-1/2 text-white capitalize rounded-md right-[0.325rem] hover:bg-[#384857] transtion-all duration-300 ease-in-out">
              subscribe
            </button>
          </div>
          <p class="text-sm text-[#8DAFCF] py-3">
            Subscribe to receive product updates
          </p>
          <div class="social-icons flex gap-10 text-[#8DAFCF] my-3">
            <a href="#" class="hover:text-white">
                <font-awesome-icon :icon="['fab', 'facebook-f']" />
            </a>
            <a href="#" class="hover:text-white"
              ><i class="fa-brands fa-x-twitter"></i
            ></a>
            <a href="#" class="hover:text-white"
              ><i class="fa-brands fa-instagram"></i
            ></a>
            <a href="#" class="hover:text-white"
              ><i class="fa-brands fa-pinterest"></i
            ></a>
          </div>
        </div>
        <div class="footer-box flex flex-col">
          <div
            class="box-heading text-white py-6 text-xl font-semibold capitalize"
          >
            Account
          </div>
          <a href="signup.html" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Signup</a
          >
          <a href="login.html" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Login</a
          >
          <a href="cart.html" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Wishlist</a
          >
          <a href="#" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Newsletters</a
          >
        </div>
        <div class="footer-box flex flex-col">
          <div
            class="box-heading text-white py-6 text-xl font-semibold capitalize"
          >
            more links
          </div>
          <a href="#" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Delivery Information</a
          >
          <a href="#" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Terms & Conditions</a
          >
          <a href="#" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Privacy Policy</a
          >
          <a href="#" class="text-[#8DAFCF] py-1 text-sm hover:text-[#68A4FE]"
            >Contact us</a
          >
        </div>
      </div>
      <div
        class="copyright-text text-center text-[#8DAFCF] text-sm py-6 capitalize"
      >
        &#169; official website of MoTech | all rights reserved
      </div>
    </footer>
</template>
