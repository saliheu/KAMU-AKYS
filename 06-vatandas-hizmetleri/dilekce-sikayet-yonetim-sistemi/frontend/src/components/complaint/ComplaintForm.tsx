import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  AttachFile,
} from '@mui/icons-material';
import complaintService from '../../services/complaintService';
import { ComplaintFormData, ComplaintPriority, Department } from '../../types';

const ComplaintForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<ComplaintFormData>({
    departmentId: 0,
    subject: '',
    description: '',
    priority: ComplaintPriority.MEDIUM,
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await complaintService.getActiveDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err.message || 'Departmanlar yüklenirken bir hata oluştu.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const complaintData = {
        ...formData,
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      
      await complaintService.createComplaint(complaintData);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/my-complaints');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Şikayet gönderilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Yeni Şikayet Oluştur
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Şikayetiniz başarıyla gönderildi! Yönlendiriliyorsunuz...
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Departman</InputLabel>
                  <Select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={(e) => handleSelectChange('departmentId', e.target.value)}
                    label="Departman"
                  >
                    <MenuItem value={0} disabled>
                      Departman Seçin
                    </MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={(e) => handleSelectChange('priority', e.target.value)}
                    label="Öncelik"
                  >
                    <MenuItem value={ComplaintPriority.LOW}>Düşük</MenuItem>
                    <MenuItem value={ComplaintPriority.MEDIUM}>Orta</MenuItem>
                    <MenuItem value={ComplaintPriority.HIGH}>Yüksek</MenuItem>
                    <MenuItem value={ComplaintPriority.URGENT}>Acil</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  name="subject"
                  label="Konu"
                  value={formData.subject}
                  onChange={handleChange}
                  inputProps={{ maxLength: 200 }}
                  helperText={`${formData.subject.length}/200`}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={6}
                  name="description"
                  label="Açıklama"
                  value={formData.description}
                  onChange={handleChange}
                  inputProps={{ maxLength: 2000 }}
                  helperText={`${formData.description.length}/2000`}
                />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Ekler (Opsiyonel)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                  >
                    Dosya Ekle
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                  </Button>
                  
                  {attachments.length > 0 && (
                    <List>
                      {attachments.map((file, index) => (
                        <ListItem key={index}>
                          <AttachFile sx={{ mr: 1 }} />
                          <ListItemText
                            primary={file.name}
                            secondary={formatFileSize(file.size)}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || formData.departmentId === 0}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Gönder'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Container: React.FC<ContainerProps> = ({ children, maxWidth = 'lg' }) => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: maxWidth === 'xs' ? 444 : maxWidth === 'sm' ? 600 : maxWidth === 'md' ? 900 : maxWidth === 'lg' ? 1200 : 1536,
        mx: 'auto',
        px: 2,
      }}
    >
      {children}
    </Box>
  );
};

export default ComplaintForm;