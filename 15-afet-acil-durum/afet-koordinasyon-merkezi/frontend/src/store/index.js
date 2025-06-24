import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import disasterReducer from './slices/disasterSlice';
import socketReducer from './slices/socketSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    disaster: disasterReducer,
    socket: socketReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['socket/connect', 'socket/disconnect'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.socket'],
        // Ignore these paths in the state
        ignoredPaths: ['socket.instance'],
      },
    }),
});