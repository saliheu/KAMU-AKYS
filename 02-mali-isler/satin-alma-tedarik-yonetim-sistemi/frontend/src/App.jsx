import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PurchaseRequests from './pages/PurchaseRequests'
import Suppliers from './pages/Suppliers'
import Tenders from './pages/Tenders'
import Contracts from './pages/Contracts'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
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
          <Route path="purchase-requests" element={<PurchaseRequests />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="tenders" element={<Tenders />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App