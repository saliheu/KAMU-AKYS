import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Spin } from 'antd'
import { selectIsAuthenticated, selectAuth } from '../store/slices/authSlice'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'employee'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const { user, loading } = useSelector(selectAuth)
  const location = useLocation()

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  // Kimlik doğrulaması yoksa login'e yönlendir
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Rol kontrolü varsa kontrol et
  if (requiredRole && user.role !== requiredRole) {
    // Admin sayfasına employee erişmeye çalışıyorsa dashboard'a yönlendir
    if (requiredRole === 'admin' && user.role === 'employee') {
      return <Navigate to="/dashboard" replace />
    }
    
    // Employee sayfasına admin erişmeye çalışıyorsa admin dashboard'a yönlendir
    if (requiredRole === 'employee' && user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
  }

  // Her şey yolundaysa children'ı render et
  return <>{children}</>
}

export default ProtectedRoute 