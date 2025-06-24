import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  Gavel,
  CalendarMonth,
  People,
  Description,
  Assignment,
  Assessment,
  Settings,
} from '@mui/icons-material';

const menuItems = [
  { title: 'Dashboard', icon: Dashboard, path: '/dashboard' },
  { title: 'Davalar', icon: Gavel, path: '/cases' },
  { title: 'Takvim', icon: CalendarMonth, path: '/calendar' },
  { title: 'Müvekkiller', icon: People, path: '/clients' },
  { title: 'Belgeler', icon: Description, path: '/documents' },
  { title: 'Görevler', icon: Assignment, path: '/tasks' },
  { title: 'Raporlar', icon: Assessment, path: '/reports' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} color="primary">
          Dava Takip
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  mx: 1,
                  borderRadius: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/settings')}
            sx={{
              mx: 1,
              borderRadius: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Ayarlar" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;