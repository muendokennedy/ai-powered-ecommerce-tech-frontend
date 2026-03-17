import { defineStore } from 'pinia'
import {ref, computed}  from 'vue'

const USER_STORE_PERSIST_KEY = 'motech-user-store'
const ADMIN_USER_STORE_PERSIST_KEY = 'motech-admin-user-store'

export const useUserStore = defineStore('user', () => {

  const user = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  const setUser = (userData) => {
    user.value = userData
  }

  const fetchUser = async () => user.value
  

  const clearUser = () => {
    user.value = null
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_STORE_PERSIST_KEY)
    }
  }

  return { user, isAuthenticated, setUser, fetchUser, clearUser }
}, {
  persist: {
    key: USER_STORE_PERSIST_KEY,
    paths: ['user'],
  },
})

export const useAdminUserStore = defineStore('adminUser', () => {
  const adminUser = ref(null)

  const isAdminAuthenticated = computed(() => !!adminUser.value)

  const setAdminUser = (userData) => {
    adminUser.value = userData
  }

  const fetchAdminUser = async () => adminUser.value

  const clearAdminUser = () => {
    adminUser.value = null
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_USER_STORE_PERSIST_KEY)
    }
  }

  // Compatibility alias while files migrate to the explicit admin naming
  const fetchUser = fetchAdminUser

  return {
    adminUser,
    isAdminAuthenticated,
    setAdminUser,
    fetchAdminUser,
    clearAdminUser,
    fetchUser,
  }
}, {
  persist: {
    key: ADMIN_USER_STORE_PERSIST_KEY,
    paths: ['adminUser'],
  },
})
