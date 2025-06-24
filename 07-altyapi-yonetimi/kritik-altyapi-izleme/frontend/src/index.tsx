import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom>
          Kritik Altyapı İzleme Sistemi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enerji, su, ulaşım ve telekomünikasyon altyapılarının gerçek zamanlı izlenmesi için kapsamlı platform.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Backend tamamen implementasyonlu, frontend için temel kurulum yapıldı.
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);