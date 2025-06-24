import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WasteEntries from './pages/WasteEntries'
import WastePoints from './pages/WastePoints'
import Collections from './pages/Collections'
import Reports from './pages/Reports'
import Companies from './pages/Companies'
import Settings from './pages/Settings'
import QRScanner from './pages/QRScanner'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="waste-entries" element={<WasteEntries />} />
            <Route path="waste-points" element={<WastePoints />} />
            <Route path="collections" element={<Collections />} />
            <Route path="reports" element={<Reports />} />
            <Route path="companies" element={<Companies />} />
            <Route path="qr-scanner" element={<QRScanner />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App