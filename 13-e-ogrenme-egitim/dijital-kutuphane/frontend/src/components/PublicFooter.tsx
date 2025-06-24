import { Box, Container, Typography, Grid, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PublicFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Dijital Kütüphane
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Binlerce kitaba anında erişin, okuyun ve keşfedin. Modern dijital kütüphane deneyimi.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Hızlı Linkler
            </Typography>
            <Link component={RouterLink} to="/books" color="inherit" display="block" sx={{ mb: 1 }}>
              Kitaplar
            </Link>
            <Link component={RouterLink} to="/about" color="inherit" display="block" sx={{ mb: 1 }}>
              Hakkımızda
            </Link>
            <Link component={RouterLink} to="/contact" color="inherit" display="block">
              İletişim
            </Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              İletişim
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: info@dijitalkutuphane.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tel: +90 555 123 4567
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Dijital Kütüphane. Tüm hakları saklıdır.
        </Typography>
      </Container>
    </Box>
  );
};

export default PublicFooter;