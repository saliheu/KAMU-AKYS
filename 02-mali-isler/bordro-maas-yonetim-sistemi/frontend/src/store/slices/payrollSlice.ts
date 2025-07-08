import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { payrollApi } from '../../services/api'
import type { Payroll, PayrollCreate, PayrollUpdate, PayrollSummary, PayrollCalculated, PayrollFilters } from '../../types'

interface PayrollState {
  payrolls: PayrollSummary[]
  currentPayroll: Payroll | null
  calculatedPayroll: PayrollCalculated | null
  filters: PayrollFilters
  loading: boolean
  error: string | null
}

const initialState: PayrollState = {
  payrolls: [],
  currentPayroll: null,
  calculatedPayroll: null,
  filters: {
    include_inactive: false,
    employee_search: '',
    status_filter: null,
    date_start: null,
    date_end: null,
  },
  loading: false,
  error: null,
}

// Async thunks
export const fetchPayrolls = createAsyncThunk(
  'payroll/fetchPayrolls',
  async () => {
    const response = await payrollApi.getAll()
    return response.data
  }
)

export const fetchPayrollsSummary = createAsyncThunk(
  'payroll/fetchPayrollsSummary',
  async (filters?: Partial<PayrollFilters>) => {
    const response = await payrollApi.getSummary(filters)
    return response.data
  }
)

export const fetchPayrollById = createAsyncThunk(
  'payroll/fetchPayrollById',
  async (id: number) => {
    const response = await payrollApi.getById(id)
    return response.data
  }
)

export const createPayroll = createAsyncThunk(
  'payroll/createPayroll',
  async (data: PayrollCreate) => {
    const response = await payrollApi.create(data)
    return response.data
  }
)

export const updatePayrollStatus = createAsyncThunk(
  'payroll/updatePayrollStatus',
  async ({ id, data }: { id: number; data: PayrollUpdate }) => {
    const response = await payrollApi.updateStatus(id, data)
    return response.data
  }
)

export const deletePayroll = createAsyncThunk(
  'payroll/deletePayroll',
  async (id: number) => {
    await payrollApi.delete(id)
    return id
  }
)

export const calculatePayroll = createAsyncThunk(
  'payroll/calculatePayroll',
  async (grossSalary: number) => {
    const response = await payrollApi.calculate(grossSalary)
    return response.data
  }
)

// Slice
const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentPayroll: (state) => {
      state.currentPayroll = null
    },
    clearCalculatedPayroll: (state) => {
      state.calculatedPayroll = null
    },
    setFilters: (state, action: PayloadAction<Partial<PayrollFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payrolls
      .addCase(fetchPayrolls.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayrolls.fulfilled, (state, action: PayloadAction<PayrollSummary[]>) => {
        state.loading = false
        state.payrolls = action.payload
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Bordrolar getirilemedi'
      })
      // Fetch payrolls summary (with filters)
      .addCase(fetchPayrollsSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayrollsSummary.fulfilled, (state, action: PayloadAction<PayrollSummary[]>) => {
        state.loading = false
        state.payrolls = action.payload
      })
      .addCase(fetchPayrollsSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Bordrolar getirilemedi'
      })
      // Fetch payroll by ID
      .addCase(fetchPayrollById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayrollById.fulfilled, (state, action: PayloadAction<Payroll>) => {
        state.loading = false
        state.currentPayroll = action.payload
      })
      .addCase(fetchPayrollById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Bordro getirilemedi'
      })
      // Create payroll
      .addCase(createPayroll.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPayroll.fulfilled, (state, action: PayloadAction<Payroll>) => {
        state.loading = false
        // Add to list as summary
        const summary: PayrollSummary = {
          id: action.payload.id,
          employee_full_name: `${action.payload.employee.first_name} ${action.payload.employee.last_name}`,
          employee_is_active: action.payload.employee?.is_active ?? true,
          pay_period_start: action.payload.pay_period_start,
          pay_period_end: action.payload.pay_period_end,
          gross_salary: action.payload.gross_salary,
          net_salary: action.payload.net_salary,
          status: action.payload.status,
          created_at: action.payload.created_at,
        }
        state.payrolls.unshift(summary)
      })
      .addCase(createPayroll.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Bordro oluşturulamadı'
      })
      // Update payroll status
      .addCase(updatePayrollStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePayrollStatus.fulfilled, (state, action: PayloadAction<Payroll>) => {
        state.loading = false
        // Update in list
        const index = state.payrolls.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.payrolls[index].status = action.payload.status
        }
        // Update current payroll if it's the same
        if (state.currentPayroll?.id === action.payload.id) {
          state.currentPayroll = action.payload
        }
      })
      .addCase(updatePayrollStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Bordro durumu güncellenemedi'
      })
      // Delete payroll
      .addCase(deletePayroll.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePayroll.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false
        // Remove from list
        state.payrolls = state.payrolls.filter(p => p.id !== action.payload)
        // Clear current payroll if it's the deleted one
        if (state.currentPayroll?.id === action.payload) {
          state.currentPayroll = null
        }
      })
      .addCase(deletePayroll.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Bordro silinemedi'
      })
      // Calculate payroll
      .addCase(calculatePayroll.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(calculatePayroll.fulfilled, (state, action: PayloadAction<PayrollCalculated>) => {
        state.loading = false
        state.calculatedPayroll = action.payload
      })
      .addCase(calculatePayroll.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Bordro hesaplanamadı'
      })
  },
})

export const { 
  clearError, 
  clearCurrentPayroll, 
  clearCalculatedPayroll, 
  setFilters, 
  resetFilters 
} = payrollSlice.actions
export default payrollSlice.reducer 