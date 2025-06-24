import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/profile')
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, refreshToken, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(user)
      
      enqueueSnackbar('Giriş başarılı', { variant: 'success' })
      navigate('/')
    } catch (error) {
      enqueueSnackbar(error.response?.data?.error || 'Giriş başarısız', { variant: 'error' })
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      navigate('/login')
      enqueueSnackbar('Çıkış yapıldı', { variant: 'info' })
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}