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

// Field-specific errors
const fieldErrors = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

// Methods
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const validateField = (field) => {
  // Reset field error
  fieldErrors.value[field] = ''
  
  switch (field) {
    case 'email':
      if (!registerForm.value.email) {
        fieldErrors.value.email = 'Email is required'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(registerForm.value.email)) {
          fieldErrors.value.email = 'Please enter a valid email address'
        }
      }
      break
    case 'password':
      if (!registerForm.value.password) {
        fieldErrors.value.password = 'Password is required'
      } else if (registerForm.value.password.length < 6) {
        fieldErrors.value.password = 'Password must be at least 6 characters long'
      }
      break
    case 'confirmPassword':
      if (!registerForm.value.confirmPassword) {
        fieldErrors.value.confirmPassword = 'Please confirm your password'
      } else if (registerForm.value.password !== registerForm.value.confirmPassword) {
        fieldErrors.value.confirmPassword = 'Passwords do not match'
      }
      break
  }
}

const validateAllFields = () => {
  validateField('email')
  validateField('password')
  validateField('confirmPassword')
  
  return !fieldErrors.value.email && !fieldErrors.value.password && !fieldErrors.value.confirmPassword
}

const handleRegister = async () => {
  // Reset messages
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validate all fields
  if (!validateAllFields()) {
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

const handleSocialLogin = (provider) => {
  // Implement social login logic here
  console.log(`Login with ${provider}`)
  // This would typically redirect to OAuth provider or open popup
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
          
          <!-- Social Login Options -->
          <div class="social-login space-y-3 mb-6">
            <button
              @click="handleSocialLogin('google')"
              type="button"
              class="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-gray-300 rounded-md hover:border-gray-400 transition-colors duration-300"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="text-[#384857] font-medium">Continue with Google</span>
            </button>
            
            <button
              @click="handleSocialLogin('facebook')"
              type="button"
              class="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-gray-300 rounded-md hover:border-gray-400 transition-colors duration-300"
            >
              <svg class="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span class="text-[#384857] font-medium">Continue with Facebook</span>
            </button>
          </div>
          
          <!-- Divider -->
          <div class="divider flex items-center my-6">
            <div class="flex-1 border-t border-gray-300"></div>
            <div class="px-4 text-sm text-gray-500">or sign up with email</div>
            <div class="flex-1 border-t border-gray-300"></div>
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
                :class="[
                  'w-full p-3 border-2 rounded-md outline-none transition-colors duration-300',
                  fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#68a4fe]'
                ]"
                :disabled="isLoading"
                @blur="validateField('email')"
              />
              <p v-if="fieldErrors.email" class="text-red-500 text-sm mt-1">{{ fieldErrors.email }}</p>
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
                  :class="[
                    'w-full p-3 border-2 rounded-md outline-none transition-colors duration-300 pr-12',
                    fieldErrors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#68a4fe]'
                  ]"
                  :disabled="isLoading"
                  @blur="validateField('password')"
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
              <p v-if="fieldErrors.password" class="text-red-500 text-sm mt-1">{{ fieldErrors.password }}</p>
              <p v-else class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
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
                  :class="[
                    'w-full p-3 border-2 rounded-md outline-none transition-colors duration-300 pr-12',
                    fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#68a4fe]'
                  ]"
                  :disabled="isLoading"
                  @blur="validateField('confirmPassword')"
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
              <p v-if="fieldErrors.confirmPassword" class="text-red-500 text-sm mt-1">{{ fieldErrors.confirmPassword }}</p>
            </div>
            
            <!-- Register Button -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-6 bg-[#68a4fe] cursor-pointer hover:bg-[#5a94fe] text-white font-semibold rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Creating Account...</span>
              <span v-else>Create Account</span>
            </button>
          </form>
          
          <!-- Login Link -->
          <div class="text-center mt-6">
            <p class="text-sm text-[#384857]">
              Already have an account? 
              <button
                @click="goToLogin"
                class="text-[#68a4fe] hover:text-[#5a94fe] cursor-pointer underline font-medium transition-colors duration-300"
              >
                Sign in here
              </button>
            </p>
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
