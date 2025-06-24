import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import shareService from '../../services/shareService';
import { Share } from '../../types';

interface ShareState {
  shares: Share[];
  loading: boolean;
  error: string | null;
}

const initialState: ShareState = {
  shares: [],
  loading: false,
  error: null,
};

export const fetchShares = createAsyncThunk(
  'shares/fetchAll',
  async (type: 'received' | 'sent' = 'received') => {
    const response = await shareService.getMyShares(type);
    return response.shares;
  }
);

export const createShare = createAsyncThunk(
  'shares/create',
  async (data: {
    documentId: string;
    shareType: 'user' | 'department' | 'link';
    sharedWith?: string;
    permissions: string[];
    expiresAt?: Date;
    maxDownloads?: number;
    password?: string;
    notes?: string;
  }) => {
    const response = await shareService.createShare(data);
    return response;
  }
);

export const updateShare = createAsyncThunk(
  'shares/update',
  async ({ id, data }: {
    id: string;
    data: {
      permissions?: string[];
      expiresAt?: Date;
      maxDownloads?: number;
      notes?: string;
      isActive?: boolean;
    };
  }) => {
    const response = await shareService.updateShare(id, data);
    return response.share;
  }
);

export const revokeShare = createAsyncThunk(
  'shares/revoke',
  async (id: string) => {
    await shareService.revokeShare(id);
    return id;
  }
);

const shareSlice = createSlice({
  name: 'shares',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShares.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShares.fulfilled, (state, action) => {
        state.loading = false;
        state.shares = action.payload;
      })
      .addCase(fetchShares.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shares';
      })
      .addCase(createShare.fulfilled, (state, action) => {
        state.shares.unshift(action.payload.share);
      })
      .addCase(updateShare.fulfilled, (state, action) => {
        const index = state.shares.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.shares[index] = action.payload;
        }
      })
      .addCase(revokeShare.fulfilled, (state, action) => {
        const index = state.shares.findIndex(s => s.id === action.payload);
        if (index !== -1) {
          state.shares[index].isActive = false;
        }
      });
  },
});

export const { clearError } = shareSlice.actions;
export default shareSlice.reducer;