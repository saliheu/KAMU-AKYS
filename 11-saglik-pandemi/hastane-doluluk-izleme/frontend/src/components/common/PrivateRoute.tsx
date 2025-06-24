import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const token = localStorage.getItem('token');

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated || token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;