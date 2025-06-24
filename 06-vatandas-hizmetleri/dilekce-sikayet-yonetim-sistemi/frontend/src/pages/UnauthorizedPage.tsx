import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';
import {
  Block,
  Home,
  ArrowBack,
} from '@mui/icons-material';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              backgroundColor: 'error.light',
              borderRadius: '50%',
              padding: 3,
              mb: 3,
            }}
          >
            <Block sx={{ fontSize: 60, color: 'error.dark' }} />
          </Box>

          <Typography component="h1" variant="h4" gutterBottom>
            Yetkisiz Erişim
          </Typography>

          <Typography variant="body1" color="text.secondary" align="center" paragraph>
            Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" paragraph>
            Eğer bu sayfaya erişiminiz olması gerektiğini düşünüyorsanız, 
            lütfen sistem yöneticinizle iletişime geçin.
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
            >
              Geri Dön
            </Button>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate('/')}
            >
              Ana Sayfa
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;