import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { meetingService } from '../services/meetingService';
import { CreateMeetingRequest } from '../types';
import dayjs, { Dayjs } from 'dayjs';

const CreateMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<CreateMeetingRequest>>({
    title: '',
    description: '',
    type: 'IN_PERSON',
    location: '',
    onlineLink: '',
    agenda: '',
    sendReminder: true,
    reminderMinutes: 30,
    isRecurring: false,
    participantIds: [],
  });
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().add(1, 'hour'));
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().add(2, 'hour'));
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleSelectChange = (name: string) => (e: any) => {
    setFormData({
      ...formData,
      [name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!startTime || !endTime) {
      setError('Lütfen başlangıç ve bitiş zamanlarını seçin');
      return;
    }
    
    if (endTime.isBefore(startTime)) {
      setError('Bitiş zamanı başlangıç zamanından sonra olmalıdır');
      return;
    }
    
    setLoading(true);
    
    try {
      const meetingData: CreateMeetingRequest = {
        ...formData,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        participantIds: formData.participantIds || [],
      } as CreateMeetingRequest;
      
      const createdMeeting = await meetingService.createMeeting(meetingData);
      navigate(`/meetings/${createdMeeting.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Toplantı oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Yeni Toplantı Oluştur
      </Typography>
      
      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Toplantı Başlığı"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Açıklama"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Başlangıç Zamanı"
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  ampm={false}
                  format="DD.MM.YYYY HH:mm"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Bitiş Zamanı"
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  ampm={false}
                  format="DD.MM.YYYY HH:mm"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Toplantı Türü</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleSelectChange('type')}
                    label="Toplantı Türü"
                  >
                    <MenuItem value="IN_PERSON">Yüz yüze</MenuItem>
                    <MenuItem value="ONLINE">Çevrimiçi</MenuItem>
                    <MenuItem value="HYBRID">Hibrit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {(formData.type === 'IN_PERSON' || formData.type === 'HYBRID') && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Konum"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </Grid>
              )}
              
              {(formData.type === 'ONLINE' || formData.type === 'HYBRID') && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Çevrimiçi Bağlantı"
                    name="onlineLink"
                    value={formData.onlineLink}
                    onChange={handleInputChange}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Gündem"
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.sendReminder}
                      onChange={handleInputChange}
                      name="sendReminder"
                    />
                  }
                  label="Hatırlatma gönder"
                />
              </Grid>
              
              {formData.sendReminder && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Hatırlatma Süresi</InputLabel>
                    <Select
                      name="reminderMinutes"
                      value={formData.reminderMinutes}
                      onChange={handleSelectChange('reminderMinutes')}
                      label="Hatırlatma Süresi"
                    >
                      <MenuItem value={15}>15 dakika önce</MenuItem>
                      <MenuItem value={30}>30 dakika önce</MenuItem>
                      <MenuItem value={60}>1 saat önce</MenuItem>
                      <MenuItem value={120}>2 saat önce</MenuItem>
                      <MenuItem value={1440}>1 gün önce</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/meetings')}
                    disabled={loading}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Oluşturuluyor...' : 'Toplantı Oluştur'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateMeeting;