<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Form state
const form = reactive({
  email: '',
  password: '',
  remember: false,
})
const errors = reactive({ email: '', password: '' })
const loading = ref(false)
const showPassword = ref(false)
const emailInput = ref(null)
const router = useRouter()

const validate = () => {
  errors.email = ''
  errors.password = ''

  if(!form.email){
    errors.email = 'Email is required'
  } else if(!/^\S+@\S+\.\S+$/.test(form.email)){
    errors.email = 'Enter a valid email address'
  }

  if (!form.password){
    errors.password = 'Password is required'
  }
  else if (form.password.length < 6){
    errors.password = 'Minimum 6 characters'
  }

  return !errors.email && !errors.password
}

const onSubmit = async () => {
  if (!validate()) return
  loading.value = true
  // Simulate authentication
  setTimeout(async () => {
    loading.value = false
    // Navigate to dashboard after success
    await router.push('/admin/dashboard')
  }, 800)
}

onMounted(() => {
  emailInput.value?.focus()
})
</script>

<template>
  <section class="min-h-screen">
    <main class="bg-[#E4E7F3] pt-20 px-[3%] pb-10 min-h-screen">
      <div class="bg-white p-6 sm:p-8 rounded-md w-full max-w-md mx-auto shadow-sm">
        <form @submit.prevent="onSubmit" novalidate>
          <h2 class="text-center text-2xl text-[#042EFF] font-semibold capitalize py-4 border-b-2">Admin Login</h2>

          <!-- Email -->
          <div class="mt-6">
            <label for="email" class="capitalize block py-2 text-sm text-gray-700">Enter your email:</label>
            <input
              ref="emailInput"
              v-model.trim="form.email"
              type="email"
              id="email"
              class="p-2 rounded-md border-2 outline-none w-full focus:border-[#042EFF] transition-all duration-300 ease-in-out"
              :aria-invalid="!!errors.email"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div class="mt-4">
            <label for="password" class="capitalize block py-2 text-sm text-gray-700">Enter your password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                id="password"
                class="p-2 rounded-md border-2 outline-none w-full pr-10 focus:border-[#042EFF] transition-all duration-300 ease-in-out"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5 3 1.73 7.11.46 10a1 1 0 000 .95C1.73 13.89 5 18 10 18s8.27-4.11 9.54-7.05a1 1 0 000-.95C18.27 7.11 15 3 10 3zm0 13c-3.86 0-6.86-3.41-7.94-6 .98-2.59 4.08-6 7.94-6s6.96 3.41 7.94 6c-.98 2.59-4.08 6-7.94 6z"/><path d="M10 6a4 4 0 100 8 4 4 0 000-8z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.53 2.47a.75.75 0 10-1.06 1.06l18 18a.75.75 0 101.06-1.06l-2.27-2.27a13.86 13.86 0 003.02-3.25.98.98 0 000-.9C20.97 9.1 16.02 5 12 5a8.85 8.85 0 00-3.98.97L3.53 2.47zM12 6.5c3.55 0 7.1 3.32 8.36 5.5a12.22 12.22 0 01-2.65 3.03l-2.19-2.19A4 4 0 0010 8.68L8.21 6.9A7.35 7.35 0 0112 6.5zm0 11c-3.55 0-7.1-3.32-8.36-5.5a12.25 12.25 0 012.68-3.07l2.13 2.13A4 4 0 0012 16.5c.67 0 1.31-.16 1.87-.44l2 2c-1.14.3-2.39.44-3.87.44z"/></svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Extras -->
          <div class="mt-4 flex items-center justify-between">
            <label class="inline-flex items-center gap-2">
              <input v-model="form.remember" type="checkbox" class="rounded border-gray-300 text-[#042EFF] focus:ring-[#042EFF]" />
              <span class="text-sm text-gray-700">Remember me</span>
            </label>
            <a href="#" class="text-sm text-[#042eff] hover:underline transition-all duration-300 ease-in-out">Forgot password?</a>
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="loading" class="cursor-pointer mt-6 text-white bg-[#042EFF] w-full px-4 py-3 rounded-md capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center">
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
            <span>{{ loading ? 'Logging in...' : 'Proceed as admin' }}</span>
          </button>
        </form>
      </div>
    </main>
  </section>
</template>

<style scoped>
input:focus, textarea:focus, select:focus { 
  outline: none; 
  }
</style>