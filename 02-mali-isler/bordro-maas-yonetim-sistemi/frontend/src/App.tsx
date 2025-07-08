import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import { useDispatch } from 'react-redux'

import AppLayout from './components/Layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterSuccess from './pages/RegisterSuccess'
import RegistrationRequests from './pages/RegistrationRequests'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Payrolls from './pages/Payrolls'
import PayrollDetail from './pages/PayrollDetail'
import MyProfile from './pages/MyProfile'
import MyPayrolls from './pages/MyPayrolls'
import SystemSettings from './pages/SystemSettings'
import { loadTokenFromStorage } from './store/slices/authSlice'
import type { AppDispatch } from './store/store'

const { Content } = Layout

function App() {
  const dispatch = useDispatch<AppDispatch>()

  // Uygulama başlatılırken localStorage'dan token'ı yükle
  useEffect(() => {
    dispatch(loadTokenFromStorage())
  }, [dispatch])

  return (
    <div className="app-layout">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />
        
        {/* Protected routes - Layout içinde */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout>
              <Content>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Admin-only routes */}
                  <Route path="/employees" element={
                    <ProtectedRoute requiredRole="admin">
                      <Employees />
                    </ProtectedRoute>
                  } />
                  <Route path="/payrolls" element={
                    <ProtectedRoute requiredRole="admin">
                      <Payrolls />
                    </ProtectedRoute>
                  } />
                  <Route path="/payrolls/:id" element={
                    <ProtectedRoute requiredRole="admin">
                      <PayrollDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/registration-requests" element={
                    <ProtectedRoute requiredRole="admin">
                      <RegistrationRequests />
                    </ProtectedRoute>
                  } />
                  <Route path="/system-settings" element={
                    <ProtectedRoute requiredRole="admin">
                      <SystemSettings />
                    </ProtectedRoute>
                  } />
                  
                  {/* Employee routes */}
                  <Route path="/my-profile" element={
                    <ProtectedRoute requiredRole="employee">
                      <MyProfile />
                    </ProtectedRoute>
                  } />
                  <Route path="/my-payrolls" element={
                    <ProtectedRoute requiredRole="employee">
                      <MyPayrolls />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Content>
            </AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App 