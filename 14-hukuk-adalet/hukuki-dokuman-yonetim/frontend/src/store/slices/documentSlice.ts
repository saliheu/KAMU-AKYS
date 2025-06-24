import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import documentService from '../../services/documentService';
import { Document, Version } from '../../types';

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  versions: Version[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  versions: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  totalPages: 1,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const response = await documentService.getDocuments(params);
    return response;
  }
);

export const fetchDocument = createAsyncThunk(
  'documents/fetchOne',
  async (id: string) => {
    const response = await documentService.getDocument(id);
    return response.document;
  }
);

export const createDocument = createAsyncThunk(
  'documents/create',
  async (formData: FormData) => {
    const response = await documentService.createDocument(formData);
    return response.document;
  }
);

export const updateDocument = createAsyncThunk(
  'documents/update',
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const response = await documentService.updateDocument(id, formData);
    return response.document;
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id: string) => {
    await documentService.deleteDocument(id);
    return id;
  }
);

export const lockDocument = createAsyncThunk(
  'documents/lock',
  async (id: string) => {
    const response = await documentService.lockDocument(id);
    return response.document;
  }
);

export const unlockDocument = createAsyncThunk(
  'documents/unlock',
  async (id: string) => {
    const response = await documentService.unlockDocument(id);
    return response.document;
  }
);

export const fetchVersions = createAsyncThunk(
  'documents/fetchVersions',
  async (documentId: string) => {
    const response = await documentService.getVersions(documentId);
    return response.versions;
  }
);

export const restoreVersion = createAsyncThunk(
  'documents/restoreVersion',
  async (versionId: string) => {
    const response = await documentService.restoreVersion(versionId);
    return response.document;
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.documents;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      // Fetch Single Document
      .addCase(fetchDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDocument = action.payload;
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch document';
      })
      // Create Document
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
        state.total += 1;
      })
      // Update Document
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      // Delete Document
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
        state.total -= 1;
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null;
        }
      })
      // Lock/Unlock Document
      .addCase(lockDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(unlockDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      // Versions
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.versions = action.payload;
      })
      .addCase(restoreVersion.fulfilled, (state, action) => {
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentDocument } = documentSlice.actions;
export default documentSlice.reducer;