import axiosClient from '@/axiosClient'
import { defineStore } from 'pinia'
import {ref, computed}  from 'vue'

export const useUserStore = defineStore('user', () => {

  const user = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  const fetchUser = async () => {
    const res = await axiosClient.get('/api/admin/dashboard')
    user.value = res.data.admin
  }
  

  const clearUser = () => {
    user.value = null
  }

  return { user, isAuthenticated, fetchUser, clearUser }
})
