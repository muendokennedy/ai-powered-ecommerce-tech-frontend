<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

// Reactive data
const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Methods
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleRegister = async () => {
  // Reset messages
  errorMessage.value = ''
  successMessage.value = ''
  
  // Basic validation
  if (!registerForm.value.email || !registerForm.value.password || !registerForm.value.confirmPassword) {
    errorMessage.value = 'Please fill in all fields'
    return
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.value.email)) {
    errorMessage.value = 'Please enter a valid email address'
    return
  }
  
  // Password validation
  if (registerForm.value.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long'
    return
  }
  
  // Password match validation
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  isLoading.value = true
  
  try {
    // Simulate API call - replace with actual registration
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate successful registration
    successMessage.value = 'Account created successfully! Redirecting to login...'
    
    // Wait a moment then redirect to login
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (error) {
    errorMessage.value = 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <Header/>
  <main class="menu-toggle">
    <section class="register-section mx-auto pt-16 px-[4%] lg:max-w-[1500px]">
      <div class="heading text-[#384857] border-b-2 border-gray-300 text-base sm:text-xl font-semibold py-2 sm:py-4 capitalize">
        Create your account
      </div>
      
      <div class="register-container flex justify-center items-center min-h-[70vh] py-8">
        <div class="register-form bg-white border-2 border-gray-300 rounded-lg p-8 w-full max-w-md shadow-lg">
          <h2 class="text-2xl font-semibold text-[#384857] text-center mb-6">Join MoTech</h2>
          
          <!-- Success Message -->
          <div v-if="successMessage" class="success-message mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            {{ successMessage }}
          </div>
          
          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {{ errorMessage }}
          </div>
          
          <form @submit.prevent="handleRegister" class="space-y-6">
            <!-- Email Field -->
            <div class="form-group">
              <label for="email" class="block text-sm font-medium text-[#384857] mb-2">
                Email Address
              </label>
              <input
                id="email"
                v-model="registerForm.email"
                type="email"
                placeholder="Enter your email"
                class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe] transition-colors duration-300"
                :disabled="isLoading"
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
                  v-model="registerForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a password"
                  class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe] transition-colors duration-300 pr-12"
                  :disabled="isLoading"
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
              <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
            
            <!-- Confirm Password Field -->
            <div class="form-group">
              <label for="confirmPassword" class="block text-sm font-medium text-[#384857] mb-2">
                Confirm Password
              </label>
              <div class="relative">
                <input
                  id="confirmPassword"
                  v-model="registerForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  class="w-full p-3 border-2 border-gray-300 rounded-md outline-none focus:border-[#68a4fe] transition-colors duration-300 pr-12"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="toggleConfirmPasswordVisibility"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#68a4fe]"
                  :disabled="isLoading"
                >
                  <EyeIcon v-if="!showConfirmPassword" class="w-5 h-5" />
                  <EyeSlashIcon v-else class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <!-- Register Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-6 bg-[#ffcf10] hover:bg-[#e6ba0f] text-white font-semibold rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Creating Account...</span>
              <span v-else>Create Account</span>
            </button>
          </form>
          
          <!-- Divider -->
          <div class="divider flex items-center my-6">
            <div class="flex-1 border-t border-gray-300"></div>
            <div class="px-4 text-sm text-gray-500">or</div>
            <div class="flex-1 border-t border-gray-300"></div>
          </div>
          
          <!-- Login Link -->
          <div class="text-center">
            <p class="text-sm text-[#384857] mb-4">Already have an account?</p>
            <button
              @click="goToLogin"
              class="w-full py-3 px-6 border-2 border-[#68a4fe] text-[#68a4fe] hover:bg-[#68a4fe] hover:text-white font-semibold rounded-md transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
  <Footer/>
</template>

<style scoped>
/* Additional styling for the register form */
.register-form {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.form-group input:focus {
  box-shadow: 0 0 0 3px rgba(104, 164, 254, 0.1);
}

.error-message, .success-message {
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
