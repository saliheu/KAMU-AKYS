import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import stationReducer from './slices/stationSlice';
import measurementReducer from './slices/measurementSlice';
import alertReducer from './slices/alertSlice';
import dashboardReducer from './slices/dashboardSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stations: stationReducer,
    measurements: measurementReducer,
    alerts: alertReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['measurements/updateFromWebSocket'],
        ignoredPaths: ['measurements.lastUpdated'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;