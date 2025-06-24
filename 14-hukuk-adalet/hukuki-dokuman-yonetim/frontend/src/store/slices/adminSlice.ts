import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';
import { User } from '../../types';

interface AdminState {
  users: User[];
  stats: any;
  settings: any;
  loading: boolean;
  error: string | null;
  usersTotal: number;
  usersPage: number;
  usersTotalPages: number;
}

const initialState: AdminState = {
  users: [],
  stats: null,
  settings: null,
  loading: false,
  error: null,
  usersTotal: 0,
  usersPage: 1,
  usersTotalPages: 1,
};

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    department?: string;
    isActive?: boolean;
  }) => {
    const response = await adminService.getUsers(params);
    return response;
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    title?: string;
  }) => {
    const response = await adminService.createUser(userData);
    return response.user;
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, data }: {
    id: string;
    data: {
      name?: string;
      email?: string;
      role?: string;
      department?: string;
      title?: string;
      isActive?: boolean;
    };
  }) => {
    const response = await adminService.updateUser(id, data);
    return response.user;
  }
);

export const resetUserPassword = createAsyncThunk(
  'admin/resetPassword',
  async (userId: string) => {
    const response = await adminService.resetUserPassword(userId);
    return response;
  }
);

export const fetchStats = createAsyncThunk(
  'admin/fetchStats',
  async () => {
    const response = await adminService.getStats();
    return response;
  }
);

export const fetchSettings = createAsyncThunk(
  'admin/fetchSettings',
  async () => {
    const response = await adminService.getSettings();
    return response.settings;
  }
);

export const updateSettings = createAsyncThunk(
  'admin/updateSettings',
  async (settings: any) => {
    const response = await adminService.updateSettings(settings);
    return response.settings;
  }
);

export const performMaintenance = createAsyncThunk(
  'admin/maintenance',
  async (type: 'cleanup' | 'reindex') => {
    const response = await adminService.performMaintenance(type);
    return response;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.usersTotal = action.payload.total;
        state.usersPage = action.payload.page;
        state.usersTotalPages = action.payload.totalPages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
        state.usersTotal += 1;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;