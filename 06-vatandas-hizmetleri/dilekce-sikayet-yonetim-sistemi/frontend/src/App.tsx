import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import tr from 'date-fns/locale/tr';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ComplaintList from './components/complaint/ComplaintList';
import ComplaintForm from './components/complaint/ComplaintForm';
import ComplaintDetail from './components/complaint/ComplaintDetail';

// Pages
import HomePage from './pages/HomePage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Types
import { UserRole } from './types';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected routes with layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                
                {/* Citizen routes */}
                <Route
                  path="/complaints/new"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CITIZEN]}>
                      <ComplaintForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-complaints"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.CITIZEN]}>
                      <MyComplaintsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Officer and Admin routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/complaints"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                      <ComplaintList />
                    </ProtectedRoute>
                  }
                />

                {/* Common protected routes */}
                <Route
                  path="/complaints/:id"
                  element={
                    <ProtectedRoute>
                      <ComplaintDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Admin only routes */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                      <div>Users Management (To be implemented)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/departments"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                      <div>Departments Management (To be implemented)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.OFFICER, UserRole.ADMIN]}>
                      <div>Reports (To be implemented)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                      <div>Settings (To be implemented)</div>
                    </ProtectedRoute>
                  }
                />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
