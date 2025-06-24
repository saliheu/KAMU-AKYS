import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Container,
  Box,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Map as MapIcon,
  ViewList,
  ViewModule,
  Refresh,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { fetchDashboardData, fetchMapData } from '../store/slices/dashboardSlice';
import { fetchAlerts } from '../store/slices/alertSlice';
import { setSelectedView } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import AQICard from '../components/dashboard/AQICard';
import PollutantCard from '../components/dashboard/PollutantCard';
import StationMap from '../components/dashboard/StationMap';
import RealtimeChart from '../components/dashboard/RealtimeChart';
import AlertsList from '../components/dashboard/AlertsList';
import StatCard from '../components/dashboard/StatCard';
import {
  LocationOn,
  Warning,
  TrendingUp,
  Speed,
} from '@mui/icons-material';
import websocketService from '../services/websocketService';
import { getAQICategory } from '../utils/aqi';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, mapData, loading, error } = useSelector((state: RootState) => state.dashboard);
  const { alerts } = useSelector((state: RootState) => state.alerts);
  const { selectedView, autoRefresh, refreshInterval } = useSelector((state: RootState) => state.ui);
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');

  useEffect(() => {
    // Initial data fetch
    dispatch(fetchDashboardData());
    dispatch(fetchMapData());
    dispatch(fetchAlerts({ limit: 10 }));

    // Subscribe to WebSocket events
    websocketService.subscribeToAlerts();

    // Set up auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        dispatch(fetchDashboardData());
        dispatch(fetchMapData());
      }, refreshInterval * 1000);
    }

    return () => {
      websocketService.unsubscribeFromAlerts();
      if (interval) clearInterval(interval);
    };
  }, [dispatch, autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    dispatch(fetchDashboardData());
    dispatch(fetchMapData());
    dispatch(fetchAlerts({ limit: 10 }));
  };

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: 'map' | 'list' | 'grid') => {
    if (newView) {
      dispatch(setSelectedView(newView));
    }
  };

  if (loading && !data) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <ErrorMessage message={error} onRetry={handleRefresh} />
      </Container>
    );
  }

  const chartData = {
    labels: data?.recentMeasurements?.map((m) => 
      new Date(m.timestamp).toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    ) || [],
    datasets: [{
      label: 'AQI',
      data: data?.recentMeasurements?.map((m) => m.aqi) || [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }],
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Hava Kalitesi Kontrol Paneli
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={selectedView}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="map">
              <MapIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModule />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Yenile
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aktif İstasyonlar"
            value={data?.summary?.totalStations || 0}
            subtitle="Toplam istasyon sayısı"
            icon={LocationOn}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ortalama AQI"
            value={data?.summary?.averageAQI || 0}
            subtitle={getAQICategory(data?.summary?.averageAQI)}
            icon={Speed}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Aktif Uyarılar"
            value={data?.summary?.activeAlerts || 0}
            subtitle="Bekleyen uyarılar"
            icon={Warning}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Günlük Ölçümler"
            value={data?.summary?.todayMeasurements || 0}
            subtitle="Son 24 saat"
            change={data?.summary?.measurementTrend}
            icon={TrendingUp}
            color="success"
          />
        </Grid>

        {/* Main Content */}
        {selectedView === 'map' && (
          <>
            <Grid item xs={12} lg={8}>
              <StationMap stations={mapData} height={500} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <AlertsList alerts={alerts} maxHeight={500} />
            </Grid>
          </>
        )}

        {selectedView === 'grid' && (
          <>
            {/* AQI Overview */}
            <Grid item xs={12} md={6} lg={4}>
              <AQICard
                aqi={data?.summary?.averageAQI || 0}
                category={getAQICategory(data?.summary?.averageAQI)}
                lastUpdated={data?.summary?.lastUpdate}
              />
            </Grid>

            {/* Pollutant Cards */}
            {data?.pollutants?.map((pollutant) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={pollutant.name}>
                <PollutantCard
                  pollutant={pollutant.name}
                  value={pollutant.value}
                  maxValue={pollutant.limit}
                  trend={pollutant.trend}
                  changePercent={pollutant.changePercent}
                />
              </Grid>
            ))}

            {/* Real-time Chart */}
            <Grid item xs={12}>
              <RealtimeChart
                data={chartData}
                pollutant={selectedPollutant}
                onPollutantChange={setSelectedPollutant}
                height={400}
              />
            </Grid>
          </>
        )}

        {selectedView === 'list' && (
          <Grid item xs={12}>
            <AlertsList 
              alerts={alerts} 
              title="Tüm Uyarılar"
              maxHeight={600}
            />
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;