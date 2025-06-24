import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardData, MapData } from '../../types';
import dashboardService from '../../services/dashboardService';

interface DashboardState {
  data: DashboardData | null;
  mapData: MapData[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

const initialState: DashboardState = {
  data: null,
  mapData: [],
  loading: false,
  error: null,
  lastRefresh: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    const response = await dashboardService.getDashboardData();
    return response;
  }
);

export const fetchMapData = createAsyncThunk(
  'dashboard/fetchMapData',
  async () => {
    const response = await dashboardService.getMapData();
    return response;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateDashboardData: (state, action: PayloadAction<Partial<DashboardData>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    setLastRefresh: (state) => {
      state.lastRefresh = new Date();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<DashboardData>) => {
        state.loading = false;
        state.data = action.payload;
        state.lastRefresh = new Date();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Dashboard verileri yüklenemedi';
      })
      .addCase(fetchMapData.fulfilled, (state, action: PayloadAction<MapData[]>) => {
        state.mapData = action.payload;
      });
  },
});

export const { updateDashboardData, setLastRefresh, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;