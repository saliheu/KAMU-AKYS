import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import appointmentService from '../../services/appointmentService';

// Initial state
const initialState = {
  // Appointments
  userAppointments: [],
  upcomingAppointments: [],
  allAppointments: [],
  currentAppointment: null,
  
  // Courts and slots
  courts: [],
  availableSlots: [],
  slots: [],
  
  // Loading states
  loading: false,
  createLoading: false,
  updateLoading: false,
  cancelLoading: false,
  
  // Error states
  error: null,
  createError: null,
  updateError: null,
  cancelError: null,
  
  // Pagination and filters
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  filters: {
    status: 'all',
    dateRange: 'all',
    courtType: 'all',
  },
  
  // Search
  searchTerm: '',
  
  // UI states
  selectedDate: null,
  selectedCourt: null,
  selectedSlot: null,
};

// Async thunks
export const fetchCourts = createAsyncThunk(
  'appointments/fetchCourts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getCourts(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Mahkemeler yüklenirken bir hata oluştu'
      );
    }
  }
);

export const fetchAvailableSlots = createAsyncThunk(
  'appointments/fetchAvailableSlots',
  async (params, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAvailableSlots(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Uygun saatler yüklenirken bir hata oluştu'
      );
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentService.createAppointment(appointmentData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Randevu oluşturulurken bir hata oluştu'
      );
    }
  }
);

export const fetchUserAppointments = createAsyncThunk(
  'appointments/fetchUserAppointments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getUserAppointments(params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Randevular yüklenirken bir hata oluştu'
      );
    }
  }
);

export const fetchUpcomingAppointments = createAsyncThunk(
  'appointments/fetchUpcomingAppointments',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getUpcomingAppointments(userId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Yaklaşan randevular yüklenirken bir hata oluştu'
      );
    }
  }
);

export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointmentById(appointmentId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Randevu detayları yüklenirken bir hata oluştu'
      );
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ appointmentId, updateData }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.updateAppointment(appointmentId, updateData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Randevu güncellenirken bir hata oluştu'
      );
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await appointmentService.cancelAppointment(appointmentId);
      return { appointmentId, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Randevu iptal edilirken bir hata oluştu'
      );
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  'appointments/rescheduleAppointment',
  async ({ appointmentId, newDate, newSlotId }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.rescheduleAppointment(
        appointmentId, 
        { newDate, newSlotId }
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Randevu yeniden planlanırken bir hata oluştu'
      );
    }
  }
);

export const fetchAppointmentStatistics = createAsyncThunk(
  'appointments/fetchAppointmentStatistics',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointmentStatistics(userId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'İstatistikler yüklenirken bir hata oluştu'
      );
    }
  }
);

// Appointment slice
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    // Error management
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.cancelError = null;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearCancelError: (state) => {
      state.cancelError = null;
    },
    
    // UI state management
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedCourt: (state, action) => {
      state.selectedCourt = action.payload;
    },
    setSelectedSlot: (state, action) => {
      state.selectedSlot = action.payload;
    },
    clearSelection: (state) => {
      state.selectedDate = null;
      state.selectedCourt = null;
      state.selectedSlot = null;
    },
    
    // Filters and search
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to first page when search changes
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.searchTerm = '';
      state.currentPage = 1;
    },
    
    // Data management
    updateAppointmentInList: (state, action) => {
      const { appointmentId, updateData } = action.payload;
      
      // Update in userAppointments
      const userIndex = state.userAppointments.findIndex(apt => apt.id === appointmentId);
      if (userIndex !== -1) {
        state.userAppointments[userIndex] = { 
          ...state.userAppointments[userIndex], 
          ...updateData 
        };
      }
      
      // Update in upcomingAppointments
      const upcomingIndex = state.upcomingAppointments.findIndex(apt => apt.id === appointmentId);
      if (upcomingIndex !== -1) {
        state.upcomingAppointments[upcomingIndex] = { 
          ...state.upcomingAppointments[upcomingIndex], 
          ...updateData 
        };
      }
      
      // Update currentAppointment if it matches
      if (state.currentAppointment?.id === appointmentId) {
        state.currentAppointment = { ...state.currentAppointment, ...updateData };
      }
    },
    
    removeAppointmentFromList: (state, action) => {
      const appointmentId = action.payload;
      
      state.userAppointments = state.userAppointments.filter(apt => apt.id !== appointmentId);
      state.upcomingAppointments = state.upcomingAppointments.filter(apt => apt.id !== appointmentId);
      
      if (state.currentAppointment?.id === appointmentId) {
        state.currentAppointment = null;
      }
    },
    
    // Reset state
    resetAppointmentState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courts
      .addCase(fetchCourts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourts.fulfilled, (state, action) => {
        state.loading = false;
        state.courts = action.payload.courts || action.payload;
        state.error = null;
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.courts = [];
      })
      
      // Fetch Available Slots
      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload.slots || action.payload;
        state.availableSlots = action.payload.slots || action.payload;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.slots = [];
        state.availableSlots = [];
      })
      
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createError = null;
        
        // Add new appointment to lists
        const newAppointment = action.payload.appointment || action.payload;
        state.userAppointments.unshift(newAppointment);
        
        // If it's upcoming, add to upcoming list
        const appointmentDate = new Date(newAppointment.date);
        const now = new Date();
        if (appointmentDate > now) {
          state.upcomingAppointments.unshift(newAppointment);
          // Sort upcoming appointments by date
          state.upcomingAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        
        // Clear selection
        state.selectedDate = null;
        state.selectedCourt = null;
        state.selectedSlot = null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Fetch User Appointments
      .addCase(fetchUserAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.userAppointments = action.payload.appointments || action.payload;
        state.totalCount = action.payload.totalCount || action.payload.length || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
        state.error = null;
      })
      .addCase(fetchUserAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userAppointments = [];
      })
      
      // Fetch Upcoming Appointments
      .addCase(fetchUpcomingAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingAppointments = action.payload.appointments || action.payload;
        state.error = null;
      })
      .addCase(fetchUpcomingAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.upcomingAppointments = [];
      })
      
      // Fetch Appointment By ID
      .addCase(fetchAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload.appointment || action.payload;
        state.error = null;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentAppointment = null;
      })
      
      // Update Appointment
      .addCase(updateAppointment.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        
        const updatedAppointment = action.payload.appointment || action.payload;
        
        // Update in lists
        appointmentSlice.caseReducers.updateAppointmentInList(state, {
          payload: { 
            appointmentId: updatedAppointment.id, 
            updateData: updatedAppointment 
          }
        });
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.cancelLoading = true;
        state.cancelError = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = null;
        
        // Update appointment status to cancelled
        appointmentSlice.caseReducers.updateAppointmentInList(state, {
          payload: { 
            appointmentId: action.payload.appointmentId, 
            updateData: { status: 'cancelled', cancelledAt: new Date().toISOString() }
          }
        });
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.cancelLoading = false;
        state.cancelError = action.payload;
      })
      
      // Reschedule Appointment
      .addCase(rescheduleAppointment.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateError = null;
        
        const rescheduledAppointment = action.payload.appointment || action.payload;
        
        appointmentSlice.caseReducers.updateAppointmentInList(state, {
          payload: { 
            appointmentId: rescheduledAppointment.id, 
            updateData: rescheduledAppointment 
          }
        });
      })
      .addCase(rescheduleAppointment.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  },
});

// Export actions
export const {
  clearError,
  clearCreateError,
  clearUpdateError,
  clearCancelError,
  setSelectedDate,
  setSelectedCourt,
  setSelectedSlot,
  clearSelection,
  setFilters,
  setSearchTerm,
  setCurrentPage,
  resetFilters,
  updateAppointmentInList,
  removeAppointmentFromList,
  resetAppointmentState,
} = appointmentSlice.actions;

// Selectors
export const selectAppointments = (state) => state.appointments;
export const selectUserAppointments = (state) => state.appointments.userAppointments;
export const selectUpcomingAppointments = (state) => state.appointments.upcomingAppointments;
export const selectCurrentAppointment = (state) => state.appointments.currentAppointment;
export const selectCourts = (state) => state.appointments.courts;
export const selectAvailableSlots = (state) => state.appointments.availableSlots;
export const selectAppointmentLoading = (state) => state.appointments.loading;
export const selectCreateLoading = (state) => state.appointments.createLoading;
export const selectAppointmentError = (state) => state.appointments.error;

// Export reducer
export default appointmentSlice.reducer;