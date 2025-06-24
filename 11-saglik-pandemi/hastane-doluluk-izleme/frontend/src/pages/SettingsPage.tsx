import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../hooks/redux';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Password change logic
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ayarlar
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(_, value) => setTabValue(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Profil" />
          <Tab label="Bildirimler" />
          <Tab label="Uyarı Kuralları" />
          <Tab label="Güvenlik" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Profil Bilgileri
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Ad Soyad"
                value={user?.name || ''}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label="E-posta"
                value={user?.email || ''}
                disabled
                margin="normal"
              />
              <TextField
                fullWidth
                label="Rol"
                value={user?.role || ''}
                disabled
                margin="normal"
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Bildirim Tercihleri
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="E-posta Bildirimleri"
                  secondary="Kritik uyarılar için e-posta al"
                />
                <ListItemSecondaryAction>
                  <Switch defaultChecked />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Anlık Bildirimler"
                  secondary="Tarayıcı bildirimleri al"
                />
                <ListItemSecondaryAction>
                  <Switch defaultChecked />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Günlük Özet"
                  secondary="Günlük özet e-postası al"
                />
                <ListItemSecondaryAction>
                  <Switch />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Uyarı Kuralları</Typography>
              <Button variant="contained" startIcon={<AddIcon />} size="small">
                Yeni Kural
              </Button>
            </Box>
            <List>
              <ListItem>
                <ListItemText
                  primary="Yüksek Doluluk Uyarısı"
                  secondary="Doluluk %85'i geçtiğinde uyar"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" size="small">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Kritik Yatak Sayısı"
                  secondary="Boş yatak sayısı 5'in altına düştüğünde uyar"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" size="small">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Şifre Değiştir
            </Typography>
            <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                type="password"
                label="Mevcut Şifre"
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Yeni Şifre"
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Yeni Şifre (Tekrar)"
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                margin="normal"
                required
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{ mt: 2 }}
              >
                Şifreyi Güncelle
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
              İki Faktörlü Doğrulama
            </Typography>
            <FormControlLabel
              control={<Switch />}
              label="İki faktörlü doğrulamayı etkinleştir"
            />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default SettingsPage;