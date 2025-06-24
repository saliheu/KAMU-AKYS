import { Box, CircularProgress } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="background.default"
    >
      <CircularProgress size={48} />
    </Box>
  );
};

export default LoadingScreen;