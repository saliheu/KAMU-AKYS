import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import templateService from '../../services/templateService';
import { Template } from '../../types';

interface TemplateState {
  templates: Template[];
  currentTemplate: Template | null;
  categories: string[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: TemplateState = {
  templates: [],
  currentTemplate: null,
  categories: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
};

export const fetchTemplates = createAsyncThunk(
  'templates/fetchAll',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
  }) => {
    const response = await templateService.getTemplates(params);
    return response;
  }
);

export const fetchTemplate = createAsyncThunk(
  'templates/fetchOne',
  async (id: string) => {
    const response = await templateService.getTemplate(id);
    return response.template;
  }
);

export const fetchCategories = createAsyncThunk(
  'templates/fetchCategories',
  async () => {
    const response = await templateService.getCategories();
    return response.categories;
  }
);

export const createTemplate = createAsyncThunk(
  'templates/create',
  async (formData: FormData) => {
    const response = await templateService.createTemplate(formData);
    return response.template;
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/update',
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const response = await templateService.updateTemplate(id, formData);
    return response.template;
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/delete',
  async (id: string) => {
    await templateService.deleteTemplate(id);
    return id;
  }
);

export const generateDocument = createAsyncThunk(
  'templates/generate',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await templateService.generateDocument(id, data);
    return response;
  }
);

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTemplate: (state, action: PayloadAction<Template | null>) => {
      state.currentTemplate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.templates;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch templates';
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        state.currentTemplate = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        if (state.currentTemplate?.id === action.payload.id) {
          state.currentTemplate = action.payload;
        }
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(t => t.id !== action.payload);
        state.total -= 1;
        if (state.currentTemplate?.id === action.payload) {
          state.currentTemplate = null;
        }
      });
  },
});

export const { clearError, setCurrentTemplate } = templateSlice.actions;
export default templateSlice.reducer;