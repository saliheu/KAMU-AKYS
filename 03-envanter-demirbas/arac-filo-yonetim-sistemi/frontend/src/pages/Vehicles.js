import React, { useState } from 'react';
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

const statusColors = {
  active: 'success',
  maintenance: 'warning',
  out_of_service: 'error',
  sold: 'default',
};

const statusLabels = {
  active: 'Aktif',
  maintenance: 'Bakımda',
  out_of_service: 'Servis Dışı',
  sold: 'Satıldı',
};

export default function Vehicles() {
  const { data: vehicles, isLoading } = useQuery('vehicles', async () => {
    const response = await api.get('/vehicles');
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
        <Typography variant="h4">Araçlar</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Yeni Araç Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plaka</TableCell>
              <TableCell>Marka/Model</TableCell>
              <TableCell>Yıl</TableCell>
              <TableCell>Tip</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Güncel KM</TableCell>
              <TableCell>Departman</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles?.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>{vehicle.plate_number}</TableCell>
                <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>{vehicle.vehicle_type}</TableCell>
                <TableCell>
                  <Chip
                    label={statusLabels[vehicle.status]}
                    color={statusColors[vehicle.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{vehicle.current_km?.toLocaleString() || '-'}</TableCell>
                <TableCell>{vehicle.department || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}