import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { RootState, AppDispatch } from './store';
import { initializeAuth } from './store/slices/authSlice';
import { connectSocket, disconnectSocket } from './services/socket';

// Layout
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Templates from './pages/Templates';
import Workflows from './pages/Workflows';
import WorkflowDetail from './pages/WorkflowDetail';
import Shares from './pages/Shares';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSocket(user.id);
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflows/:id" element={<WorkflowDetail />} />
            <Route path="/shares" element={<Shares />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            {user?.role === 'admin' && <Route path="/admin/*" element={<Admin />} />}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
}

export default App;