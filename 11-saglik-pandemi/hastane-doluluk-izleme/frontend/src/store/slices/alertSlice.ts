import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from '../../types';
import alertService from '../../services/alertService';

interface AlertState {
  alerts: Alert[];
  unacknowledgedCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: AlertState = {
  alerts: [],
  unacknowledgedCount: 0,
  loading: false,
  error: null,
};

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (filters?: {
    status?: string;
    type?: string;
    hospitalId?: string;
    limit?: number;
  }) => {
    const response = await alertService.getAlerts(filters);
    return response;
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'alerts/acknowledge',
  async (id: string) => {
    const response = await alertService.acknowledgeAlert(id);
    return response;
  }
);

export const resolveAlert = createAsyncThunk(
  'alerts/resolve',
  async (id: string) => {
    const response = await alertService.resolveAlert(id);
    return response;
  }
);

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addNewAlert: (state, action: PayloadAction<Alert>) => {
      state.alerts.unshift(action.payload);
      if (action.payload.status === 'active') {
        state.unacknowledgedCount++;
      }
    },
    updateAlertFromWebSocket: (state, action: PayloadAction<Alert>) => {
      const index = state.alerts.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        const oldStatus = state.alerts[index].status;
        state.alerts[index] = action.payload;
        
        if (oldStatus === 'active' && action.payload.status !== 'active') {
          state.unacknowledgedCount--;
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action: PayloadAction<Alert[]>) => {
        state.loading = false;
        state.alerts = action.payload;
        state.unacknowledgedCount = action.payload.filter(
          (a) => a.status === 'active'
        ).length;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Uyarılar yüklenemedi';
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action: PayloadAction<Alert>) => {
        const index = state.alerts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
          state.unacknowledgedCount--;
        }
      })
      .addCase(resolveAlert.fulfilled, (state, action: PayloadAction<Alert>) => {
        const index = state.alerts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.alerts[index] = action.payload;
          if (state.alerts[index].status === 'active') {
            state.unacknowledgedCount--;
          }
        }
      });
  },
});

export const { addNewAlert, updateAlertFromWebSocket, clearError } = alertSlice.actions;
export default alertSlice.reducer;