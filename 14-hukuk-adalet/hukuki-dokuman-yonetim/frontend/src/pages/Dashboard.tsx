import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Description,
  Assignment,
  Share,
  TrendingUp,
  Storage,
  Folder,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import adminService from '../services/adminService';
import { DashboardStats } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await adminService.getDashboardData();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return <Typography>Error loading dashboard data</Typography>;
  }

  const statusChartData = {
    labels: stats.documentsByStatus.map(item => item.status),
    datasets: [
      {
        label: 'Documents by Status',
        data: stats.documentsByStatus.map(item => item.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  const categoryChartData = {
    labels: stats.documentsByCategory.map(item => item.category),
    datasets: [
      {
        label: 'Documents by Category',
        data: stats.documentsByCategory.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const statCards = [
    {
      title: 'Total Documents',
      value: stats.overview.totalDocuments,
      icon: <Description />,
      color: '#1976d2',
    },
    {
      title: 'My Documents',
      value: stats.overview.myDocuments,
      icon: <Folder />,
      color: '#388e3c',
    },
    {
      title: 'Shared with Me',
      value: stats.overview.sharedWithMe,
      icon: <Share />,
      color: '#f57c00',
    },
    {
      title: 'Active Workflows',
      value: stats.workflows.active,
      icon: <Assignment />,
      color: '#7b1fa2',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stat Cards */}
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Documents by Status
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut data={statusChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Documents by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={categoryChartData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Storage Usage
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Storage />
                </ListItemIcon>
                <ListItemText
                  primary="Total Storage"
                  secondary={`${(stats.storage.totalSize / 1024 / 1024).toFixed(2)} MB`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Description />
                </ListItemIcon>
                <ListItemText
                  primary="Average Document Size"
                  secondary={`${(stats.storage.averageSize / 1024).toFixed(2)} KB`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Version Control
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp />
                </ListItemIcon>
                <ListItemText
                  primary="Total Versions"
                  secondary={stats.versions.total}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Description />
                </ListItemIcon>
                <ListItemText
                  primary="Avg Versions per Document"
                  secondary={stats.versions.averagePerDocument.toFixed(1)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Workflow Status
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText
                  primary="Active Workflows"
                  secondary={stats.workflows.active}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Warning />
                </ListItemIcon>
                <ListItemText
                  primary="My Pending Tasks"
                  secondary={stats.workflows.myPending}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <CheckCircle color="success" />
              <Typography variant="body2">
                {stats.overview.recentDocuments} documents created in the last 30 days
              </Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {stats.documentsByStatus.map((status) => (
                <Chip
                  key={status.status}
                  label={`${status.status}: ${status.count}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;