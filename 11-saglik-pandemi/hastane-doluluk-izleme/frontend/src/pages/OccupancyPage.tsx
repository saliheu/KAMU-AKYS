import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  GridView as GridViewIcon,
  TableRows as TableIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchCurrentOccupancy } from '../store/slices/occupancySlice';
import HospitalOccupancyGrid from '../components/dashboard/HospitalOccupancyGrid';
import OccupancyMap from '../components/occupancy/OccupancyMap';
import OccupancyCards from '../components/occupancy/OccupancyCards';

type ViewMode = 'grid' | 'table' | 'map';

const OccupancyPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentOccupancy, loading, lastUpdated } = useAppSelector(
    (state) => state.occupancy
  );

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setFilters] = useState({
    region: '',
    city: '',
    critical: false,
  });

  useEffect(() => {
    dispatch(fetchCurrentOccupancy(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const regions = [...new Set(currentOccupancy.map((d) => d.hospital.region))].sort();
  const cities = [...new Set(currentOccupancy.map((d) => d.hospital.city))].sort();

  const calculateRegionalStats = () => {
    const stats = new Map<string, { total: number; occupied: number; available: number }>();

    currentOccupancy.forEach((item) => {
      const region = item.hospital.region;
      const current = stats.get(region) || { total: 0, occupied: 0, available: 0 };
      
      stats.set(region, {
        total: current.total + item.occupancy.totalBeds,
        occupied: current.occupied + item.occupancy.occupiedBeds,
        available: current.available + item.occupancy.availableBeds,
      });
    });

    return Array.from(stats.entries()).map(([region, data]) => ({
      region,
      ...data,
      occupancyRate: data.total > 0 ? (data.occupied / data.total) * 100 : 0,
    }));
  };

  const regionalStats = calculateRegionalStats();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Doluluk Durumu</Typography>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary">
              Son güncelleme: {new Date(lastUpdated).toLocaleString('tr-TR')}
            </Typography>
          )}
        </Box>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="görünüm modu"
        >
          <ToggleButton value="grid" aria-label="kart görünümü">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="table" aria-label="tablo görünümü">
            <TableIcon />
          </ToggleButton>
          <ToggleButton value="map" aria-label="harita görünümü">
            <MapIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filtreler */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Bölge"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              {regions.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Şehir"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Kritik Bölümler"
              value={filters.critical ? 'true' : 'false'}
              onChange={(e) => handleFilterChange('critical', e.target.value === 'true')}
            >
              <MenuItem value="false">Tümü</MenuItem>
              <MenuItem value="true">Sadece Kritik</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilters({ region: '', city: '', critical: false })}
            >
              Filtreleri Temizle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bölgesel İstatistikler */}
      <Grid container spacing={3} mb={3}>
        {regionalStats.slice(0, 4).map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.region}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {stat.region}
                </Typography>
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Doluluk
                    </Typography>
                    <Typography variant="body2">
                      %{stat.occupancyRate.toFixed(1)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stat.occupancyRate}
                    color={
                      stat.occupancyRate >= 90
                        ? 'error'
                        : stat.occupancyRate >= 75
                        ? 'warning'
                        : 'success'
                    }
                  />
                </Box>
                <Box display="flex" gap={1}>
                  <Chip
                    label={`${stat.occupied}/${stat.total} dolu`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${stat.available} boş`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Ana İçerik */}
      <Paper sx={{ p: 3 }}>
        {viewMode === 'table' && (
          <HospitalOccupancyGrid data={currentOccupancy} loading={loading} />
        )}
        {viewMode === 'grid' && (
          <OccupancyCards data={currentOccupancy} loading={loading} />
        )}
        {viewMode === 'map' && (
          <OccupancyMap data={currentOccupancy} loading={loading} />
        )}
      </Paper>
    </Box>
  );
};

export default OccupancyPage;