<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

// Reactive data
const loginForm = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// Methods
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  // Reset error message
  errorMessage.value = ''
  
  // Basic validation
  if (!loginForm.value.email || !loginForm.value.password) {
    errorMessage.value = 'Please fill in all fields'
    return
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(loginForm.value.email)) {
    errorMessage.value = 'Please enter a valid email address'
    return
  }
  
  isLoading.value = true
  
  try {
    // Simulate API call - replace with actual authentication
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate successful login
    // In real app, you would validate against backend and store auth token
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userEmail', loginForm.value.email)
    
    // Redirect to checkout or return to previous page
    const returnTo = router.currentRoute.value.query.returnTo || '/checkout'
    router.push(returnTo)
    
  } catch (error) {
    errorMessage.value = 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <Header/>
  <main class="menu-toggle">
    <section class="login-section mx-auto pt-16 px-[4%] lg:max-w-[1500px]">
      <div class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize">
        Login to your account
      </div>
      
      <div class="login-container flex justify-center items-center min-h-[60vh] py-8">
        <div class="login-form bg-white border-2 border-gray-300 rounded-lg p-8 w-full max-w-md shadow-lg">
          <h2 class="text-2xl font-semibold text-[#384857] text-center mb-6">Welcome Back</h2>
          
          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {{ errorMessage }}
          </div>
          
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Email Field -->
            <div class="form-group">
              <label for="email" class="block text-sm font-medium text-[#384857] mb-2">
                Email Address
              </label>
              <input
                id="email"
                v-model="loginForm.email"
                type="email"
                placeholder="Enter your email"
                class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe] transition-colors duration-300"
                :disabled="isLoading"
                required
              />
            </div>
            
            <!-- Password Field -->
            <div class="form-group">
              <label for="password" class="block text-sm font-medium text-[#384857] mb-2">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe] transition-colors duration-300 pr-12"
                  :disabled="isLoading"
                  required
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#68a4fe]"
                  :disabled="isLoading"
                >
                  <EyeIcon v-if="!showPassword" class="w-5 h-5" />
                  <EyeSlashIcon v-else class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <!-- Login Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-6 bg-[#68a4fe] hover:bg-[#5a94fe] text-white font-semibold rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Logging in...</span>
              <span v-else>Login</span>
            </button>
          </form>
          
          <!-- Divider -->
          <div class="divider flex items-center my-6">
            <div class="flex-1 border-t border-gray-300"></div>
            <div class="px-4 text-sm text-gray-500">or</div>
            <div class="flex-1 border-t border-gray-300"></div>
          </div>
          
          <!-- Register Link -->
          <div class="text-center">
            <p class="text-sm text-[#384857] mb-4">Don't have an account?</p>
            <button
              @click="goToRegister"
              class="w-full py-3 px-6 border-2 border-[#68a4fe] text-[#68a4fe] hover:bg-[#68a4fe] hover:text-white font-semibold rounded-md transition-all duration-300"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
  <Footer/>
</template>

<style scoped>
/* Additional styling for the login form */
.login-form {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.form-group input:focus {
  box-shadow: 0 0 0 3px rgba(104, 164, 254, 0.1);
}

.error-message {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
