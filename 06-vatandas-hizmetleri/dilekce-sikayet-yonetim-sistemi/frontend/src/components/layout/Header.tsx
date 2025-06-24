import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Dashboard,
  Assignment,
} from '@mui/icons-material';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout, isCitizen, isOfficer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    handleClose();
  };

  const handleMyComplaints = () => {
    navigate('/my-complaints');
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {onMenuToggle && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Dilekçe Şikayet Yönetim Sistemi
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Hoş geldiniz, {user.username}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {(isOfficer || isAdmin) && (
                <MenuItem onClick={handleDashboard}>
                  <Dashboard sx={{ mr: 1 }} /> Dashboard
                </MenuItem>
              )}
              {isCitizen && (
                <MenuItem onClick={handleMyComplaints}>
                  <Assignment sx={{ mr: 1 }} /> Şikayetlerim
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Çıkış Yap
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Giriş Yap
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Kayıt Ol
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};