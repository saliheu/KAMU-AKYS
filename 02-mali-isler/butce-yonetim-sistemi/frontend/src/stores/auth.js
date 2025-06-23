import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast()
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || null)
  const userPermissions = computed(() => user.value?.permissions || [])

  const hasPermission = (permission) => {
    return userPermissions.value.includes(permission)
  }

  const hasAnyPermission = (permissions) => {
    return permissions.some(p => userPermissions.value.includes(p))
  }

  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await authService.login(credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      toast.success('Giriş başarılı')
      return response
    } catch (error) {
      toast.error(error.response?.data?.error || 'Giriş başarısız')
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    toast.info('Çıkış yapıldı')
  }

  const checkAuth = async () => {
    if (!token.value) return

    try {
      const response = await authService.getProfile()
      user.value = response.user
    } catch (error) {
      logout()
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await authService.updateProfile(data)
      user.value = { ...user.value, ...response.user }
      toast.success('Profil güncellendi')
      return response
    } catch (error) {
      toast.error(error.response?.data?.error || 'Güncelleme başarısız')
      throw error
    }
  }

  const changePassword = async (data) => {
    try {
      await authService.changePassword(data)
      toast.success('Şifre değiştirildi')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Şifre değiştirilemedi')
      throw error
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    userRole,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    login,
    logout,
    checkAuth,
    updateProfile,
    changePassword
  }
})