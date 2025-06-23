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
  CircularProgress,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import api from '../services/api';

export default function Maintenance() {
  const { data: records, isLoading } = useQuery('maintenance', async () => {
    const response = await api.get('/maintenance');
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
        <Typography variant="h4">Bakım Kayıtları</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Yeni Bakım Kaydı
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Araç</TableCell>
              <TableCell>Bakım Tipi</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Servis</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Maliyet</TableCell>
              <TableCell>KM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.vehicle_id}</TableCell>
                <TableCell>{record.maintenance_type}</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell>{record.service_provider || '-'}</TableCell>
                <TableCell>{new Date(record.service_date).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell>₺{record.cost?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>{record.km_at_service?.toLocaleString() || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}