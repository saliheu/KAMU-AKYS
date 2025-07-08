import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import { message } from 'antd'

// JWT Token içeriği interface'i
interface TokenData {
  sub: string // user ID
  email: string
  role: 'admin' | 'employee'
  exp: number // expiration time
}

// Auth state interface'i
interface AuthState {
  token: string | null
  isAuthenticated: boolean
  user: {
    id: string
    email: string
    role: 'admin' | 'employee'
  } | null
  loading: boolean
  error: string | null
}

// Login request interface'i
interface LoginRequest {
  email: string
  password: string
}

// Login response interface'i
interface LoginResponse {
  access_token: string
  token_type: string
}

// Initial state
const initialState: AuthState = {
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
}

// Token'dan user bilgilerini çıkaran helper function
const getUserFromToken = (token: string) => {
  try {
    const decoded: TokenData = jwtDecode(token)
    const currentTime = Date.now() / 1000
    
    // Token süresi dolmuş mu kontrolü
    if (decoded.exp < currentTime) {
      localStorage.removeItem('auth_token')
      return null
    }

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    console.error('Token decode error:', error)
    localStorage.removeItem('auth_token')
    return null
  }
}

// Async thunk for login
export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8001/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Giriş başarısız')
      }

      const data: LoginResponse = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Giriş sırasında hata oluştu'
      )
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Manuel credential set etme (page reload sonrası)
    setCredentials: (state, action: PayloadAction<string>) => {
      const token = action.payload
      const user = getUserFromToken(token)
      
      if (user) {
        state.token = token
        state.user = user
        state.isAuthenticated = true
        localStorage.setItem('auth_token', token)
      }
    },
    
    // Logout
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('auth_token')
      message.success('Başarıyla çıkış yapıldı')
    },

    // Error temizleme
    clearError: (state) => {
      state.error = null
    },

    // Token'ı localStorage'dan yükle (app başlatılırken)
    loadTokenFromStorage: (state) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const user = getUserFromToken(token)
        if (user) {
          state.token = token
          state.user = user
          state.isAuthenticated = true
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login pending
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Login fulfilled
      .addCase(login.fulfilled, (state, action) => {
        const { access_token } = action.payload
        const user = getUserFromToken(access_token)
        
        if (user) {
          state.token = access_token
          state.user = user
          state.isAuthenticated = true
          state.loading = false
          state.error = null
          localStorage.setItem('auth_token', access_token)
          message.success('Başarıyla giriş yapıldı')
        } else {
          state.loading = false
          state.error = 'Geçersiz token'
        }
      })
      // Login rejected
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Giriş başarısız'
        state.token = null
        state.user = null
        state.isAuthenticated = false
        localStorage.removeItem('auth_token')
        message.error(action.payload || 'Giriş başarısız')
      })
  }
})

export const { setCredentials, logout, clearError, loadTokenFromStorage } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === 'admin'
export const selectIsEmployee = (state: { auth: AuthState }) => state.auth.user?.role === 'employee' 