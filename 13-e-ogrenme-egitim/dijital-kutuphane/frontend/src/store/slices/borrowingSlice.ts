import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Borrowing, BorrowingFilters, Reservation } from '@/types';
import borrowingService from '@/services/borrowingService';
import toast from 'react-hot-toast';

interface BorrowingState {
  borrowings: Borrowing[];
  reservations: Reservation[];
  currentBorrowing: Borrowing | null;
  loading: boolean;
  error: string | null;
  stats: {
    active: number;
    overdue: number;
    returned: number;
    totalFines: number;
  };
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: BorrowingState = {
  borrowings: [],
  reservations: [],
  currentBorrowing: null,
  loading: false,
  error: null,
  stats: {
    active: 0,
    overdue: 0,
    returned: 0,
    totalFines: 0,
  },
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  },
};

export const fetchMyBorrowings = createAsyncThunk(
  'borrowings/fetchMyBorrowings',
  async (params?: { page?: number; filters?: BorrowingFilters }) => {
    const response = await borrowingService.getMyBorrowings(params?.page, params?.filters);
    return response;
  }
);

export const fetchBorrowings = createAsyncThunk(
  'borrowings/fetchBorrowings',
  async (params?: { page?: number; filters?: BorrowingFilters }) => {
    const response = await borrowingService.getBorrowings(params?.page, params?.filters);
    return response;
  }
);

export const borrowBook = createAsyncThunk(
  'borrowings/borrowBook',
  async (data: { userId: string; bookId: string; dueDate?: string; notes?: string }) => {
    const response = await borrowingService.borrowBook(data);
    return response;
  }
);

export const renewBorrowing = createAsyncThunk(
  'borrowings/renewBorrowing',
  async (id: string) => {
    const response = await borrowingService.renewBorrowing(id);
    return response;
  }
);

export const returnBook = createAsyncThunk(
  'borrowings/returnBook',
  async (data: { id: string; condition?: string; notes?: string }) => {
    const response = await borrowingService.returnBook(data.id, data.condition, data.notes);
    return response;
  }
);

export const fetchMyReservations = createAsyncThunk(
  'borrowings/fetchMyReservations',
  async () => {
    const response = await borrowingService.getMyReservations();
    return response;
  }
);

export const createReservation = createAsyncThunk(
  'borrowings/createReservation',
  async (bookId: string) => {
    const response = await borrowingService.createReservation(bookId);
    return response;
  }
);

export const cancelReservation = createAsyncThunk(
  'borrowings/cancelReservation',
  async (id: string) => {
    const response = await borrowingService.cancelReservation(id);
    return response;
  }
);

export const fetchBorrowingStats = createAsyncThunk(
  'borrowings/fetchStats',
  async () => {
    const response = await borrowingService.getBorrowingStats();
    return response;
  }
);

const borrowingSlice = createSlice({
  name: 'borrowings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateBorrowingStatus: (state, action: PayloadAction<{ id: string; status: Borrowing['status'] }>) => {
      const borrowing = state.borrowings.find(b => b.id === action.payload.id);
      if (borrowing) {
        borrowing.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Borrowings
      .addCase(fetchMyBorrowings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBorrowings.fulfilled, (state, action) => {
        state.loading = false;
        state.borrowings = action.payload.borrowings;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyBorrowings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ödünç alınan kitaplar yüklenemedi';
      })
      // Fetch All Borrowings (Admin)
      .addCase(fetchBorrowings.fulfilled, (state, action) => {
        state.borrowings = action.payload.borrowings;
        state.pagination = action.payload.pagination;
      })
      // Borrow Book
      .addCase(borrowBook.fulfilled, (state, action) => {
        state.borrowings.unshift(action.payload.borrowing);
        toast.success('Kitap başarıyla ödünç verildi');
      })
      .addCase(borrowBook.rejected, (state, action) => {
        toast.error(action.error.message || 'Ödünç verme işlemi başarısız');
      })
      // Renew Borrowing
      .addCase(renewBorrowing.fulfilled, (state, action) => {
        const index = state.borrowings.findIndex(b => b.id === action.payload.borrowing.id);
        if (index > -1) {
          state.borrowings[index] = action.payload.borrowing;
        }
        toast.success('Ödünç süresi uzatıldı');
      })
      .addCase(renewBorrowing.rejected, (state, action) => {
        toast.error(action.error.message || 'Süre uzatma başarısız');
      })
      // Return Book
      .addCase(returnBook.fulfilled, (state, action) => {
        const index = state.borrowings.findIndex(b => b.id === action.payload.borrowing.id);
        if (index > -1) {
          state.borrowings[index] = action.payload.borrowing;
        }
        if (action.payload.fine > 0) {
          toast.warning(`Kitap iade edildi. Gecikme cezası: ${action.payload.fine} TL`);
        } else {
          toast.success('Kitap başarıyla iade edildi');
        }
      })
      // Fetch Reservations
      .addCase(fetchMyReservations.fulfilled, (state, action) => {
        state.reservations = action.payload.reservations;
      })
      // Create Reservation
      .addCase(createReservation.fulfilled, (state, action) => {
        state.reservations.push(action.payload.reservation);
        toast.success('Rezervasyon oluşturuldu');
      })
      .addCase(createReservation.rejected, (state, action) => {
        toast.error(action.error.message || 'Rezervasyon oluşturulamadı');
      })
      // Cancel Reservation
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.reservations = state.reservations.filter(r => r.id !== action.payload);
        toast.success('Rezervasyon iptal edildi');
      })
      // Fetch Stats
      .addCase(fetchBorrowingStats.fulfilled, (state, action) => {
        state.stats = action.payload.summary;
      });
  },
});

export const { clearError, updateBorrowingStatus } = borrowingSlice.actions;
export default borrowingSlice.reducer;