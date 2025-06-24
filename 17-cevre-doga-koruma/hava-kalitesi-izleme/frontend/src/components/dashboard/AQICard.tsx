import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { AQICategory } from '../../types';
import { getAQIColor, getAQILabel, getAQIDescription } from '../../utils/aqi';

interface AQICardProps {
  aqi: number;
  category: AQICategory;
  stationName?: string;
  lastUpdated?: Date;
}

const AQICard: React.FC<AQICardProps> = ({ aqi, category, stationName, lastUpdated }) => {
  const color = getAQIColor(aqi);
  const label = getAQILabel(category);
  const description = getAQIDescription(category);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            {stationName && (
              <Typography variant="overline" color="text.secondary" gutterBottom>
                {stationName}
              </Typography>
            )}
            <Typography variant="h3" sx={{ color, fontWeight: 'bold' }}>
              {aqi}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              AQI
            </Typography>
          </Box>
          <Chip
            label={label}
            sx={{
              backgroundColor: color,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {description}
        </Typography>
        
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary">
            Son güncelleme: {new Date(lastUpdated).toLocaleString('tr-TR')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default AQICard;