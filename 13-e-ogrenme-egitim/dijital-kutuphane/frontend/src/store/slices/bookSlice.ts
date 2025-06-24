import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Book, BookFilters, PaginatedResponse } from '@/types';
import bookService from '@/services/bookService';

interface BookState {
  books: Book[];
  currentBook: Book | null;
  searchResults: Book[];
  favoriteBooks: string[];
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  filters: BookFilters;
}

const initialState: BookState = {
  books: [],
  currentBook: null,
  searchResults: [],
  favoriteBooks: JSON.parse(localStorage.getItem('favoriteBooks') || '[]'),
  loading: false,
  searchLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  },
  filters: {},
};

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params: { page?: number; filters?: BookFilters }) => {
    const response = await bookService.getBooks(params.page, params.filters);
    return response;
  }
);

export const fetchBook = createAsyncThunk(
  'books/fetchBook',
  async (id: string) => {
    const response = await bookService.getBook(id);
    return response;
  }
);

export const searchBooks = createAsyncThunk(
  'books/searchBooks',
  async (params: { query: string; filters?: BookFilters }) => {
    const response = await bookService.searchBooks(params.query, params.filters);
    return response;
  }
);

export const createBook = createAsyncThunk(
  'books/createBook',
  async (data: FormData) => {
    const response = await bookService.createBook(data);
    return response;
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, data }: { id: string; data: FormData }) => {
    const response = await bookService.updateBook(id, data);
    return response;
  }
);

export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (id: string) => {
    await bookService.deleteBook(id);
    return id;
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<BookFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const bookId = action.payload;
      const index = state.favoriteBooks.indexOf(bookId);
      
      if (index > -1) {
        state.favoriteBooks.splice(index, 1);
      } else {
        state.favoriteBooks.push(bookId);
      }
      
      localStorage.setItem('favoriteBooks', JSON.stringify(state.favoriteBooks));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.books;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Kitaplar yüklenemedi';
      })
      // Fetch Book
      .addCase(fetchBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBook.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload.book;
      })
      .addCase(fetchBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Kitap yüklenemedi';
      })
      // Search Books
      .addCase(searchBooks.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.books;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.error.message || 'Arama başarısız';
      })
      // Create Book
      .addCase(createBook.fulfilled, (state, action) => {
        state.books.unshift(action.payload.book);
        state.pagination.total += 1;
      })
      // Update Book
      .addCase(updateBook.fulfilled, (state, action) => {
        const index = state.books.findIndex(b => b.id === action.payload.book.id);
        if (index > -1) {
          state.books[index] = action.payload.book;
        }
        if (state.currentBook?.id === action.payload.book.id) {
          state.currentBook = action.payload.book;
        }
      })
      // Delete Book
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter(b => b.id !== action.payload);
        if (state.currentBook?.id === action.payload) {
          state.currentBook = null;
        }
        state.pagination.total -= 1;
      });
  },
});

export const { setFilters, clearFilters, toggleFavorite, clearError } = bookSlice.actions;
export default bookSlice.reducer;