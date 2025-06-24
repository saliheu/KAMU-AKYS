import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleDarkMode } from '@/store/slices/uiSlice';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Search as SearchIcon,
} from '@mui/icons-material';

const PublicHeader = () => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}
        >
          Dijital Kütüphane
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/books">
            Kitaplar
          </Button>
          <Button color="inherit" component={RouterLink} to="/search">
            <SearchIcon sx={{ mr: 1 }} />
            Ara
          </Button>
          
          <IconButton color="inherit" onClick={() => dispatch(toggleDarkMode())}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {isAuthenticated ? (
            <Button
              color="inherit"
              component={RouterLink}
              to="/dashboard"
              variant="outlined"
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/auth/login">
                Giriş
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/auth/register"
                variant="outlined"
              >
                Üye Ol
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default PublicHeader;