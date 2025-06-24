import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Case } from '@/types';

interface CaseState {
  cases: Case[];
  currentCase: Case | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: string;
    type?: string;
    priority?: string;
    lawyerId?: string;
    clientId?: string;
    search?: string;
  };
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: CaseState = {
  cases: [],
  currentCase: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  },
};

const caseSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setCases: (state, action: PayloadAction<{ cases: Case[]; pagination: any }>) => {
      state.cases = action.payload.cases;
      state.pagination = action.payload.pagination;
    },
    setCurrentCase: (state, action: PayloadAction<Case>) => {
      state.currentCase = action.payload;
    },
    updateCase: (state, action: PayloadAction<Case>) => {
      const index = state.cases.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.cases[index] = action.payload;
      }
      if (state.currentCase?.id === action.payload.id) {
        state.currentCase = action.payload;
      }
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCases,
  setCurrentCase,
  updateCase,
  setFilters,
  setLoading,
  setError,
} = caseSlice.actions;

export default caseSlice.reducer;