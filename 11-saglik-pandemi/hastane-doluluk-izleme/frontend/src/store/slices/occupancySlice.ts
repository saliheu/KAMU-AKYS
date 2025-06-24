import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OccupancyData } from '../../types';
import occupancyService from '../../services/occupancyService';

interface OccupancyState {
  currentOccupancy: OccupancyData[];
  history: any[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: OccupancyState = {
  currentOccupancy: [],
  history: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchCurrentOccupancy = createAsyncThunk(
  'occupancy/fetchCurrent',
  async (filters?: { region?: string; city?: string; critical?: boolean }) => {
    const response = await occupancyService.getCurrentOccupancy(filters);
    return response;
  }
);

export const fetchOccupancyHistory = createAsyncThunk(
  'occupancy/fetchHistory',
  async (params: {
    hospitalId?: string;
    departmentId?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    const response = await occupancyService.getOccupancyHistory(params);
    return response;
  }
);

export const updateOccupancy = createAsyncThunk(
  'occupancy/update',
  async (data: {
    hospitalId: string;
    departmentId: string;
    occupiedBeds: number;
    totalBeds?: number;
    reservedBeds?: number;
    ventilatorOccupied?: number;
    ventilatorTotal?: number;
  }) => {
    const response = await occupancyService.updateOccupancy(data);
    return response;
  }
);

const occupancySlice = createSlice({
  name: 'occupancy',
  initialState,
  reducers: {
    updateOccupancyFromWebSocket: (state, action: PayloadAction<OccupancyData>) => {
      const index = state.currentOccupancy.findIndex(
        (item) =>
          item.hospital.id === action.payload.hospital.id &&
          item.department.id === action.payload.department.id
      );

      if (index !== -1) {
        state.currentOccupancy[index] = action.payload;
      } else {
        state.currentOccupancy.push(action.payload);
      }
      state.lastUpdated = new Date();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentOccupancy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentOccupancy.fulfilled, (state, action: PayloadAction<OccupancyData[]>) => {
        state.loading = false;
        state.currentOccupancy = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(fetchCurrentOccupancy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Doluluk verileri yüklenemedi';
      })
      .addCase(fetchOccupancyHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOccupancyHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchOccupancyHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Geçmiş veriler yüklenemedi';
      })
      .addCase(updateOccupancy.fulfilled, (state) => {
        state.lastUpdated = new Date();
      });
  },
});

export const { updateOccupancyFromWebSocket, clearError } = occupancySlice.actions;
export default occupancySlice.reducer;