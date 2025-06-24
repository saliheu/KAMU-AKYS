import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  AttachFile,
  CloudUpload,
  Person,
  CalendarToday,
  Business,
  Send,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import complaintService from '../../services/complaintService';
import { Complaint, ComplaintResponse, ComplaintStatus, ComplaintPriority } from '../../types';

const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOfficer, isAdmin, user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [responses, setResponses] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseFiles, setResponseFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchComplaintDetails();
    }
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const [complaintData, responsesData] = await Promise.all([
        complaintService.getComplaintById(parseInt(id!)),
        complaintService.getComplaintResponses(parseInt(id!)),
      ]);
      setComplaint(complaintData);
      setResponses(responsesData);
    } catch (err: any) {
      setError(err.message || 'Şikayet detayları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    try {
      await complaintService.updateComplaintStatus(parseInt(id!), newStatus);
      setComplaint(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err: any) {
      alert(err.message || 'Durum güncellenirken bir hata oluştu.');
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      alert('Lütfen bir yanıt yazın.');
      return;
    }

    setSubmitting(true);
    try {
      const newResponse = await complaintService.addResponse(
        parseInt(id!),
        responseText,
        responseFiles
      );
      setResponses(prev => [...prev, newResponse]);
      setResponseText('');
      setResponseFiles([]);
    } catch (err: any) {
      alert(err.message || 'Yanıt gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setResponseFiles(prev => [...prev, ...newFiles]);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !complaint) {
    return (
      <Box>
        <Alert severity="error">{error || 'Şikayet bulunamadı.'}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Geri Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Şikayet Detayı #{complaint.id}
        </Typography>
        <Chip
          label={complaint.status}
          color={getStatusColor(complaint.status)}
          sx={{ mr: 1 }}
        />
        <Chip
          label={complaint.priority}
          color={getPriorityColor(complaint.priority)}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {complaint.subject}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" paragraph>
              {complaint.description}
            </Typography>
            
            {complaint.attachments && complaint.attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Ekler:
                </Typography>
                <List dense>
                  {complaint.attachments.map((attachment, index) => (
                    <ListItem key={index}>
                      <AttachFile sx={{ mr: 1 }} />
                      <ListItemText primary={attachment} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Yanıtlar
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            {responses.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                Henüz yanıt bulunmuyor.
              </Typography>
            ) : (
              <List>
                {responses.map((response) => (
                  <ListItem key={response.id} alignItems="flex-start" sx={{ px: 0 }}>
                    <Card sx={{ width: '100%', mb: 2 }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            <Person />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2">
                              {response.officer?.firstName} {response.officer?.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(response.createdAt).toLocaleString('tr-TR')}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body1">
                          {response.responseText}
                        </Typography>
                        {response.attachments && response.attachments.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {response.attachments.map((attachment, idx) => (
                              <Chip
                                key={idx}
                                icon={<AttachFile />}
                                label={attachment}
                                size="small"
                                sx={{ mr: 1, mt: 1 }}
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </ListItem>
                ))}
              </List>
            )}

            {(isOfficer || isAdmin) && complaint.status !== ComplaintStatus.RESOLVED && (
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Yanıtınızı yazın..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Button
                    component="label"
                    startIcon={<CloudUpload />}
                    variant="outlined"
                    size="small"
                  >
                    Dosya Ekle
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileSelect}
                    />
                  </Button>
                  {responseFiles.length > 0 && (
                    <Typography variant="caption">
                      {responseFiles.length} dosya seçildi
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    endIcon={<Send />}
                    onClick={handleSubmitResponse}
                    disabled={submitting || !responseText.trim()}
                  >
                    {submitting ? <CircularProgress size={20} /> : 'Yanıtla'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Şikayet Bilgileri
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  Vatandaş:
                </Typography>
              </Box>
              <Typography variant="body1">
                {complaint.citizen?.firstName} {complaint.citizen?.lastName}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <Business sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  Departman:
                </Typography>
              </Box>
              <Typography variant="body1">
                {complaint.department?.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" mb={1}>
                <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="textSecondary">
                  Oluşturulma Tarihi:
                </Typography>
              </Box>
              <Typography variant="body1">
                {new Date(complaint.createdAt).toLocaleString('tr-TR')}
              </Typography>
            </Box>

            {(isOfficer || isAdmin) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Durum Güncelle:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.values(ComplaintStatus).map((status) => (
                    <Button
                      key={status}
                      variant={complaint.status === status ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleStatusChange(status)}
                      disabled={complaint.status === status}
                    >
                      {status}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplaintDetail;