import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Malzemeler from './pages/Malzemeler';
import Tuketim from './pages/Tuketim';
import Raporlar from './pages/Raporlar';
import Personel from './pages/Personel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="malzemeler" element={<Malzemeler />} />
            <Route path="tuketim" element={<Tuketim />} />
            <Route path="raporlar" element={<Raporlar />} />
            <Route path="personel" element={<Personel />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;