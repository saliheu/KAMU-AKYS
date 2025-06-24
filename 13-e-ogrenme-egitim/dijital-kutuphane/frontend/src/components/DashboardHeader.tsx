import { Box, Typography, IconButton, Badge, Avatar, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { openSearchModal } from '@/store/slices/uiSlice';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { toggleDarkMode } from '@/store/slices/uiSlice';

interface DashboardHeaderProps {
  isAdmin?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { darkMode } = useAppSelector((state) => state.ui);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
        {isAdmin ? 'Admin Panel' : 'Kullanıcı Paneli'}
      </Typography>

      <IconButton color="inherit" onClick={() => dispatch(openSearchModal())}>
        <SearchIcon />
      </IconButton>

      <IconButton color="inherit" onClick={() => dispatch(toggleDarkMode())}>
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>

      <IconButton
        color="inherit"
        onClick={() => navigate(isAdmin ? '/admin/notifications' : '/dashboard/notifications')}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <IconButton onClick={handleProfileMenuOpen} color="inherit">
        <Avatar sx={{ width: 32, height: 32 }}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(isAdmin ? '/admin/profile' : '/dashboard/profile');
          handleMenuClose();
        }}>
          Profil
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Çıkış Yap
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DashboardHeader;