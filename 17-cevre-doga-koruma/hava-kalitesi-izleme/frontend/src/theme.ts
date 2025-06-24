import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      light: '#60ad5e',
      dark: '#005005',
    },
    secondary: {
      main: '#1976d2',
      light: '#63a4ff',
      dark: '#004ba0',
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    // AQI color scale
    aqi: {
      good: '#00e400',
      moderate: '#ffff00',
      unhealthySensitive: '#ff7e00',
      unhealthy: '#ff0000',
      veryUnhealthy: '#8f3f97',
      hazardous: '#7e0023',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
});

// Extend theme type for AQI colors
declare module '@mui/material/styles' {
  interface Palette {
    aqi: {
      good: string;
      moderate: string;
      unhealthySensitive: string;
      unhealthy: string;
      veryUnhealthy: string;
      hazardous: string;
    };
  }
  interface PaletteOptions {
    aqi?: {
      good?: string;
      moderate?: string;
      unhealthySensitive?: string;
      unhealthy?: string;
      veryUnhealthy?: string;
      hazardous?: string;
    };
  }
}

export default theme;