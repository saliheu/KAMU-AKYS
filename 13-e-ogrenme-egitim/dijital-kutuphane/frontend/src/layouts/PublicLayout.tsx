import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import PublicHeader from '@/components/PublicHeader';
import PublicFooter from '@/components/PublicFooter';

const PublicLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <PublicHeader />
      <Box
        component="main"
        sx={{
          flex: 1,
          py: 3,
        }}
      >
        <Outlet />
      </Box>
      <PublicFooter />
    </Box>
  );
};

export default PublicLayout;