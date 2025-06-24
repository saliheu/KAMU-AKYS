import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Alert } from '../../types';
import { useNavigate } from 'react-router-dom';

interface AlertsListProps {
  alerts: Alert[];
}

const AlertsList: React.FC<AlertsListProps> = ({ alerts }) => {
  const navigate = useNavigate();

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon color="error" />;
      case 'medium':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getSeverityLabel = (severity: Alert['severity']) => {
    const labels = {
      critical: 'Kritik',
      high: 'Yüksek',
      medium: 'Orta',
      low: 'Düşük',
    };
    return labels[severity];
  };

  if (alerts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Aktif uyarı bulunmuyor
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {alerts.map((alert) => (
        <ListItem
          key={alert.id}
          button
          onClick={() => navigate('/alerts')}
          sx={{
            borderRadius: 1,
            mb: 1,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemIcon>{getSeverityIcon(alert.severity)}</ListItemIcon>
          <ListItemText
            primary={alert.message}
            secondary={
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Typography variant="caption">
                  {format(new Date(alert.triggeredAt), 'dd MMM HH:mm', {
                    locale: tr,
                  })}
                </Typography>
                <Chip
                  label={getSeverityLabel(alert.severity)}
                  size="small"
                  color={
                    alert.severity === 'critical' || alert.severity === 'high'
                      ? 'error'
                      : alert.severity === 'medium'
                      ? 'warning'
                      : 'default'
                  }
                />
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default AlertsList;