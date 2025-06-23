import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Folder as FolderIcon,
  AccountTree as WorkflowIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import documentService from '../services/documentService';
import { Document } from '../types/document';

interface DashboardStats {
  totalDocuments: number;
  activeWorkflows: number;
  categories: number;
  recentDocuments: Document[];
}

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    activeWorkflows: 0,
    categories: 0,
    recentDocuments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const documents = await documentService.getDocuments({ page: 1 });
        setStats({
          totalDocuments: documents.count,
          activeWorkflows: 0, // TODO: Fetch from workflow service
          categories: 0, // TODO: Fetch from category service
          recentDocuments: documents.results.slice(0, 5),
        });
      } catch (error) {
        console.error('Dashboard verileri yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Toplam Belge',
      value: stats.totalDocuments,
      icon: <DocumentIcon fontSize="large" />,
      color: '#1976d2',
    },
    {
      title: 'Aktif İş Akışı',
      value: stats.activeWorkflows,
      icon: <WorkflowIcon fontSize="large" />,
      color: '#388e3c',
    },
    {
      title: 'Kategori',
      value: stats.categories,
      icon: <FolderIcon fontSize="large" />,
      color: '#f57c00',
    },
    {
      title: 'Kullanıcılar',
      value: '12',
      icon: <PeopleIcon fontSize="large" />,
      color: '#7b1fa2',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hoş Geldiniz, {user?.first_name || user?.username}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">{card.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: card.color, width: 56, height: 56 }}>
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Son Eklenen Belgeler</Typography>
            </Box>
            <List>
              {stats.recentDocuments.map((doc) => (
                <ListItem key={doc.id}>
                  <ListItemAvatar>
                    <Avatar>
                      <DocumentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={doc.title}
                    secondary={`${doc.created_by_name} - ${new Date(
                      doc.created_at
                    ).toLocaleDateString('tr-TR')}`}
                  />
                  <Chip
                    label={doc.status === 'active' ? 'Aktif' : 'Taslak'}
                    color={doc.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Hızlı İstatistikler
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Bu Ay Yüklenen"
                  secondary="23 belge"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Onay Bekleyen"
                  secondary="5 belge"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Paylaşılan"
                  secondary="18 belge"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}