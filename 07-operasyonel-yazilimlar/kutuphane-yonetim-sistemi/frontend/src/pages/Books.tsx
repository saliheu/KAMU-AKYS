import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import bookService from '../services/book.service';
import { Book } from '../types';

const Books: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    loadBooks();
  }, [page, searchQuery]);
  
  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks({
        page,
        search: searchQuery,
      });
      setBooks(response.results);
      setTotalPages(Math.ceil(response.count / 20));
    } catch (err: any) {
      setError('Kitaplar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBooks();
  };
  
  if (loading && books.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Kitaplar
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/books/new')}
        >
          Yeni Kitap
        </Button>
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              placeholder="Kitap adı, ISBN veya yazar ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </CardContent>
      </Card>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(`/books/${book.id}`)}
            >
              {book.cover_image ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={book.cover_image}
                  alt={book.title}
                />
              ) : (
                <Box
                  height={200}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bgcolor="grey.200"
                >
                  <Typography variant="h6" color="text.secondary">
                    Kapak Yok
                  </Typography>
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {book.authors.map(a => a.full_name).join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ISBN: {book.isbn}
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={`${book.available_copies}/${book.total_copies} mevcut`}
                    color={book.available_copies > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default Books;