<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Departments aligned with SettingsView
const departments = ['Operations','Customer Service','Inventory','Marketing']

const form = reactive({
  name: '',
  email: '',
  phone: '',
  department: '',
  location: '',
  password: '',
  confirmPassword: '',
  remember: false,
})

const errors = reactive({})
const loading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)
const emailInput = ref(null)

// Avatar upload in-place (same pattern as SettingsView)
const newAvatarPreview = ref('')
const isDraggingAvatar = ref(false)
const fileInputRef = ref(null)

function triggerAvatarSelect() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function handleAvatarFileList(files) {
  if (!files || !files.length) {
    return
  }

  const file = files[0]

  if (!file.type.startsWith('image/')) {
    errors.avatar = 'Please select an image file'
    return
  }

  if (newAvatarPreview.value) {
    URL.revokeObjectURL(newAvatarPreview.value)
  }

  newAvatarPreview.value = URL.createObjectURL(file)
  errors.avatar = ''
}

function onAvatarChange(e) {
  handleAvatarFileList(e.target.files)
}

function onAvatarDrop(e) {
  e.preventDefault()
  isDraggingAvatar.value = false
  handleAvatarFileList(e.dataTransfer.files)
}

function onAvatarDragOver(e) {
  e.preventDefault()
  isDraggingAvatar.value = true
}

function onAvatarDragLeave(e) {
  e.preventDefault()
  isDraggingAvatar.value = false
}

const router = useRouter()

const validate = () => {
  // Name
  errors.name = ''
  if (!form.name) {
    errors.name = 'Full name is required'
  }

  // Email
  errors.email = ''
  if (!form.email) {
    errors.email = 'Email is required'
  } else {
    const emailRe = /^\S+@\S+\.\S+$/
    if (!emailRe.test(form.email)) {
      errors.email = 'Enter a valid email'
    }
  }

  // Phone
  errors.phone = ''
  if (!form.phone) {
    errors.phone = 'Phone is required'
  }

  // Department
  errors.department = ''
  if (!form.department) {
    errors.department = 'Select a department'
  }

  // Location
  errors.location = ''
  if (!form.location) {
    errors.location = 'Location is required'
  }

  // Password
  errors.password = ''
  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 6) {
    errors.password = 'Minimum 6 characters'
  }

  // Confirm Password
  errors.confirmPassword = ''
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return Object.values(errors).every((v) => !v)
}

const onSubmit = async () => {
  const isValid = validate()
  if (!isValid) {
    return
  }

  loading.value = true
  setTimeout(async () => {
    loading.value = false
    // In a real app, send form + avatar file to API
    await router.push('/admin/dashboard')
  }, 900)
}

onMounted(() => {
  if (emailInput.value) {
    emailInput.value.focus()
  }
})
</script>

<template>
  <section class="min-h-screen">
    <main class="bg-[#E4E7F3] pt-20 px-[3%] pb-10 min-h-screen">
      <div class="bg-white p-6 sm:p-8 rounded-md w-full max-w-3xl mx-auto shadow-sm">
        <form @submit.prevent="onSubmit" novalidate>
          <h2 class="text-center text-2xl text-[#042EFF] font-semibold capitalize py-4 border-b-2">Create admin account</h2>

          <!-- Avatar in-place -->
          <div class="mt-6 flex flex-col items-center">
            <div
              @click="triggerAvatarSelect"
              @dragover="onAvatarDragOver"
              @dragleave="onAvatarDragLeave"
              @drop="onAvatarDrop"
              :class="['relative group rounded-full overflow-hidden cursor-pointer transition-all ring-4', isDraggingAvatar ? 'ring-[#042EFF] scale-105' : 'ring-white shadow']"
              style="width:120px; height:120px;"
            >
              <template v-if="newAvatarPreview">
                <img :src="newAvatarPreview" alt="Avatar" class="w-full h-full object-cover" />
              </template>
              <template v-else>
                <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" role="img" aria-label="User avatar placeholder" class="w-12 h-12 text-gray-400" fill="currentColor">
                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/>
                    <path d="M4 20.5C4 16.91 7.58 14 12 14s8 2.91 8 6.5V22H4v-1.5Z"/>
                  </svg>
                </div>
              </template>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[11px] font-medium space-y-0.5">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span>Upload</span>
                <span class="text-[9px] tracking-wide opacity-70">Drag or Click</span>
              </div>
              <div v-if="newAvatarPreview" class="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1 shadow">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </div>
            </div>
            <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
            <p class="mt-3 text-[10px] text-gray-500">PNG/JPG up to 5MB</p>
            <p v-if="errors.avatar" class="mt-1 text-xs text-red-600">{{ errors.avatar }}</p>
          </div>

          <!-- Name + Email -->
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="capitalize block py-2 text-sm text-gray-700">Full name</label>
              <input ref="emailInput" v-model.trim="form.name" type="text" class="p-2 rounded-md border-2 outline-none w-full focus:border-[#042EFF] transition-all duration-300 ease-in-out" />
              <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
            </div>
            <div>
              <label class="capitalize block py-2 text-sm text-gray-700">Email</label>
              <input v-model.trim="form.email" type="email" autocomplete="email" class="p-2 rounded-md border-2 outline-none w-full focus:border-[#042EFF] transition-all duration-300 ease-in-out" />
              <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
            </div>
          </div>

          <!-- Phone + Department -->
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="capitalize block py-2 text-sm text-gray-700">Phone</label>
              <input v-model.trim="form.phone" type="tel" class="p-2 rounded-md border-2 outline-none w-full focus:border-[#042EFF] transition-all duration-300 ease-in-out" />
              <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
            </div>
            <div>
              <label class="capitalize block py-2 text-sm text-gray-700">Department</label>
              <select v-model="form.department" class="p-2 rounded-md border-2 outline-none bg-white w-full focus:border-[#042EFF] transition-all duration-300 ease-in-out">
                <option value="" disabled>Select department</option>
                <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
              </select>
              <p v-if="errors.department" class="mt-1 text-xs text-red-600">{{ errors.department }}</p>
            </div>
          </div>

          <!-- Location -->
          <div class="mt-4">
            <label class="capitalize block py-2 text-sm text-gray-700">Location</label>
            <input v-model.trim="form.location" type="text" class="p-2 rounded-md border-2 outline-none w-full focus:border-[#042EFF] transition-all duration-300 ease-in-out" placeholder="City, Country" />
            <p v-if="errors.location" class="mt-1 text-xs text-red-600">{{ errors.location }}</p>
          </div>

          <!-- Passwords -->
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="capitalize block py-2 text-sm text-gray-700">Enter password</label>
              <div class="relative">
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="p-2 rounded-md border-2 outline-none w-full pr-10 focus:border-[#042EFF] transition-all duration-300 ease-in-out" />
                <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5 3 1.73 7.11.46 10a1 1 0 000 .95C1.73 13.89 5 18 10 18s8.27-4.11 9.54-7.05a1 1 0 000-.95C18.27 7.11 15 3 10 3zm0 13c-3.86 0-6.86-3.41-7.94-6 .98-2.59 4.08-6 7.94-6s6.96 3.41 7.94 6c-.98 2.59-4.08 6-7.94 6z"/><path d="M10 6a4 4 0 100 8 4 4 0 000-8z"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.53 2.47a.75.75 0 10-1.06 1.06l18 18a.75.75 0 101.06-1.06l-2.27-2.27a13.86 13.86 0 003.02-3.25.98.98 0 000-.9C20.97 9.1 16.02 5 12 5a8.85 8.85 0 00-3.98.97L3.53 2.47zM12 6.5c3.55 0 7.1 3.32 8.36 5.5a12.22 12.22 0 01-2.65 3.03l-2.19-2.19A4 4 0 0010 8.68L8.21 6.9A7.35 7.35 0 0112 6.5zm0 11c-3.55 0-7.1-3.32-8.36-5.5a12.25 12.25 0 012.68-3.07l2.13 2.13A4 4 0 0012 16.5c.67 0 1.31-.16 1.87-.44l2 2c-1.14.3-2.39.44-3.87.44z"/></svg>
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
            </div>
            <div>
              <label class="capitalize block py-2 text-sm text-gray-700">Confirm password</label>
              <div class="relative">
                <input v-model="form.confirmPassword" :type="showConfirm ? 'text' : 'password'" class="p-2 rounded-md border-2 outline-none w-full pr-10 focus:border-[#042EFF] transition-all duration-300 ease-in-out" />
                <button type="button" @click="showConfirm = !showConfirm" class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700">
                  <svg v-if="!showConfirm" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5 3 1.73 7.11.46 10a1 1 0 000 .95C1.73 13.89 5 18 10 18s8.27-4.11 9.54-7.05a1 1 0 000-.95C18.27 7.11 15 3 10 3zm0 13c-3.86 0-6.86-3.41-7.94-6 .98-2.59 4.08-6 7.94-6s6.96 3.41 7.94 6c-.98 2.59-4.08 6-7.94 6z"/><path d="M10 6a4 4 0 100 8 4 4 0 000-8z"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.53 2.47a.75.75 0 10-1.06 1.06l18 18a.75.75 0 101.06-1.06l-2.27-2.27a13.86 13.86 0 003.02-3.25.98.98 0 000-.9C20.97 9.1 16.02 5 12 5a8.85 8.85 0 00-3.98.97L3.53 2.47zM12 6.5c3.55 0 7.1 3.32 8.36 5.5a12.22 12.22 0 01-2.65 3.03l-2.19-2.19A4 4 0 0010 8.68L8.21 6.9A7.35 7.35 0 0112 6.5zm0 11c-3.55 0-7.1-3.32-8.36-5.5a12.25 12.25 0 012.68-3.07l2.13 2.13A4 4 0 0012 16.5c.67 0 1.31-.16 1.87-.44l2 2c-1.14.3-2.39.44-3.87.44z"/></svg>
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-600">{{ errors.confirmPassword }}</p>
            </div>
          </div>

          <!-- Submit -->
          <button type="submit" :disabled="loading" class="cursor-pointer mt-6 text-white bg-[#042EFF] w-full px-4 py-3 rounded-md capitalize hover:bg-[#384857] transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center">
            <svg v-if="loading" class="animate-spin  mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
            <span>{{ loading ? 'Creating account...' : 'Proceed to admin dashboard' }}</span>
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
