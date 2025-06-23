import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { meetingService } from '../services/meetingService';
import { Meeting } from '../types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchUpcomingMeetings();
  }, []);
  
  const fetchUpcomingMeetings = async () => {
    try {
      setLoading(true);
      const meetings = await meetingService.getUpcomingMeetings();
      setUpcomingMeetings(meetings.slice(0, 5)); // Show only first 5
    } catch (err: any) {
      setError('Toplantılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const getStatusText = (status: Meeting['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Planlandı';
      case 'IN_PROGRESS':
        return 'Devam Ediyor';
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Hoş Geldiniz, {user?.firstName} {user?.lastName}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/meetings/new')}
        >
          Yeni Toplantı
        </Button>
      </Box>
      
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Bu Ay Toplantılar
                  </Typography>
                  <Typography variant="h5">12</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Bekleyen Toplantılar
                  </Typography>
                  <Typography variant="h5">{upcomingMeetings.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <GroupIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Katılımcı Sayısı
                  </Typography>
                  <Typography variant="h5">48</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Tamamlanan
                  </Typography>
                  <Typography variant="h5">8</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Yaklaşan Toplantılar
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : upcomingMeetings.length === 0 ? (
            <Typography color="textSecondary" align="center" py={3}>
              Yaklaşan toplantınız bulunmamaktadır
            </Typography>
          ) : (
            <List>
              {upcomingMeetings.map((meeting) => (
                <ListItem
                  key={meeting.id}
                  button
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                  divider
                >
                  <ListItemText
                    primary={meeting.title}
                    secondary={
                      <>
                        {dayjs(meeting.startTime).format('DD MMMM YYYY, HH:mm')} -{' '}
                        {dayjs(meeting.endTime).format('HH:mm')}
                        {meeting.room && ` | ${meeting.room.name}`}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={getStatusText(meeting.status)}
                      color={getStatusColor(meeting.status)}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
          {upcomingMeetings.length > 0 && (
            <Box textAlign="center" mt={2}>
              <Button onClick={() => navigate('/meetings')}>
                Tüm Toplantıları Görüntüle
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;