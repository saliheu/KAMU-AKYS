import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Chip, LinearProgress, Box } from '@mui/material';
import { OccupancyData } from '../../types';

interface HospitalOccupancyGridProps {
  data: OccupancyData[];
  loading: boolean;
}

const HospitalOccupancyGrid: React.FC<HospitalOccupancyGridProps> = ({
  data,
  loading,
}) => {
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'error';
    if (rate >= 75) return 'warning';
    return 'success';
  };

  const getDepartmentCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      emergency: 'Acil',
      intensive_care: 'Yoğun Bakım',
      surgery: 'Cerrahi',
      internal: 'Dahiliye',
      pediatric: 'Pediatri',
      maternity: 'Doğum',
      other: 'Diğer',
    };
    return labels[category] || category;
  };

  const columns: GridColDef[] = [
    {
      field: 'hospitalName',
      headerName: 'Hastane',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.row.hospital.name,
    },
    {
      field: 'city',
      headerName: 'Şehir',
      width: 120,
      valueGetter: (params) => params.row.hospital.city,
    },
    {
      field: 'departmentName',
      headerName: 'Bölüm',
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => params.row.department.name,
    },
    {
      field: 'departmentCategory',
      headerName: 'Kategori',
      width: 120,
      valueGetter: (params) => params.row.department.category,
      renderCell: (params) => (
        <Chip
          label={getDepartmentCategoryLabel(params.value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'totalBeds',
      headerName: 'Toplam Yatak',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.row.occupancy.totalBeds,
    },
    {
      field: 'occupiedBeds',
      headerName: 'Dolu Yatak',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.row.occupancy.occupiedBeds,
    },
    {
      field: 'availableBeds',
      headerName: 'Boş Yatak',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.row.occupancy.availableBeds,
    },
    {
      field: 'occupancyRate',
      headerName: 'Doluluk Oranı',
      width: 150,
      valueGetter: (params) => params.row.occupancy.occupancyRate,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <span>%{params.value.toFixed(1)}</span>
          </Box>
          <LinearProgress
            variant="determinate"
            value={params.value}
            color={getOccupancyColor(params.value)}
            sx={{ mt: 0.5 }}
          />
        </Box>
      ),
    },
  ];

  const rows = data.map((item, index) => ({
    id: index,
    ...item,
  }));

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      pageSize={10}
      rowsPerPageOptions={[10, 25, 50]}
      autoHeight
      disableSelectionOnClick
      sx={{
        '& .MuiDataGrid-cell': {
          borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
        },
      }}
    />
  );
};

export default HospitalOccupancyGrid;