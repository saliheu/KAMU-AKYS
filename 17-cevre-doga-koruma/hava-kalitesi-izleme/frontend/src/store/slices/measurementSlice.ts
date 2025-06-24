import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Measurement } from '../../types';
import measurementService from '../../services/measurementService';

interface MeasurementState {
  measurements: Measurement[];
  latestMeasurements: Record<string, Measurement>; // Key: stationId
  chartData: any;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: MeasurementState = {
  measurements: [],
  latestMeasurements: {},
  chartData: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchMeasurements = createAsyncThunk(
  'measurements/fetchMeasurements',
  async (params: {
    stationId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) => {
    const response = await measurementService.getMeasurements(params);
    return response;
  }
);

export const fetchLatestMeasurements = createAsyncThunk(
  'measurements/fetchLatest',
  async () => {
    const response = await measurementService.getLatestMeasurements();
    return response;
  }
);

export const fetchChartData = createAsyncThunk(
  'measurements/fetchChartData',
  async (params: {
    type: string;
    period?: string;
    stationId?: string;
  }) => {
    const response = await measurementService.getChartData(params);
    return response;
  }
);

const measurementSlice = createSlice({
  name: 'measurements',
  initialState,
  reducers: {
    updateFromWebSocket: (state, action: PayloadAction<{
      stationId: string;
      measurement: Measurement;
    }>) => {
      const { stationId, measurement } = action.payload;
      
      // Update latest measurements
      state.latestMeasurements[stationId] = measurement;
      
      // Add to measurements array (keep last 100)
      state.measurements = [measurement, ...state.measurements].slice(0, 100);
      
      state.lastUpdated = new Date();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeasurements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeasurements.fulfilled, (state, action) => {
        state.loading = false;
        state.measurements = action.payload.measurements;
        state.lastUpdated = new Date();
      })
      .addCase(fetchMeasurements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ölçümler yüklenemedi';
      })
      .addCase(fetchLatestMeasurements.fulfilled, (state, action) => {
        const latestMap: Record<string, Measurement> = {};
        action.payload.forEach((item: any) => {
          if (item.measurement) {
            latestMap[item.station.id] = item.measurement;
          }
        });
        state.latestMeasurements = latestMap;
        state.lastUpdated = new Date();
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.chartData = action.payload;
      });
  },
});

export const { updateFromWebSocket, clearError } = measurementSlice.actions;
export default measurementSlice.reducer;