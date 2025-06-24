import React, { useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  BedOutlined as BedIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCurrentOccupancy } from '../store/slices/occupancySlice';
import { fetchAlerts } from '../store/slices/alertSlice';
import OccupancyChart from '../components/dashboard/OccupancyChart';
import AlertsList from '../components/dashboard/AlertsList';
import HospitalOccupancyGrid from '../components/dashboard/HospitalOccupancyGrid';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentOccupancy, loading: occupancyLoading } = useAppSelector(
    (state) => state.occupancy
  );
  const { alerts, unacknowledgedCount } = useAppSelector((state) => state.alerts);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentOccupancy());
    dispatch(fetchAlerts({ status: 'active', limit: 10 }));
  }, [dispatch]);

  const calculateTotalStats = () => {
    const stats = {
      totalHospitals: new Set(currentOccupancy.map((o) => o.hospital.id)).size,
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      criticalDepartments: 0,
    };

    currentOccupancy.forEach((item) => {
      stats.totalBeds += item.occupancy.totalBeds;
      stats.occupiedBeds += item.occupancy.occupiedBeds;
      stats.availableBeds += item.occupancy.availableBeds;
      if (item.occupancy.occupancyRate >= 90) {
        stats.criticalDepartments++;
      }
    });

    return stats;
  };

  const stats = calculateTotalStats();
  const overallOccupancyRate = stats.totalBeds > 0
    ? (stats.occupiedBeds / stats.totalBeds) * 100
    : 0;

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'error';
    if (rate >= 75) return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hoş Geldiniz, {user?.name}
      </Typography>

      <Grid container spacing={3}>
        {/* İstatistik Kartları */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Hastane
                  </Typography>
                  <Typography variant="h4">{stats.totalHospitals}</Typography>
                </Box>
                <HospitalIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Yatak
                  </Typography>
                  <Typography variant="h4">{stats.totalBeds}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.occupiedBeds} dolu
                  </Typography>
                </Box>
                <BedIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Doluluk Oranı
                  </Typography>
                  <Typography variant="h4">
                    %{overallOccupancyRate.toFixed(1)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={overallOccupancyRate}
                    color={getOccupancyColor(overallOccupancyRate)}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <TrendingUpIcon
                  sx={{
                    fontSize: 40,
                    color: getOccupancyColor(overallOccupancyRate) + '.main',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Aktif Uyarılar
                  </Typography>
                  <Typography variant="h4">{unacknowledgedCount}</Typography>
                  <Chip
                    label={`${stats.criticalDepartments} kritik bölüm`}
                    size="small"
                    color="error"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Doluluk Grafiği */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Doluluk Oranları
            </Typography>
            <OccupancyChart data={currentOccupancy} />
          </Paper>
        </Grid>

        {/* Son Uyarılar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Son Uyarılar
            </Typography>
            <AlertsList alerts={alerts.slice(0, 5)} />
          </Paper>
        </Grid>

        {/* Hastane Doluluk Tablosu */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hastane Doluluk Durumu
            </Typography>
            <HospitalOccupancyGrid
              data={currentOccupancy}
              loading={occupancyLoading}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;