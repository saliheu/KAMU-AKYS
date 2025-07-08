import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { employeeApi } from '../../services/api'
import type { Employee, EmployeeCreate, EmployeeUpdate, DirectEmployeeCreate, DirectEmployeeResponse } from '../../types'

interface EmployeeState {
  employees: Employee[]
  currentEmployee: Employee | null
  loading: boolean
  error: string | null
}

const initialState: EmployeeState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async () => {
    const response = await employeeApi.getAll()
    return response.data
  }
)

export const fetchEmployeeById = createAsyncThunk(
  'employee/fetchEmployeeById',
  async (id: number) => {
    const response = await employeeApi.getById(id)
    return response.data
  }
)

export const createEmployee = createAsyncThunk(
  'employee/createEmployee',
  async (data: EmployeeCreate) => {
    const response = await employeeApi.create(data)
    return response.data
  }
)

export const createEmployeeWithAccount = createAsyncThunk(
  'employee/createEmployeeWithAccount',
  async (data: DirectEmployeeCreate) => {
    const response = await employeeApi.createWithAccount(data)
    return response.data
  }
)

export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async ({ id, data }: { id: number; data: EmployeeUpdate }) => {
    const response = await employeeApi.update(id, data)
    return response.data
  }
)

export const deleteEmployee = createAsyncThunk(
  'employee/deleteEmployee',
  async (id: number) => {
    const response = await employeeApi.delete(id)
    return { id, ...response.data }
  }
)

// Slice
const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.loading = false
        state.employees = action.payload
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Çalışanlar getirilemedi'
      })
      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false
        state.currentEmployee = action.payload
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Çalışan getirilemedi'
      })
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false
        state.employees.push(action.payload)
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Çalışan oluşturulamadı'
      })
      // Create employee with account (orchestration)
      .addCase(createEmployeeWithAccount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createEmployeeWithAccount.fulfilled, (state, action: PayloadAction<DirectEmployeeResponse>) => {
        state.loading = false
        state.employees.push(action.payload.employee)
      })
      .addCase(createEmployeeWithAccount.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Personel ve hesap oluşturulamadı'
      })
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.loading = false
        const index = state.employees.findIndex(emp => emp.id === action.payload.id)
        if (index !== -1) {
          state.employees[index] = action.payload
        }
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = action.payload
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Çalışan güncellenemedi'
      })
      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false
        state.employees = state.employees.filter(emp => emp.id !== action.payload.id)
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = null
        }
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Çalışan pasifleştirilemedi'
      })
  },
})

export const { clearError, clearCurrentEmployee } = employeeSlice.actions
export default employeeSlice.reducer 