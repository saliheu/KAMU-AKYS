import React from 'react';
import { Container, Typography } from '@mui/material';

const Alerts: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4">Uyarılar</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Uyarı yönetimi sayfası yapım aşamasında...
      </Typography>
    </Container>
  );
};

export default Alerts;