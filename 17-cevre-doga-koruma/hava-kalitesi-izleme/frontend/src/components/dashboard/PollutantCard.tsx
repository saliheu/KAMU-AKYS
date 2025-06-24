import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Tooltip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { formatPollutantName, getPollutantUnit } from '../../utils/aqi';

interface PollutantCardProps {
  pollutant: string;
  value: number;
  unit?: string;
  maxValue?: number;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

const PollutantCard: React.FC<PollutantCardProps> = ({
  pollutant,
  value,
  unit,
  maxValue = 100,
  trend,
  changePercent,
}) => {
  const displayUnit = unit || getPollutantUnit(pollutant);
  const displayName = formatPollutantName(pollutant);
  const percentage = (value / maxValue) * 100;

  const getTrendIcon = () => {
    if (!trend) return null;
    
    const icons = {
      up: <TrendingUp sx={{ color: 'error.main' }} />,
      down: <TrendingDown sx={{ color: 'success.main' }} />,
      stable: <TrendingFlat sx={{ color: 'info.main' }} />,
    };
    
    return icons[trend];
  };

  const getProgressColor = () => {
    if (percentage <= 33) return 'success';
    if (percentage <= 66) return 'warning';
    return 'error';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            {displayName}
          </Typography>
          {getTrendIcon()}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {value.toFixed(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {displayUnit}
          </Typography>
        </Box>
        
        {changePercent !== undefined && (
          <Typography variant="body2" color={trend === 'up' ? 'error.main' : 'success.main'} sx={{ mb: 2 }}>
            {trend === 'up' ? '+' : ''}{changePercent.toFixed(1)}% son 24 saat
          </Typography>
        )}
        
        <Tooltip title={`${percentage.toFixed(0)}% of limit`}>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentage, 100)}
            color={getProgressColor()}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Tooltip>
      </CardContent>
    </Card>
  );
};

export default PollutantCard;