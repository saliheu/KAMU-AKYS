import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import websocketService from '../../services/websocketService';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unacknowledgedCount } = useAppSelector((state) => state.alerts);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNotificationsClick = () => {
    navigate('/alerts');
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Süper Admin',
      admin: 'Admin',
      hospital_admin: 'Hastane Yöneticisi',
      department_head: 'Bölüm Başkanı',
      viewer: 'Görüntüleyici',
    };
    return labels[role] || role;
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => dispatch(toggleSidebar())}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Hastane Doluluk İzleme Sistemi
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={websocketService.isConnected() ? 'Çevrimiçi' : 'Çevrimdışı'}
            color={websocketService.isConnected() ? 'success' : 'default'}
            size="small"
          />

          <IconButton color="inherit" onClick={handleNotificationsClick}>
            <Badge badgeContent={unacknowledgedCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            edge="end"
            color="inherit"
            onClick={handleMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1">{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Chip
              label={getRoleLabel(user?.role || '')}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
          <MenuItem onClick={() => navigate('/settings')}>Ayarlar</MenuItem>
          <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;