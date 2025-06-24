import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Personnel from '../pages/Personnel';
import PersonnelDetail from '../pages/PersonnelDetail';
import PersonnelForm from '../pages/PersonnelForm';
import Departments from '../pages/Departments';
import Positions from '../pages/Positions';
import Profile from '../pages/Profile';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Router = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="personnel" element={<Personnel />} />
        <Route path="personnel/new" element={<PersonnelForm />} />
        <Route path="personnel/:id" element={<PersonnelDetail />} />
        <Route path="personnel/:id/edit" element={<PersonnelForm />} />
        <Route path="departments" element={<Departments />} />
        <Route path="positions" element={<Positions />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default Router;