import React from 'react';
import { Container, Typography } from '@mui/material';

const Profile: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4">Profil</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Kullanıcı profili sayfası yapım aşamasında...
      </Typography>
    </Container>
  );
};

export default Profile;