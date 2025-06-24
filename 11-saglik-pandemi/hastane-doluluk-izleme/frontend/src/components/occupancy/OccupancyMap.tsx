import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { OccupancyData } from '../../types';

interface OccupancyMapProps {
  data: OccupancyData[];
  loading: boolean;
}

const OccupancyMap: React.FC<OccupancyMapProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'action.hover',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" color="text.secondary">
        Harita görünümü yakında eklenecek...
      </Typography>
    </Box>
  );
};

export default OccupancyMap;