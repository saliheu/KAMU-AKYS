import { Container, Typography, Box, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import bookService from '@/services/bookService';
import statsService from '@/services/statsService';
import {
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  LibraryBooks as LibraryBooksIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const Home = () => {
  const { data: booksData } = useQuery({
    queryKey: ['books', 'featured'],
    queryFn: () => bookService.getBooks(1, { sortBy: 'popularity', sortOrder: 'desc' }),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', 'dashboard'],
    queryFn: () => statsService.getDashboardStats(),
  });

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                Dijital Kütüphane
              </Typography>
              <Typography variant="h5" paragraph>
                Binlerce kitaba anında erişin, okuyun ve keşfedin
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/books"
                  variant="contained"
                  size="large"
                  sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}
                >
                  Kitapları Keşfet
                </Button>
                <Button
                  component={RouterLink}
                  to="/auth/register"
                  variant="outlined"
                  size="large"
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  Üye Ol
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/library-hero.svg"
                alt="Dijital Kütüphane"
                sx={{ width: '100%', height: 'auto' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 3 }}>
              <CardContent>
                <MenuBookIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {stats?.books.total || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Toplam Kitap
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 3 }}>
              <CardContent>
                <PeopleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {stats?.users.total || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kayıtlı Üye
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 3 }}>
              <CardContent>
                <LibraryBooksIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {stats?.borrowings.active || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aktif Ödünç
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', py: 3 }}>
              <CardContent>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {stats?.categories.total || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kategori
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Books */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
          Öne Çıkan Kitaplar
        </Typography>
        <Grid container spacing={3}>
          {booksData?.books.slice(0, 8).map((book) => (
            <Grid item key={book.id} xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={book.coverImage || '/default-book-cover.jpg'}
                  alt={book.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2" noWrap>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {book.author?.name}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    component={RouterLink}
                    to={`/books/${book.id}`}
                    variant="outlined"
                    fullWidth
                  >
                    Detayları Gör
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
            Neden Dijital Kütüphane?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <MenuBookIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Geniş Koleksiyon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Binlerce kitap, dergi ve akademik yayına anında erişim
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <LibraryBooksIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Kolay Ödünç Alma
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tek tıkla kitap ödünç alın, süre uzatın veya rezerve edin
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Kişisel İstatistikler
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Okuma alışkanlıklarınızı takip edin ve geliştirin
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Home;