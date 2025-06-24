import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Hospital } from '../../types';
import hospitalService from '../../services/hospitalService';

interface HospitalState {
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  loading: boolean;
  error: string | null;
}

const initialState: HospitalState = {
  hospitals: [],
  selectedHospital: null,
  loading: false,
  error: null,
};

export const fetchHospitals = createAsyncThunk(
  'hospitals/fetchHospitals',
  async (filters?: { city?: string; region?: string; type?: string }) => {
    const response = await hospitalService.getHospitals(filters);
    return response;
  }
);

export const fetchHospitalById = createAsyncThunk(
  'hospitals/fetchHospitalById',
  async (id: string) => {
    const response = await hospitalService.getHospitalById(id);
    return response;
  }
);

export const fetchHospitalStats = createAsyncThunk(
  'hospitals/fetchHospitalStats',
  async (id: string) => {
    const response = await hospitalService.getHospitalStats(id);
    return response;
  }
);

const hospitalSlice = createSlice({
  name: 'hospitals',
  initialState,
  reducers: {
    setSelectedHospital: (state, action: PayloadAction<Hospital | null>) => {
      state.selectedHospital = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHospitals.fulfilled, (state, action: PayloadAction<Hospital[]>) => {
        state.loading = false;
        state.hospitals = action.payload;
      })
      .addCase(fetchHospitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Hastaneler yüklenemedi';
      })
      .addCase(fetchHospitalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHospitalById.fulfilled, (state, action: PayloadAction<Hospital>) => {
        state.loading = false;
        state.selectedHospital = action.payload;
      })
      .addCase(fetchHospitalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Hastane bilgileri yüklenemedi';
      });
  },
});

export const { setSelectedHospital, clearError } = hospitalSlice.actions;
export default hospitalSlice.reducer;