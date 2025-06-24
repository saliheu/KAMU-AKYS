import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { RootState, AppDispatch } from '../store';
import { login, clearError } from '../store/slices/authSlice';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [showRegister, setShowRegister] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data: LoginForm) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            Legal Document Management System
          </Typography>
          <Typography component="h2" variant="h6" align="center" sx={{ mt: 2 }}>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Box textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={() => setShowRegister(!showRegister)}
                type="button"
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>

          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Default Admin Credentials:
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Email: admin@legal.gov.tr
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Password: Admin123!
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;