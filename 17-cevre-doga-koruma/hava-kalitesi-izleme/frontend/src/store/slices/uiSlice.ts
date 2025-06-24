import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  selectedView: 'map' | 'list' | 'grid';
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  refreshInterval: number; // seconds
  autoRefresh: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  selectedView: 'map',
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  refreshInterval: 30,
  autoRefresh: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setSelectedView: (state, action: PayloadAction<'map' | 'list' | 'grid'>) => {
      state.selectedView = action.payload;
    },
    showSnackbar: (
      state,
      action: PayloadAction<{
        message: string;
        severity?: 'success' | 'error' | 'warning' | 'info';
      }>
    ) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefresh = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setSelectedView,
  showSnackbar,
  hideSnackbar,
  setRefreshInterval,
  setAutoRefresh,
} = uiSlice.actions;

export default uiSlice.reducer;