import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  CheckCircle as AcknowledgeIcon,
  Done as ResolveIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchAlerts,
  acknowledgeAlert,
  resolveAlert,
} from '../store/slices/alertSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import { Alert } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AlertsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { alerts, loading } = useAppSelector((state) => state.alerts);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const status = tabValue === 0 ? 'active' : tabValue === 1 ? 'acknowledged' : 'resolved';
    dispatch(fetchAlerts({ status }));
  }, [dispatch, tabValue]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, alert: Alert) => {
    setAnchorEl(event.currentTarget);
    setSelectedAlert(alert);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAlert(null);
  };

  const handleAcknowledge = async () => {
    if (selectedAlert) {
      await dispatch(acknowledgeAlert(selectedAlert.id));
      dispatch(
        showSnackbar({
          message: 'Uyarı onaylandı',
          severity: 'success',
        })
      );
    }
    handleMenuClose();
  };

  const handleResolve = async () => {
    if (selectedAlert) {
      await dispatch(resolveAlert(selectedAlert.id));
      dispatch(
        showSnackbar({
          message: 'Uyarı çözümlendi',
          severity: 'success',
        })
      );
    }
    handleMenuClose();
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    const colors = {
      critical: 'error' as const,
      high: 'error' as const,
      medium: 'warning' as const,
      low: 'info' as const,
    };
    return colors[severity];
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

  const getTypeLabel = (type: Alert['type']) => {
    const labels = {
      high_occupancy: 'Yüksek Doluluk',
      critical_occupancy: 'Kritik Doluluk',
      no_beds: 'Yatak Yok',
      ventilator_shortage: 'Ventilatör Eksikliği',
      rapid_increase: 'Hızlı Artış',
    };
    return labels[type];
  };

  const columns: GridColDef[] = [
    {
      field: 'severity',
      headerName: 'Önem',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={getSeverityLabel(params.value)}
          size="small"
          color={getSeverityColor(params.value)}
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Tip',
      width: 150,
      renderCell: (params) => getTypeLabel(params.value),
    },
    {
      field: 'message',
      headerName: 'Mesaj',
      flex: 1,
      minWidth: 300,
    },
    {
      field: 'hospital',
      headerName: 'Hastane',
      width: 200,
      valueGetter: (params) => params.row.hospital?.name || '-',
    },
    {
      field: 'department',
      headerName: 'Bölüm',
      width: 150,
      valueGetter: (params) => params.row.department?.name || '-',
    },
    {
      field: 'triggeredAt',
      headerName: 'Tetiklenme Zamanı',
      width: 180,
      valueGetter: (params) =>
        format(new Date(params.value), 'dd MMM yyyy HH:mm', { locale: tr }),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row as Alert)}
        >
          <MoreIcon />
        </IconButton>
      ),
    },
  ];

  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'acknowledged');
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Uyarılar</Typography>
        <IconButton>
          <Badge badgeContent={0} color="error">
            <FilterIcon />
          </Badge>
        </IconButton>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_, value) => setTabValue(value)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                Aktif
                <Chip label={activeAlerts.length} size="small" color="error" />
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                Onaylanmış
                <Chip label={acknowledgedAlerts.length} size="small" color="warning" />
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                Çözümlenmiş
                <Chip label={resolvedAlerts.length} size="small" color="success" />
              </Box>
            }
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <DataGrid
            rows={activeAlerts}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            disableSelectionOnClick
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DataGrid
            rows={acknowledgedAlerts}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            disableSelectionOnClick
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DataGrid
            rows={resolvedAlerts}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            disableSelectionOnClick
          />
        </TabPanel>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedAlert?.status === 'active' && (
          <MenuItem onClick={handleAcknowledge}>
            <AcknowledgeIcon sx={{ mr: 1 }} fontSize="small" />
            Onayla
          </MenuItem>
        )}
        {selectedAlert?.status !== 'resolved' && (
          <MenuItem onClick={handleResolve}>
            <ResolveIcon sx={{ mr: 1 }} fontSize="small" />
            Çözümlendi Olarak İşaretle
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default AlertsPage;