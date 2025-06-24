import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Box,
  Typography,
  Chip,
} from '@mui/material';

interface DepartmentOccupancyListProps {
  hospitalId: string;
  departments: Array<{
    department: string;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: number;
  }>;
}

const DepartmentOccupancyList: React.FC<DepartmentOccupancyListProps> = ({
  departments,
}) => {
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'error';
    if (rate >= 75) return 'warning';
    return 'success';
  };

  const getOccupancyStatus = (rate: number) => {
    if (rate >= 90) return { label: 'Kritik', color: 'error' as const };
    if (rate >= 75) return { label: 'Yüksek', color: 'warning' as const };
    if (rate >= 50) return { label: 'Normal', color: 'info' as const };
    return { label: 'Düşük', color: 'success' as const };
  };

  if (departments.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body2" color="text.secondary">
          Bölüm bilgisi bulunmuyor
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bölüm</TableCell>
            <TableCell align="center">Toplam Yatak</TableCell>
            <TableCell align="center">Dolu Yatak</TableCell>
            <TableCell align="center">Boş Yatak</TableCell>
            <TableCell align="center">Doluluk Oranı</TableCell>
            <TableCell align="center">Durum</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {departments.map((dept, index) => {
            const status = getOccupancyStatus(dept.occupancyRate);
            return (
              <TableRow key={index}>
                <TableCell>{dept.department}</TableCell>
                <TableCell align="center">{dept.totalBeds}</TableCell>
                <TableCell align="center">{dept.occupiedBeds}</TableCell>
                <TableCell align="center">{dept.availableBeds}</TableCell>
                <TableCell align="center">
                  <Box sx={{ minWidth: 120 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">
                        %{dept.occupancyRate.toFixed(1)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={dept.occupancyRate}
                      color={getOccupancyColor(dept.occupancyRate)}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={status.label}
                    size="small"
                    color={status.color}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DepartmentOccupancyList;