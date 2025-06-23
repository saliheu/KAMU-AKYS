import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  LocationOn as LocationOnIcon,
  Link as LinkIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { meetingService } from '../services/meetingService';
import { Meeting } from '../types';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const MeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchMeeting();
    }
  }, [id]);
  
  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getMeeting(parseInt(id!));
      setMeeting(data);
    } catch (err: any) {
      setError('Toplantı bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelMeeting = async () => {
    try {
      await meetingService.cancelMeeting(parseInt(id!));
      setCancelDialogOpen(false);
      fetchMeeting();
    } catch (err: any) {
      setError('Toplantı iptal edilirken hata oluştu');
    }
  };
  
  const handleStartMeeting = async () => {
    try {
      await meetingService.startMeeting(parseInt(id!));
      fetchMeeting();
    } catch (err: any) {
      setError('Toplantı başlatılırken hata oluştu');
    }
  };
  
  const handleCompleteMeeting = async () => {
    try {
      await meetingService.completeMeeting(parseInt(id!));
      fetchMeeting();
    } catch (err: any) {
      setError('Toplantı tamamlanırken hata oluştu');
    }
  };
  
  const isOrganizer = meeting?.organizer.id === user?.id;
  
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
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  
  if (!meeting) {
    return <Alert severity="error">Toplantı bulunamadı</Alert>;
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/meetings')}
        >
          Toplantılara Dön
        </Button>
        
        {isOrganizer && meeting.status === 'SCHEDULED' && (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/meetings/${id}/edit`)}
            >
              Düzenle
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => setCancelDialogOpen(true)}
            >
              İptal Et
            </Button>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartMeeting}
            >
              Başlat
            </Button>
          </Box>
        )}
        
        {isOrganizer && meeting.status === 'IN_PROGRESS' && (
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleCompleteMeeting}
          >
            Toplantıyı Bitir
          </Button>
        )}
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h1">
                  {meeting.title}
                </Typography>
                <Chip
                  label={getStatusText(meeting.status)}
                  color={getStatusColor(meeting.status)}
                />
              </Box>
              
              {meeting.description && (
                <Typography variant="body1" color="text.secondary" paragraph>
                  {meeting.description}
                </Typography>
              )}
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ScheduleIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Başlangıç
                      </Typography>
                      <Typography variant="body1">
                        {dayjs(meeting.startTime).format('DD MMMM YYYY, HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ScheduleIcon color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Bitiş
                      </Typography>
                      <Typography variant="body1">
                        {dayjs(meeting.endTime).format('DD MMMM YYYY, HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {meeting.location && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOnIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Konum
                        </Typography>
                        <Typography variant="body1">
                          {meeting.room?.name || meeting.location}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                {meeting.onlineLink && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinkIcon color="action" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Çevrimiçi Bağlantı
                        </Typography>
                        <a
                          href={meeting.onlineLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <Typography variant="body1" color="primary">
                            Toplantıya Katıl
                          </Typography>
                        </a>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              {meeting.agenda && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Gündem
                  </Typography>
                  <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                    {meeting.agenda}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <GroupIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Katılımcılar ({meeting.participants.length})
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      {meeting.organizer.firstName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${meeting.organizer.firstName} ${meeting.organizer.lastName}`}
                    secondary="Düzenleyen"
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                {meeting.participants.map((participant) => (
                  <ListItem key={participant.id}>
                    <ListItemAvatar>
                      <Avatar>
                        {participant.firstName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${participant.firstName} ${participant.lastName}`}
                      secondary={participant.title || participant.email}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Toplantıyı İptal Et</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu toplantıyı iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Vazgeç
          </Button>
          <Button onClick={handleCancelMeeting} color="error" autoFocus>
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingDetail;