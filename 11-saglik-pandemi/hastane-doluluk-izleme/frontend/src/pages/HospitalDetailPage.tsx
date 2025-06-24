import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchHospitalById,
  fetchHospitalStats,
} from '../store/slices/hospitalSlice';
import DepartmentOccupancyList from '../components/hospitals/DepartmentOccupancyList';

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

const HospitalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedHospital, loading } = useAppSelector((state) => state.hospitals);
  const { user } = useAppSelector((state) => state.auth);
  const [tabValue, setTabValue] = React.useState(0);
  const [stats, setStats] = React.useState<any>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchHospitalById(id));
      dispatch(fetchHospitalStats(id)).then((result: any) => {
        if (result.payload) {
          setStats(result.payload);
        }
      });
    }
  }, [dispatch, id]);

  if (loading || !selectedHospital) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const getHospitalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      state: 'Devlet Hastanesi',
      university: 'Üniversite Hastanesi',
      private: 'Özel Hastane',
      city: 'Şehir Hastanesi',
    };
    return labels[type] || type;
  };

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin' ||
    (user?.role === 'hospital_admin' && user.hospitalId === selectedHospital.id);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/hospitals')}
          >
            Geri
          </Button>
          <Typography variant="h4">{selectedHospital.name}</Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/hospitals/${id}/edit`)}
          >
            Düzenle
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Hastane Bilgileri */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hastane Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Chip
                  label={getHospitalTypeLabel(selectedHospital.type)}
                  color="primary"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Adres
                    </Typography>
                    <Typography>
                      {selectedHospital.address}
                    </Typography>
                    <Typography variant="body2">
                      {selectedHospital.district && `${selectedHospital.district}, `}
                      {selectedHospital.city} / {selectedHospital.region}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <PhoneIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Telefon
                      </Typography>
                      <Typography>{selectedHospital.phone}</Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EmailIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        E-posta
                      </Typography>
                      <Typography>{selectedHospital.email}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* İstatistikler */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Genel İstatistikler
              </Typography>
              {stats ? (
                <>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Yatak
                    </Typography>
                    <Typography variant="h4">{stats.totalBeds}</Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Dolu Yatak
                    </Typography>
                    <Typography variant="h4">{stats.occupiedBeds}</Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Doluluk Oranı
                    </Typography>
                    <Typography variant="h4">%{stats.occupancyRate}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(stats.occupancyRate)}
                      color={
                        parseFloat(stats.occupancyRate) >= 90
                          ? 'error'
                          : parseFloat(stats.occupancyRate) >= 75
                          ? 'warning'
                          : 'success'
                      }
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </>
              ) : (
                <CircularProgress size={24} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Bölümler ve Doluluk */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
              <Tab label="Bölüm Dolulukları" />
              <Tab label="Geçmiş Veriler" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              <DepartmentOccupancyList
                hospitalId={selectedHospital.id}
                departments={stats?.departmentStats || []}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography color="text.secondary">
                Geçmiş veriler yakında eklenecek...
              </Typography>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HospitalDetailPage;