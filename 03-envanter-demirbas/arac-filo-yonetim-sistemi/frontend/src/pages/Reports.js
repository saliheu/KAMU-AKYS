import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import {
  Description,
  Assessment,
  LocalGasStation,
  Build,
  DirectionsCar,
  Person,
} from '@mui/icons-material';

const reportTypes = [
  {
    title: 'Araç Kullanım Raporu',
    description: 'Araçların kullanım detayları ve verimliliği',
    icon: <DirectionsCar />,
    color: '#1976d2',
  },
  {
    title: 'Maliyet Analizi',
    description: 'Yakıt ve bakım maliyetlerinin detaylı analizi',
    icon: <Assessment />,
    color: '#4caf50',
  },
  {
    title: 'Sürücü Performansı',
    description: 'Sürücülerin yakıt tüketimi ve kullanım istatistikleri',
    icon: <Person />,
    color: '#ff9800',
  },
  {
    title: 'Bakım Raporu',
    description: 'Planlı ve gerçekleşen bakımların özeti',
    icon: <Build />,
    color: '#f44336',
  },
  {
    title: 'Yakıt Tüketimi',
    description: 'Araç bazlı yakıt tüketim analizleri',
    icon: <LocalGasStation />,
    color: '#9c27b0',
  },
  {
    title: 'Genel Özet',
    description: 'Tüm verilerin aylık/yıllık özeti',
    icon: <Description />,
    color: '#00bcd4',
  },
];

export default function Reports() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Raporlar
      </Typography>
      
      <Grid container spacing={3}>
        {reportTypes.map((report, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper sx={{ p: 3, height: '100%', cursor: 'pointer', '&:hover': { elevation: 3 } }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ color: report.color, mr: 2 }}>
                  {report.icon}
                </Box>
                <Typography variant="h6">
                  {report.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" mb={2}>
                {report.description}
              </Typography>
              <Button variant="outlined" size="small">
                Raporu Görüntüle
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}