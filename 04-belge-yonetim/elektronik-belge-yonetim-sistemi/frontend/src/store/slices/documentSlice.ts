import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import documentService from '../../services/documentService';
import { Document, CreateDocumentData, UpdateDocumentData } from '../../types/document';

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  totalCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  totalCount: 0,
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params?: any) => {
    const response = await documentService.getDocuments(params);
    return response;
  }
);

export const fetchDocument = createAsyncThunk(
  'documents/fetchDocument',
  async (id: number) => {
    const response = await documentService.getDocument(id);
    return response;
  }
);

export const createDocument = createAsyncThunk(
  'documents/createDocument',
  async (data: CreateDocumentData) => {
    const response = await documentService.createDocument(data);
    return response;
  }
);

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, data }: { id: number; data: UpdateDocumentData }) => {
    const response = await documentService.updateDocument(id, data);
    return response;
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id: number) => {
    await documentService.deleteDocument(id);
    return id;
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Belgeler yüklenemedi';
      })
      // Fetch single document
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
        state.error = action.error.message || 'Belge yüklenemedi';
      })
      // Create document
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
        state.totalCount += 1;
      })
      // Update document
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex((doc) => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      // Delete document
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((doc) => doc.id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export const { clearError, clearCurrentDocument } = documentSlice.actions;
export default documentSlice.reducer;