import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';

import store from './store/store';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AppointmentBooking from './pages/Appointments/AppointmentBooking';
import MyAppointments from './pages/Appointments/MyAppointments';
import CourtCalendar from './pages/Calendar/CourtCalendar';
import JudgePanel from './pages/Judge/JudgePanel';
import LawyerPanel from './pages/Lawyer/LawyerPanel';
import AdminPanel from './pages/Admin/AdminPanel';
import DocumentsPage from './pages/Documents/DocumentsPage';
import VideoConference from './pages/VideoConference/VideoConference';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotFoundPage from './pages/Error/NotFoundPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#42a5f5',
    },
    secondary: {
      main: '#dc004e',
      dark: '#9a0036',
      light: '#e5336d',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                <Route path="appointments" element={
                  <ProtectedRoute>
                    <Routes>
                      <Route path="book" element={<AppointmentBooking />} />
                      <Route path="my" element={<MyAppointments />} />
                    </Routes>
                  </ProtectedRoute>
                } />
                
                <Route path="calendar" element={
                  <ProtectedRoute>
                    <CourtCalendar />
                  </ProtectedRoute>
                } />
                
                <Route path="judge" element={
                  <ProtectedRoute roles={['judge']}>
                    <JudgePanel />
                  </ProtectedRoute>
                } />
                
                <Route path="lawyer" element={
                  <ProtectedRoute roles={['lawyer']}>
                    <LawyerPanel />
                  </ProtectedRoute>
                } />
                
                <Route path="admin" element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                
                <Route path="documents" element={
                  <ProtectedRoute>
                    <DocumentsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="video-conference/:id" element={
                  <ProtectedRoute>
                    <VideoConference />
                  </ProtectedRoute>
                } />
                
                <Route path="reports" element={
                  <ProtectedRoute roles={['admin', 'court_manager']}>
                    <ReportsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;