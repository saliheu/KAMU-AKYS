import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material';
import { OccupancyData } from '../../types';

interface OccupancyCardsProps {
  data: OccupancyData[];
  loading: boolean;
}

const OccupancyCards: React.FC<OccupancyCardsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'error';
    if (rate >= 75) return 'warning';
    return 'success';
  };

  const getDepartmentCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      emergency: 'Acil',
      intensive_care: 'Yoğun Bakım',
      surgery: 'Cerrahi',
      internal: 'Dahiliye',
      pediatric: 'Pediatri',
      maternity: 'Doğum',
      other: 'Diğer',
    };
    return labels[category] || category;
  };

  return (
    <Grid container spacing={3}>
      {data.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card
            sx={{
              height: '100%',
              borderLeft: 4,
              borderColor: `${getOccupancyColor(item.occupancy.occupancyRate)}.main`,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {item.hospital.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {item.hospital.city} - {item.department.name}
              </Typography>

              <Chip
                label={getDepartmentCategoryLabel(item.department.category)}
                size="small"
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Doluluk Oranı</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    %{item.occupancy.occupancyRate.toFixed(1)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.occupancy.occupancyRate}
                  color={getOccupancyColor(item.occupancy.occupancyRate)}
                />
              </Box>

              <Box display="flex" justifyContent="space-between">
                <Box textAlign="center">
                  <Typography variant="h6" color="text.secondary">
                    {item.occupancy.totalBeds}
                  </Typography>
                  <Typography variant="caption">Toplam</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" color="error.main">
                    {item.occupancy.occupiedBeds}
                  </Typography>
                  <Typography variant="caption">Dolu</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" color="success.main">
                    {item.occupancy.availableBeds}
                  </Typography>
                  <Typography variant="caption">Boş</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default OccupancyCards;