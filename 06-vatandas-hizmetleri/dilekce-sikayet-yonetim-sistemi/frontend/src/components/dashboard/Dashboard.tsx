import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment,
  Pending,
  CheckCircle,
  Cancel,
  TrendingUp,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import complaintService from '../../services/complaintService';
import { DashboardStats, ComplaintPriority } from '../../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Dashboard verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return <Alert severity="info">Dashboard verileri bulunamadı.</Alert>;
  }

  const statusData = [
    { name: 'Beklemede', value: stats.pendingComplaints, color: '#FFA726' },
    { name: 'İşlemde', value: stats.inProgressComplaints, color: '#42A5F5' },
    { name: 'Çözüldü', value: stats.resolvedComplaints, color: '#66BB6A' },
    { name: 'Reddedildi', value: stats.rejectedComplaints, color: '#EF5350' },
  ];

  const priorityColors = {
    [ComplaintPriority.LOW]: '#66BB6A',
    [ComplaintPriority.MEDIUM]: '#FFA726',
    [ComplaintPriority.HIGH]: '#EF5350',
    [ComplaintPriority.URGENT]: '#AB47BC',
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Şikayet
                  </Typography>
                  <Typography variant="h4">{stats.totalComplaints}</Typography>
                </Box>
                <Assignment fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Beklemede
                  </Typography>
                  <Typography variant="h4">{stats.pendingComplaints}</Typography>
                </Box>
                <Pending fontSize="large" sx={{ color: '#FFA726' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Çözüldü
                  </Typography>
                  <Typography variant="h4">{stats.resolvedComplaints}</Typography>
                </Box>
                <CheckCircle fontSize="large" sx={{ color: '#66BB6A' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ort. Yanıt Süresi
                  </Typography>
                  <Typography variant="h4">{stats.averageResponseTime}s</Typography>
                </Box>
                <TrendingUp fontSize="large" color="secondary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Durum Dağılımı
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Priority Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Öncelik Dağılımı
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.complaintsByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {stats.complaintsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={priorityColors[entry.priority]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Departmanlara Göre Şikayetler
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.complaintsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="departmentName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Complaints */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Son Şikayetler
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Konu</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Departman</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Durum</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Öncelik</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{complaint.id}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{complaint.subject}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{complaint.department?.name}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{complaint.status}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{complaint.priority}</td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;