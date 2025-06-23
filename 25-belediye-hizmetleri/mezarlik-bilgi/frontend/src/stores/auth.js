import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(credentials) {
      try {
        const formData = new FormData()
        formData.append('username', credentials.username)
        formData.append('password', credentials.password)
        
        const response = await axios.post('/api/auth/login', formData)
        const { access_token } = response.data
        
        this.token = access_token
        localStorage.setItem('token', access_token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        
        return { success: true }
      } catch (error) {
        return { success: false, error: error.response?.data?.detail || 'Giriş başarısız' }
      }
    },

    async register(userData) {
      try {
        await axios.post('/api/auth/register', userData)
        return { success: true }
      } catch (error) {
        return { success: false, error: error.response?.data?.detail || 'Kayıt başarısız' }
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
  }
})