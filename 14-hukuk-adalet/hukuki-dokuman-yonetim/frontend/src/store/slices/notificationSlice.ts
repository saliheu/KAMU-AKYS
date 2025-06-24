import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

interface NotificationState {
  notifications: Notification[];
  systemNotifications: any[];
}

const initialState: NotificationState = {
  notifications: [],
  systemNotifications: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
    }>) => {
      state.notifications.push({
        id: Date.now().toString(),
        type: action.payload.type,
        message: action.payload.message,
        timestamp: new Date(),
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    addSystemNotification: (state, action: PayloadAction<any>) => {
      state.systemNotifications.unshift(action.payload);
    },
    markSystemNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.systemNotifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearSystemNotifications: (state) => {
      state.systemNotifications = [];
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  addSystemNotification,
  markSystemNotificationRead,
  clearSystemNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;