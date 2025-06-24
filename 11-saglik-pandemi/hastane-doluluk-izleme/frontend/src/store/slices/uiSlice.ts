import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  loading: {
    [key: string]: boolean;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  loading: {},
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
    setLoading: (
      state,
      action: PayloadAction<{ key: string; value: boolean }>
    ) => {
      state.loading[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  showSnackbar,
  hideSnackbar,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;