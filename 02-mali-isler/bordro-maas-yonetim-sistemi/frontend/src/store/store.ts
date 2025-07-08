import { configureStore } from '@reduxjs/toolkit'
import employeeSlice from './slices/employeeSlice'
import payrollSlice from './slices/payrollSlice'
import dashboardSlice from './slices/dashboardSlice'
import authSlice from './slices/authSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    employee: employeeSlice,
    payroll: payrollSlice,
    dashboard: dashboardSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store 