import { createTheme } from '@mui/material/styles';
import { red, orange, green, blue, grey } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: red[700],
      light: red[500],
      dark: red[900],
      contrastText: '#fff',
    },
    secondary: {
      main: blue[600],
      light: blue[400],
      dark: blue[800],
    },
    error: {
      main: red[700],
    },
    warning: {
      main: orange[700],
    },
    success: {
      main: green[700],
    },
    info: {
      main: blue[700],
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    emergency: {
      critical: red[900],
      high: red[700],
      medium: orange[700],
      low: blue[700],
    },
    disaster: {
      earthquake: '#8B4513',
      flood: '#4682B4',
      fire: '#FF4500',
      landslide: '#8B7355',
      avalanche: '#F0F8FF',
      storm: '#4B0082',
      tsunami: '#1E90FF',
      pandemic: '#FF1493',
      cbrn: '#FFD700',
      terror: '#800000',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: grey[100],
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

export default theme;