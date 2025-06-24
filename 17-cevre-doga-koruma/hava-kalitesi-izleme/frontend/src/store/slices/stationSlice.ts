import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Station } from '../../types';
import stationService from '../../services/stationService';

interface StationState {
  stations: Station[];
  selectedStation: Station | null;
  loading: boolean;
  error: string | null;
}

const initialState: StationState = {
  stations: [],
  selectedStation: null,
  loading: false,
  error: null,
};

export const fetchStations = createAsyncThunk(
  'stations/fetchStations',
  async (filters?: { city?: string; region?: string; type?: string }) => {
    const response = await stationService.getStations(filters);
    return response;
  }
);

export const fetchStationById = createAsyncThunk(
  'stations/fetchStationById',
  async (id: string) => {
    const response = await stationService.getStationById(id);
    return response;
  }
);

export const updateStationStatus = createAsyncThunk(
  'stations/updateStatus',
  async ({ id, status }: { id: string; status: string }) => {
    // In real app, this would call API
    return { id, status };
  }
);

const stationSlice = createSlice({
  name: 'stations',
  initialState,
  reducers: {
    setSelectedStation: (state, action: PayloadAction<Station | null>) => {
      state.selectedStation = action.payload;
    },
    updateStationFromWebSocket: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const station = state.stations.find(s => s.id === action.payload.id);
      if (station) {
        station.status = action.payload.status as Station['status'];
      }
      if (state.selectedStation?.id === action.payload.id) {
        state.selectedStation.status = action.payload.status as Station['status'];
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStations.fulfilled, (state, action: PayloadAction<Station[]>) => {
        state.loading = false;
        state.stations = action.payload;
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'İstasyonlar yüklenemedi';
      })
      .addCase(fetchStationById.fulfilled, (state, action: PayloadAction<Station>) => {
        state.selectedStation = action.payload;
      });
  },
});

export const { setSelectedStation, updateStationFromWebSocket, clearError } = stationSlice.actions;
export default stationSlice.reducer;