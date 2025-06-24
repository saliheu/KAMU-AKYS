import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import DisasterMap from './pages/disasters/DisasterMap';
import DisasterDetail from './pages/disasters/DisasterDetail';
import HelpRequests from './pages/help/HelpRequests';
import HelpRequestDetail from './pages/help/HelpRequestDetail';
import Teams from './pages/teams/Teams';
import TeamDetail from './pages/teams/TeamDetail';
import Resources from './pages/resources/Resources';
import ResourceRequest from './pages/resources/ResourceRequest';
import Reports from './pages/reports/Reports';
import ReportDetail from './pages/reports/ReportDetail';
import SafeZones from './pages/locations/SafeZones';
import Personnel from './pages/personnel/Personnel';
import Volunteers from './pages/volunteers/Volunteers';
import Settings from './pages/Settings';

// Components
import PrivateRoute from './components/PrivateRoute';
import SocketProvider from './contexts/SocketProvider';

// Store
import { checkAuth } from './store/slices/authSlice';
import { connectSocket, disconnectSocket } from './store/slices/socketSlice';

function App() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(connectSocket(user));
    } else {
      dispatch(disconnectSocket());
    }
  }, [isAuthenticated, user, dispatch]);

  // Handle socket events
  useEffect(() => {
    const handleNotification = (notification) => {
      enqueueSnackbar(notification.message, {
        variant: notification.priority === 'critical' ? 'error' : 'info',
        persist: notification.priority === 'critical',
      });
    };

    window.addEventListener('socket:notification', handleNotification);
    return () => {
      window.removeEventListener('socket:notification', handleNotification);
    };
  }, [enqueueSnackbar]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <SocketProvider>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/disasters">
            <Route index element={<DisasterMap />} />
            <Route path=":id" element={<DisasterDetail />} />
          </Route>
          <Route path="/help-requests">
            <Route index element={<HelpRequests />} />
            <Route path=":id" element={<HelpRequestDetail />} />
          </Route>
          <Route path="/teams">
            <Route index element={<Teams />} />
            <Route path=":id" element={<TeamDetail />} />
          </Route>
          <Route path="/resources">
            <Route index element={<Resources />} />
            <Route path="request" element={<ResourceRequest />} />
          </Route>
          <Route path="/reports">
            <Route index element={<Reports />} />
            <Route path=":id" element={<ReportDetail />} />
          </Route>
          <Route path="/safe-zones" element={<SafeZones />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;