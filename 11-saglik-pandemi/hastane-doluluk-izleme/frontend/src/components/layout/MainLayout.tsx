import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import TopBar from './TopBar';
import SideBar from './SideBar';
import { useAppSelector } from '../../hooks/redux';

const MainLayout: React.FC = () => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SideBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: sidebarOpen ? '240px' : '64px',
          transition: 'margin-left 225ms cubic-bezier(0, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopBar />
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;