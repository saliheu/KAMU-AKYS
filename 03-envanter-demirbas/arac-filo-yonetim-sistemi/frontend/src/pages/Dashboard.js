import React from 'react';
import { useQuery } from 'react-query';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  DirectionsCar,
  Person,
  Build,
  LocalGasStation,
  AttachMoney,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery('dashboardStats', async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  });

  const { data: costData } = useQuery('monthlyCoststats', async () => {
    const response = await api.get('/reports/cost-analysis');
    return response.data;
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const chartData = costData?.months?.slice(-6).map(month => ({
    ay: month.month.substring(0, 3),
    yakit: month.fuel_cost,
    bakim: month.maintenance_cost,
  })) || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Araç"
            value={stats?.total_vehicles || 0}
            icon={<DirectionsCar fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aktif Araç"
            value={stats?.active_vehicles || 0}
            icon={<DirectionsCar fontSize="large" />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bakımda"
            value={stats?.maintenance_vehicles || 0}
            icon={<Build fontSize="large" />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Toplam Sürücü"
            value={stats?.total_drivers || 0}
            icon={<Person fontSize="large" />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Aylık Maliyetler
            </Typography>
            <Box display="flex" justifyContent="space-around" mb={2}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Aylık Yakıt
                </Typography>
                <Typography variant="h6">
                  ₺{stats?.monthly_fuel_cost?.toFixed(2) || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Aylık Bakım
                </Typography>
                <Typography variant="h6">
                  ₺{stats?.monthly_maintenance_cost?.toFixed(2) || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Toplam
                </Typography>
                <Typography variant="h6" color="primary">
                  ₺{stats?.total_monthly_cost?.toFixed(2) || 0}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Yaklaşan Bakımlar
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" height={100}>
              <Build sx={{ mr: 2, color: '#ff9800' }} />
              <Typography variant="h3">
                {stats?.upcoming_maintenance || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                sonraki 30 gün
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Maliyet Trendi (Son 6 Ay)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ay" />
                <YAxis />
                <Tooltip formatter={(value) => `₺${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="yakit" fill="#8884d8" name="Yakıt" />
                <Bar dataKey="bakim" fill="#82ca9d" name="Bakım" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}