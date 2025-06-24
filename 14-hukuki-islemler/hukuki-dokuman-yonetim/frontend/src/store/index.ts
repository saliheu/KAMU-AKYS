import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import documentReducer from './slices/documentSlice';
import workflowReducer from './slices/workflowSlice';
import templateReducer from './slices/templateSlice';
import shareReducer from './slices/shareSlice';
import adminReducer from './slices/adminSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
    workflows: workflowReducer,
    templates: templateReducer,
    shares: shareReducer,
    admin: adminReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;