import React from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import api from '../services/api';

export default function Drivers() {
  const { data: drivers, isLoading } = useQuery('drivers', async () => {
    const response = await api.get('/drivers');
    return response.data;
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sürücüler</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Yeni Sürücü Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ad Soyad</TableCell>
              <TableCell>TC No</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Ehliyet No</TableCell>
              <TableCell>Ehliyet Tipi</TableCell>
              <TableCell>Departman</TableCell>
              <TableCell>Durum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drivers?.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>{driver.first_name} {driver.last_name}</TableCell>
                <TableCell>{driver.tc_number}</TableCell>
                <TableCell>{driver.phone || '-'}</TableCell>
                <TableCell>{driver.license_number}</TableCell>
                <TableCell>{driver.license_type}</TableCell>
                <TableCell>{driver.department || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={driver.is_active ? 'Aktif' : 'Pasif'}
                    color={driver.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}