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

export default function Fuel() {
  const { data: records, isLoading } = useQuery('fuel', async () => {
    const response = await api.get('/fuel');
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
        <Typography variant="h4">Yakıt Kayıtları</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Yeni Yakıt Kaydı
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Araç</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Yakıt Tipi</TableCell>
              <TableCell>Litre</TableCell>
              <TableCell>Birim Fiyat</TableCell>
              <TableCell>Toplam</TableCell>
              <TableCell>KM</TableCell>
              <TableCell>İstasyon</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.vehicle_id}</TableCell>
                <TableCell>{new Date(record.fuel_date).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell>{record.fuel_type}</TableCell>
                <TableCell>{record.liters}</TableCell>
                <TableCell>₺{record.price_per_liter?.toFixed(2)}</TableCell>
                <TableCell>₺{record.total_cost?.toFixed(2)}</TableCell>
                <TableCell>{record.km_at_fueling?.toLocaleString()}</TableCell>
                <TableCell>{record.station_name || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}