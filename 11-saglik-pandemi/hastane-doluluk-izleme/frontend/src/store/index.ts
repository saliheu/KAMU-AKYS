import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hospitalReducer from './slices/hospitalSlice';
import occupancyReducer from './slices/occupancySlice';
import alertReducer from './slices/alertSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hospitals: hospitalReducer,
    occupancy: occupancyReducer,
    alerts: alertReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;