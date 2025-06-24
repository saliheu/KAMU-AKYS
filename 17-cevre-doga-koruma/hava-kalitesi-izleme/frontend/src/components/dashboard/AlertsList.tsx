import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Typography,
  Box,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  MoreVert,
} from '@mui/icons-material';
import { Alert } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AlertsListProps {
  alerts: Alert[];
  title?: string;
  onAlertClick?: (alert: Alert) => void;
  onActionClick?: (alert: Alert) => void;
  maxHeight?: number;
}

const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  title = 'Son Uyarılar',
  onAlertClick,
  onActionClick,
  maxHeight = 400,
}) => {
  const getSeverityIcon = (severity: string) => {
    const icons = {
      low: <Info />,
      medium: <Warning />,
      high: <Error />,
      critical: <Error />,
    };
    return icons[severity] || <Info />;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'error',
    };
    return colors[severity] || 'info';
  };

  const getStatusChip = (status: string) => {
    const config = {
      active: { label: 'Aktif', color: 'error' as const },
      acknowledged: { label: 'Onaylandı', color: 'warning' as const },
      resolved: { label: 'Çözüldü', color: 'success' as const },
    };
    
    const { label, color } = config[status] || { label: status, color: 'default' as const };
    
    return <Chip label={label} color={color} size="small" />;
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <List sx={{ maxHeight, overflow: 'auto' }}>
        {alerts.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="Uyarı bulunmamaktadır"
              secondary="Sistem normal çalışıyor"
            />
          </ListItem>
        ) : (
          alerts.map((alert) => (
            <ListItem
              key={alert.id}
              button
              onClick={() => onAlertClick?.(alert)}
              secondaryAction={
                onActionClick && (
                  <Tooltip title="İşlemler">
                    <IconButton edge="end" onClick={(e) => {
                      e.stopPropagation();
                      onActionClick(alert);
                    }}>
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                )
              }
              divider
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: `${getSeverityColor(alert.severity)}.main` }}>
                  {getSeverityIcon(alert.severity)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">{alert.title}</Typography>
                    {getStatusChip(alert.status)}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {alert.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.Station?.name} • {formatDistanceToNow(new Date(alert.createdAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

export default AlertsList;