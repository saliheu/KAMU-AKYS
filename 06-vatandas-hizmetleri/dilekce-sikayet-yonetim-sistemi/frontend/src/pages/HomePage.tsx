import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Container,
} from '@mui/material';
import {
  Add,
  Assignment,
  Dashboard as DashboardIcon,
  Login,
  PersonAdd,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isCitizen, isOfficer, isAdmin } = useAuth();

  const citizenActions = [
    {
      title: 'Yeni Şikayet Oluştur',
      description: 'Belediyeye yeni bir şikayet veya öneri gönderin.',
      icon: <Add fontSize="large" />,
      action: () => navigate('/complaints/new'),
      color: 'primary',
    },
    {
      title: 'Şikayetlerim',
      description: 'Gönderdiğiniz şikayetleri görüntüleyin ve takip edin.',
      icon: <Assignment fontSize="large" />,
      action: () => navigate('/my-complaints'),
      color: 'secondary',
    },
  ];

  const officerActions = [
    {
      title: 'Dashboard',
      description: 'Sistem istatistiklerini ve özet bilgileri görüntüleyin.',
      icon: <DashboardIcon fontSize="large" />,
      action: () => navigate('/dashboard'),
      color: 'primary',
    },
    {
      title: 'Şikayetler',
      description: 'Tüm şikayetleri görüntüleyin ve yönetin.',
      icon: <Assignment fontSize="large" />,
      action: () => navigate('/complaints'),
      color: 'secondary',
    },
  ];

  const guestActions = [
    {
      title: 'Giriş Yap',
      description: 'Mevcut hesabınızla giriş yapın.',
      icon: <Login fontSize="large" />,
      action: () => navigate('/login'),
      color: 'primary',
    },
    {
      title: 'Kayıt Ol',
      description: 'Yeni bir vatandaş hesabı oluşturun.',
      icon: <PersonAdd fontSize="large" />,
      action: () => navigate('/register'),
      color: 'secondary',
    },
  ];

  let actions = guestActions;
  if (isCitizen) {
    actions = citizenActions;
  } else if (isOfficer || isAdmin) {
    actions = officerActions;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Dilekçe Şikayet Yönetim Sistemi
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Belediye hizmetlerimizi iyileştirmek için görüş ve önerilerinizi bekliyoruz.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                    {action.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    color={action.color as any}
                    onClick={action.action}
                    size="large"
                  >
                    {action.title}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {!isAuthenticated && (
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Sistem Hakkında
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Dilekçe Şikayet Yönetim Sistemi, vatandaşların belediye hizmetleri ile ilgili
              şikayet, öneri ve taleplerini kolayca iletebilmelerini sağlayan modern bir platformdur.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Kolay Kullanım
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Birkaç tıklama ile şikayetinizi oluşturun ve takip edin.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Hızlı Yanıt
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yetkili birimler tarafından hızlıca değerlendirilir.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Şeffaf Takip
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Şikayetinizin durumunu anlık olarak takip edebilirsiniz.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;