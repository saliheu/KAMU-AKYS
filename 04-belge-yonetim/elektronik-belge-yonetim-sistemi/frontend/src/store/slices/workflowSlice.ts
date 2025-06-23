import { createSlice } from '@reduxjs/toolkit';

interface WorkflowState {
  workflows: any[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkflowState = {
  workflows: [],
  loading: false,
  error: null,
};

const workflowSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setWorkflows: (state, action) => {
      state.workflows = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setWorkflows, setLoading, setError } = workflowSlice.actions;
export default workflowSlice.reducer;