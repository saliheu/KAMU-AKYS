import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { validateToken } from './store/slices/authSlice';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Page Components
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AppointmentBooking from './pages/Appointments/AppointmentBooking';
import MyAppointments from './pages/Appointments/MyAppointments';

// UI Components
import LoadingSpinner from './components/UI/LoadingSpinner';

// Styles
import './App.css';

const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, token } = useSelector((state) => state.auth);

  // Validate token on app initialization
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && !isAuthenticated) {
      dispatch(validateToken());
    }
  }, [dispatch, isAuthenticated]);

  // Show loading screen while validating token
  if (loading && !isAuthenticated && token) {
    return (
      <div className="app-loading">
        <LoadingSpinner 
          size="large" 
          text="Oturum doğrulanıyor..." 
          overlay 
        />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <LoginPage />
          } 
        />
        
        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  
                  {/* Appointments */}
                  <Route path="/appointments/booking" element={<AppointmentBooking />} />
                  <Route path="/appointments/my-appointments" element={<MyAppointments />} />
                  
                  {/* Default redirect */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;