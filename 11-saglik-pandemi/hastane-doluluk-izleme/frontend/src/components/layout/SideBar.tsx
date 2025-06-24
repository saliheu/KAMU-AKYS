import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocalHospital as HospitalIcon,
  BedOutlined as BedIcon,
  NotificationsActive as AlertIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../hooks/redux';

const menuItems = [
  {
    title: 'Panel',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    title: 'Hastaneler',
    path: '/hospitals',
    icon: <HospitalIcon />,
  },
  {
    title: 'Doluluk Durumu',
    path: '/occupancy',
    icon: <BedIcon />,
  },
  {
    title: 'Uyarılar',
    path: '/alerts',
    icon: <AlertIcon />,
  },
  {
    title: 'Raporlar',
    path: '/reports',
    icon: <ReportIcon />,
  },
];

const SideBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const { user } = useAppSelector((state) => state.auth);

  const drawerWidth = sidebarOpen ? 240 : 64;

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const canAccessSettings = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1976d2',
          color: 'white',
          transition: 'width 225ms cubic-bezier(0, 0, 0.2, 1)',
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{ p: sidebarOpen ? 2 : 1, textAlign: 'center', height: 64 }}>
        {sidebarOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <HospitalIcon sx={{ mr: 1, fontSize: 32 }} />
            <Box textAlign="left">
              <Box sx={{ fontSize: 18, fontWeight: 'bold', lineHeight: 1 }}>Hastane</Box>
              <Box sx={{ fontSize: 14, opacity: 0.8 }}>Doluluk İzleme</Box>
            </Box>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={isActive(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: sidebarOpen ? 'initial' : 'center',
                px: 2.5,
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarOpen ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                sx={{
                  opacity: sidebarOpen ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontSize: '0.95rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {canAccessSettings && (
        <>
          <Box sx={{ flexGrow: 1 }} />
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
          <List>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => navigate('/settings')}
                selected={isActive('/settings')}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: 2.5,
                  mx: 1,
                  borderRadius: 2,
                  mb: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen ? 3 : 'auto',
                    justifyContent: 'center',
                    color: 'inherit',
                  }}
                >
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Ayarlar"
                  sx={{
                    opacity: sidebarOpen ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Drawer>
  );
};

export default SideBar;