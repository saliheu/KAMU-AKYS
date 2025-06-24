import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Theme
import { getTheme } from '@/theme';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';

// Public Pages
import Home from '@/pages/Home';
import Books from '@/pages/Books';
import BookDetail from '@/pages/BookDetail';
import Search from '@/pages/Search';
import About from '@/pages/About';
import Contact from '@/pages/Contact';

// Dashboard Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import MyBooks from '@/pages/dashboard/MyBooks';
import MyReservations from '@/pages/dashboard/MyReservations';
import MyCollections from '@/pages/dashboard/MyCollections';
import MyReviews from '@/pages/dashboard/MyReviews';
import Profile from '@/pages/dashboard/Profile';
import Notifications from '@/pages/dashboard/Notifications';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminBooks from '@/pages/admin/Books';
import AdminUsers from '@/pages/admin/Users';
import AdminBorrowings from '@/pages/admin/Borrowings';
import AdminCategories from '@/pages/admin/Categories';
import AdminReports from '@/pages/admin/Reports';
import AdminSettings from '@/pages/admin/Settings';

// Components
import PrivateRoute from '@/components/PrivateRoute';
import AdminRoute from '@/components/AdminRoute';
import BookViewer from '@/components/BookViewer';
import SearchModal from '@/components/SearchModal';
import NotFound from '@/pages/NotFound';

// Services
import socketService from '@/services/socketService';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { darkMode } = useAppSelector((state) => state.ui);
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // Theme
  const theme = getTheme(darkMode);

  // Socket connection
  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: darkMode ? '#333' : '#fff',
              color: darkMode ? '#fff' : '#333',
            },
          }}
        />
        
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="verify-email/:token" element={<VerifyEmail />} />
          </Route>

          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="books" element={<Books />} />
            <Route path="books/:id" element={<BookDetail />} />
            <Route path="search" element={<Search />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* User Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="my-books" element={<MyBooks />} />
            <Route path="reservations" element={<MyReservations />} />
            <Route path="collections" element={<MyCollections />} />
            <Route path="reviews" element={<MyReviews />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <DashboardLayout isAdmin />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="borrowings" element={<AdminBorrowings />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Redirects */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global Modals */}
        <BookViewer />
        <SearchModal />

        {/* React Query Devtools */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;