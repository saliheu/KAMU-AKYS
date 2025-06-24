import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button } from '@mui/material';
import {
  Download as DownloadIcon,
  Assessment as ReportIcon,
  TrendingUp as TrendIcon,
  PieChart as ChartIcon,
} from '@mui/icons-material';

const ReportsPage: React.FC = () => {
  const reports = [
    {
      title: 'Günlük Doluluk Raporu',
      description: 'Tüm hastanelerin günlük doluluk oranları',
      icon: <ReportIcon />,
      color: 'primary',
    },
    {
      title: 'Haftalık Trend Analizi',
      description: 'Haftalık doluluk trend analizi ve tahminler',
      icon: <TrendIcon />,
      color: 'success',
    },
    {
      title: 'Bölgesel Karşılaştırma',
      description: 'Bölgeler arası doluluk karşılaştırması',
      icon: <ChartIcon />,
      color: 'warning',
    },
    {
      title: 'Kritik Durum Raporu',
      description: 'Kritik doluluk seviyesindeki hastaneler',
      icon: <ReportIcon />,
      color: 'error',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Raporlar
      </Typography>

      <Grid container spacing={3}>
        {reports.map((report, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    backgroundColor: `${report.color}.light`,
                    color: `${report.color}.main`,
                    mb: 2,
                  }}
                >
                  {report.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {report.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {report.description}
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  disabled
                >
                  İndir
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Rapor Oluşturucu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Özel raporlar oluşturma özelliği yakında eklenecek...
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReportsPage;