import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  Book as BookIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  LibraryBooks as LibraryIcon,
  PersonAdd as PersonAddIcon,
  AssignmentLate as OverdueIcon,
  EventNote as ReservationIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import reportService from '../services/report.service';
import { DashboardStats } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadDashboardStats();
  }, []);
  
  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await reportService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError('Dashboard verileri yüklenirken hata oluştu');
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
    return null;
  }
  
  const memberStatusData = [
    { name: 'Aktif', value: stats.members.active },
    { name: 'Askıda', value: stats.members.suspended },
    { name: 'Süresi Dolmuş', value: stats.members.expired },
  ];
  
  const loanStatusData = [
    { name: 'Aktif', value: stats.loans.active },
    { name: 'Gecikmiş', value: stats.loans.overdue },
  ];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Kitap
                  </Typography>
                  <Typography variant="h4">
                    {stats.books.total.toLocaleString('tr-TR')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.books.available_copies} mevcut
                  </Typography>
                </Box>
                <BookIcon color="primary" sx={{ fontSize: 48 }} />
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
                    Toplam Üye
                  </Typography>
                  <Typography variant="h4">
                    {stats.members.total.toLocaleString('tr-TR')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.members.active} aktif
                  </Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 48 }} />
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
                    Aktif Ödünç
                  </Typography>
                  <Typography variant="h4">
                    {stats.loans.active}
                  </Typography>
                  <Typography variant="body2" color="error">
                    {stats.loans.overdue} gecikmiş
                  </Typography>
                </Box>
                <AssignmentIcon color="primary" sx={{ fontSize: 48 }} />
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
                    Toplam Ceza
                  </Typography>
                  <Typography variant="h4">
                    ₺{stats.fines.unpaid_amount.toLocaleString('tr-TR')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.fines.unpaid_count} ödenmemiş
                  </Typography>
                </Box>
                <MoneyIcon color="primary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Today's Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Günlük İstatistikler
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2}>
                  <LibraryIcon color="action" sx={{ fontSize: 32 }} />
                  <Typography variant="h6">{stats.loans.today}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Bugün Ödünç Verilen
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2}>
                  <AssignmentIcon color="action" sx={{ fontSize: 32 }} />
                  <Typography variant="h6">{stats.loans.returns_today}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Bugün İade Edilen
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2}>
                  <PersonAddIcon color="action" sx={{ fontSize: 32 }} />
                  <Typography variant="h6">{stats.members.new_this_month}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Bu Ay Yeni Üye
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2}>
                  <ReservationIcon color="action" sx={{ fontSize: 32 }} />
                  <Typography variant="h6">{stats.reservations.active}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Aktif Rezervasyon
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Üye Durumu Dağılımı
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={memberStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {memberStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ödünç Durumu
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loanStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Collection Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Koleksiyon Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Toplam Kopya
                </Typography>
                <Typography variant="h6">
                  {stats.books.total_copies.toLocaleString('tr-TR')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Kategori Sayısı
                </Typography>
                <Typography variant="h6">
                  {stats.books.categories}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">
                  Yazar Sayısı
                </Typography>
                <Typography variant="h6">
                  {stats.books.authors}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;