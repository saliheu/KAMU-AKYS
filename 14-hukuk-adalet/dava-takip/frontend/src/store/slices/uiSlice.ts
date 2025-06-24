import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
}

const initialState: UIState = {
  sidebarOpen: true,
  searchOpen: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  language: (localStorage.getItem('language') as 'tr' | 'en') || 'tr',
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
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action: PayloadAction<'tr' | 'en'>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSearch,
  setSearchOpen,
  setTheme,
  setLanguage,
} = uiSlice.actions;

export default uiSlice.reducer;