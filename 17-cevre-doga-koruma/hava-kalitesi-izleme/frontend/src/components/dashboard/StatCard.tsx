import React from 'react';
import { Card, CardContent, Typography, Box, SvgIconTypeMap } from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    label: string;
  };
  icon?: OverridableComponent<SvgIconTypeMap>;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  color = 'primary',
}) => {
  const isPositiveChange = change && change.value > 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: isPositiveChange ? 'success.main' : 'error.main',
                    fontWeight: 'medium',
                  }}
                >
                  {isPositiveChange ? '+' : ''}{change.value}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {change.label}
                </Typography>
              </Box>
            )}
          </Box>
          {Icon && (
            <Box
              sx={{
                backgroundColor: `${color}.light`,
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ color: `${color}.main`, fontSize: 32 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;