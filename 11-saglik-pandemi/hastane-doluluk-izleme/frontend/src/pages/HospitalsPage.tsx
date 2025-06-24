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
  CardActions,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchHospitals } from '../store/slices/hospitalSlice';

const HospitalsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hospitals, loading } = useAppSelector((state) => state.hospitals);
  const { user } = useAppSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    city: '',
    region: '',
    type: '',
  });

  useEffect(() => {
    dispatch(fetchHospitals(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const getHospitalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      state: 'Devlet',
      university: 'Üniversite',
      private: 'Özel',
      city: 'Şehir',
    };
    return labels[type] || type;
  };

  const canManageHospitals = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Hastaneler</Typography>
        {canManageHospitals && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/hospitals/new')}
          >
            Yeni Hastane
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Şehir"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Şehir ara..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Bölge"
              value={filters.region}
              onChange={(e) => handleFilterChange('region', e.target.value)}
              placeholder="Bölge ara..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Tip"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="state">Devlet</MenuItem>
              <MenuItem value="university">Üniversite</MenuItem>
              <MenuItem value="private">Özel</MenuItem>
              <MenuItem value="city">Şehir</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilters({ city: '', region: '', type: '' })}
            >
              Filtreleri Temizle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box textAlign="center" py={4}>
          <Typography>Yükleniyor...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {hospitals.map((hospital) => (
            <Grid item xs={12} sm={6} md={4} key={hospital.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" component="h2">
                      {hospital.name}
                    </Typography>
                    <Chip
                      label={getHospitalTypeLabel(hospital.type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {hospital.city}, {hospital.region}
                    </Typography>
                  </Box>

                  {hospital.departments && (
                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {hospital.departments.length} bölüm
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {hospital.departments.slice(0, 3).map((dept) => (
                          <Chip
                            key={dept.id}
                            label={dept.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {hospital.departments.length > 3 && (
                          <Chip
                            label={`+${hospital.departments.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/hospitals/${hospital.id}`)}
                    title="Detayları Görüntüle"
                  >
                    <ViewIcon />
                  </IconButton>
                  {canManageHospitals && (
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/hospitals/${hospital.id}/edit`)}
                      title="Düzenle"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {hospitals.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            Hastane bulunamadı
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HospitalsPage;