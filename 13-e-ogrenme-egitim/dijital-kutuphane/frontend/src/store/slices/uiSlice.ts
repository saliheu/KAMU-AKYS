import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  searchModalOpen: boolean;
  bookViewerOpen: boolean;
  currentBookFile: string | null;
  bookViewerType: 'pdf' | 'epub' | null;
  loadingStates: {
    [key: string]: boolean;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  darkMode: localStorage.getItem('darkMode') === 'true',
  searchModalOpen: false,
  bookViewerOpen: false,
  currentBookFile: null,
  bookViewerType: null,
  loadingStates: {},
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
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload.toString());
    },
    openSearchModal: (state) => {
      state.searchModalOpen = true;
    },
    closeSearchModal: (state) => {
      state.searchModalOpen = false;
    },
    openBookViewer: (state, action: PayloadAction<{ file: string; type: 'pdf' | 'epub' }>) => {
      state.bookViewerOpen = true;
      state.currentBookFile = action.payload.file;
      state.bookViewerType = action.payload.type;
    },
    closeBookViewer: (state) => {
      state.bookViewerOpen = false;
      state.currentBookFile = null;
      state.bookViewerType = null;
    },
    setLoading: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state.loadingStates[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  openSearchModal,
  closeSearchModal,
  openBookViewer,
  closeBookViewer,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;