import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  FilterList,
  GetApp,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import complaintService from '../../services/complaintService';
import { Complaint, ComplaintStatus, ComplaintPriority, Department, ComplaintFilters } from '../../types';

const ComplaintList: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isOfficer } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<ComplaintFilters>({
    status: undefined,
    priority: undefined,
    departmentId: undefined,
    search: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, rowsPerPage, filters]);

  const fetchDepartments = async () => {
    try {
      const data = await complaintService.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getComplaints(
        page + 1,
        rowsPerPage,
        filters
      );
      setComplaints(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Şikayetler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: keyof ComplaintFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
    setPage(0);
  };

  const handleViewComplaint = (id: number) => {
    navigate(`/complaints/${id}`);
  };

  const handleEditComplaint = (id: number) => {
    navigate(`/complaints/${id}/edit`);
  };

  const handleDeleteComplaint = async (id: number) => {
    if (window.confirm('Bu şikayeti silmek istediğinizden emin misiniz?')) {
      try {
        await complaintService.deleteComplaint(id);
        fetchComplaints();
      } catch (err: any) {
        alert(err.message || 'Şikayet silinirken bir hata oluştu.');
      }
    }
  };

  const handleExport = async () => {
    try {
      const blob = await complaintService.exportComplaints(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sikayetler_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Dışa aktarma sırasında bir hata oluştu.');
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return 'warning';
      case ComplaintStatus.IN_PROGRESS:
        return 'info';
      case ComplaintStatus.RESOLVED:
        return 'success';
      case ComplaintStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.LOW:
        return 'success';
      case ComplaintPriority.MEDIUM:
        return 'warning';
      case ComplaintPriority.HIGH:
        return 'error';
      case ComplaintPriority.URGENT:
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && complaints.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Şikayetler</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            Filtreler
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={handleExport}
          >
            Dışa Aktar
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {showFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Ara"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Durum</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Durum"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value={ComplaintStatus.PENDING}>Beklemede</MenuItem>
                  <MenuItem value={ComplaintStatus.IN_PROGRESS}>İşlemde</MenuItem>
                  <MenuItem value={ComplaintStatus.RESOLVED}>Çözüldü</MenuItem>
                  <MenuItem value={ComplaintStatus.REJECTED}>Reddedildi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Öncelik</InputLabel>
                <Select
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  label="Öncelik"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value={ComplaintPriority.LOW}>Düşük</MenuItem>
                  <MenuItem value={ComplaintPriority.MEDIUM}>Orta</MenuItem>
                  <MenuItem value={ComplaintPriority.HIGH}>Yüksek</MenuItem>
                  <MenuItem value={ComplaintPriority.URGENT}>Acil</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Departman</InputLabel>
                <Select
                  value={filters.departmentId || ''}
                  onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                  label="Departman"
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Konu</TableCell>
              <TableCell>Departman</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Öncelik</TableCell>
              <TableCell>Vatandaş</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.map((complaint) => (
              <TableRow key={complaint.id}>
                <TableCell>{complaint.id}</TableCell>
                <TableCell>{complaint.subject}</TableCell>
                <TableCell>{complaint.department?.name}</TableCell>
                <TableCell>
                  <Chip
                    label={complaint.status}
                    color={getStatusColor(complaint.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={complaint.priority}
                    color={getPriorityColor(complaint.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {complaint.citizen?.firstName} {complaint.citizen?.lastName}
                </TableCell>
                <TableCell>
                  {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleViewComplaint(complaint.id)}
                  >
                    <Visibility />
                  </IconButton>
                  {(isOfficer || isAdmin) && (
                    <IconButton
                      size="small"
                      onClick={() => handleEditComplaint(complaint.id)}
                    >
                      <Edit />
                    </IconButton>
                  )}
                  {isAdmin && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComplaint(complaint.id)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </TableContainer>
    </Box>
  );
};

export default ComplaintList;