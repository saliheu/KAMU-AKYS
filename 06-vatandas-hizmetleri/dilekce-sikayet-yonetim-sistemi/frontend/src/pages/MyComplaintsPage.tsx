import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
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
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Visibility,
  Add,
} from '@mui/icons-material';
import complaintService from '../services/complaintService';
import { Complaint, ComplaintStatus, ComplaintPriority } from '../types';

const MyComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMyComplaints();
  }, [page, rowsPerPage]);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getMyComplaints(page + 1, rowsPerPage);
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

  const handleViewComplaint = (id: number) => {
    navigate(`/complaints/${id}`);
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

  const getStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return 'Beklemede';
      case ComplaintStatus.IN_PROGRESS:
        return 'İşlemde';
      case ComplaintStatus.RESOLVED:
        return 'Çözüldü';
      case ComplaintStatus.REJECTED:
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.LOW:
        return 'Düşük';
      case ComplaintPriority.MEDIUM:
        return 'Orta';
      case ComplaintPriority.HIGH:
        return 'Yüksek';
      case ComplaintPriority.URGENT:
        return 'Acil';
      default:
        return priority;
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
        <Typography variant="h4">Şikayetlerim</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/complaints/new')}
        >
          Yeni Şikayet
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {complaints.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Henüz şikayetiniz bulunmuyor
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Belediye hizmetleri ile ilgili şikayet veya önerilerinizi paylaşmak için yeni bir şikayet oluşturabilirsiniz.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/complaints/new')}
          >
            İlk Şikayetimi Oluştur
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Konu</TableCell>
                <TableCell>Departman</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Öncelik</TableCell>
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
                      label={getStatusText(complaint.status)}
                      color={getStatusColor(complaint.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPriorityText(complaint.priority)}
                      color={getPriorityColor(complaint.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewComplaint(complaint.id)}
                      title="Detayları Görüntüle"
                    >
                      <Visibility />
                    </IconButton>
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
      )}
    </Box>
  );
};

export default MyComplaintsPage;