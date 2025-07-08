import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { payrollApi } from '../../services/api'
import type { DashboardStats } from '../../types'

interface DashboardState {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async () => {
    const response = await payrollApi.getDashboardStats()
    return response.data
  }
)

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Dashboard verileri getirilemedi'
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer 