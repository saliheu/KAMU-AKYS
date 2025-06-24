import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import workflowService from '../../services/workflowService';
import { Workflow } from '../../types';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: WorkflowState = {
  workflows: [],
  currentWorkflow: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
};

export const fetchWorkflows = createAsyncThunk(
  'workflows/fetchAll',
  async (params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    priority?: string;
  }) => {
    const response = await workflowService.getWorkflows(params);
    return response;
  }
);

export const fetchWorkflow = createAsyncThunk(
  'workflows/fetchOne',
  async (id: string) => {
    const response = await workflowService.getWorkflow(id);
    return response.workflow;
  }
);

export const createWorkflow = createAsyncThunk(
  'workflows/create',
  async (data: {
    name: string;
    description?: string;
    documentId: string;
    type: string;
    steps: any[];
    deadline?: Date;
    priority: string;
  }) => {
    const response = await workflowService.createWorkflow(data);
    return response.workflow;
  }
);

export const advanceWorkflow = createAsyncThunk(
  'workflows/advance',
  async ({ id, action, comments, data }: {
    id: string;
    action: 'approve' | 'reject';
    comments?: string;
    data?: any;
  }) => {
    const response = await workflowService.advanceWorkflow(id, action, comments, data);
    return response.workflow;
  }
);

export const cancelWorkflow = createAsyncThunk(
  'workflows/cancel',
  async ({ id, reason }: { id: string; reason: string }) => {
    const response = await workflowService.cancelWorkflow(id, reason);
    return response.workflow;
  }
);

const workflowSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWorkflow: (state, action: PayloadAction<Workflow | null>) => {
      state.currentWorkflow = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflows.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.loading = false;
        state.workflows = action.payload.workflows;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch workflows';
      })
      .addCase(fetchWorkflow.fulfilled, (state, action) => {
        state.currentWorkflow = action.payload;
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        state.workflows.unshift(action.payload);
        state.total += 1;
      })
      .addCase(advanceWorkflow.fulfilled, (state, action) => {
        const index = state.workflows.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
        if (state.currentWorkflow?.id === action.payload.id) {
          state.currentWorkflow = action.payload;
        }
      })
      .addCase(cancelWorkflow.fulfilled, (state, action) => {
        const index = state.workflows.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
        if (state.currentWorkflow?.id === action.payload.id) {
          state.currentWorkflow = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentWorkflow } = workflowSlice.actions;
export default workflowSlice.reducer;