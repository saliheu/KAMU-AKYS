import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Description,
  Assignment,
  Share,
  Assessment,
  AdminPanelSettings,
  AccountCircle,
  Notifications,
  Logout,
  ExpandLess,
  ExpandMore,
  Gavel,
  FileCopy,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { systemNotifications } = useSelector((state: RootState) => state.notifications);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const unreadNotifications = systemNotifications.filter(n => !n.read).length;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Documents', icon: <Description />, path: '/documents' },
    { text: 'Templates', icon: <FileCopy />, path: '/templates' },
    { text: 'Workflows', icon: <Assignment />, path: '/workflows' },
    { text: 'Shares', icon: <Share />, path: '/shares' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
  ];

  const adminMenuItems = [
    { text: 'Users', path: '/admin/users' },
    { text: 'Settings', path: '/admin/settings' },
    { text: 'System Stats', path: '/admin/stats' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Legal DMS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {user?.role === 'admin' && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setAdminOpen(!adminOpen)}>
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText primary="Admin" />
                {adminOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {adminMenuItems.map((item) => (
                  <ListItemButton
                    key={item.text}
                    sx={{ pl: 4 }}
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Legal Document Management'}
          </Typography>

          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={unreadNotifications} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 350,
          },
        }}
      >
        {systemNotifications.length === 0 ? (
          <MenuItem>No notifications</MenuItem>
        ) : (
          systemNotifications.slice(0, 10).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => {
                handleNotificationMenuClose();
                // Handle notification click
              }}
            >
              <Box>
                <Typography variant="subtitle2">{notification.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
};

export default Layout;