import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  Add,
  People,
  Business,
  BarChart,
  Settings,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  variant: "permanent" | "persistent" | "temporary";
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, variant, onClose }) => {
  const location = useLocation();
  const { isCitizen, isOfficer, isAdmin } = useAuth();

  const drawerWidth = 240;

  const citizenMenuItems = [
    { text: 'Yeni Şikayet', icon: <Add />, path: '/complaints/new' },
    { text: 'Şikayetlerim', icon: <Assignment />, path: '/my-complaints' },
  ];

  const officerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Şikayetler', icon: <Assignment />, path: '/complaints' },
    { text: 'Raporlar', icon: <BarChart />, path: '/reports' },
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Şikayetler', icon: <Assignment />, path: '/complaints' },
    { text: 'Kullanıcılar', icon: <People />, path: '/users' },
    { text: 'Departmanlar', icon: <Business />, path: '/departments' },
    { text: 'Raporlar', icon: <BarChart />, path: '/reports' },
    { text: 'Ayarlar', icon: <Settings />, path: '/settings' },
  ];

  let menuItems: typeof citizenMenuItems = [];
  
  if (isCitizen) {
    menuItems = citizenMenuItems;
  } else if (isOfficer) {
    menuItems = officerMenuItems;
  } else if (isAdmin) {
    menuItems = adminMenuItems;
  }

  const drawer = (
    <Box>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={onClose}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;