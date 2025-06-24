import { useQuery } from 'react-query'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Recycling,
  LocalShipping,
  TrendingUp,
  Warning
} from '@mui/icons-material'
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
  ResponsiveContainer
} from 'recharts'
import api from '../services/api'
import { format, subDays } from 'date-fns'
import { tr } from 'date-fns/locale'

const COLORS = {
  organik: '#8b4513',
  kağıt: '#4169e1',
  plastik: '#ff8c00',
  cam: '#32cd32',
  metal: '#808080',
  elektronik: '#9370db',
  tehlikeli: '#dc143c',
  diğer: '#696969'
}

function Dashboard() {
  const { data: stats, isLoading } = useQuery('dashboard-stats', async () => {
    const endDate = new Date()
    const startDate = subDays(endDate, 30)
    
    const [entriesRes, collectionsRes, reportsRes] = await Promise.all([
      api.get('/waste-entries/stats/summary', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }),
      api.get('/collections', { params: { limit: 5 } }),
      api.get('/reports', { params: { limit: 1, reportType: 'aylık' } })
    ])

    return {
      entries: entriesRes.data,
      collections: collectionsRes.data,
      lastReport: reportsRes.data.reports?.[0]
    }
  })

  if (isLoading) {
    return <LinearProgress />
  }

  const statCards = [
    {
      title: 'Toplam Atık (30 Gün)',
      value: `${stats?.entries?.totalWaste?.toFixed(0) || 0} kg`,
      icon: <DeleteIcon />,
      color: '#ff6f00'
    },
    {
      title: 'Geri Dönüşüm Oranı',
      value: `%${stats?.entries?.recyclingRate || 0}`,
      icon: <Recycling />,
      color: '#2e7d32'
    },
    {
      title: 'Bekleyen Toplama',
      value: stats?.collections?.totalCollections || 0,
      icon: <LocalShipping />,
      color: '#1976d2'
    },
    {
      title: 'Aylık Trend',
      value: <TrendingUp />,
      icon: <TrendingUp />,
      color: '#9c27b0'
    }
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      mr: 2
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography color="textSecondary" variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5">
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Waste by Type Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Atık Türlerine Göre Dağılım
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={stats?.entries?.wasteByType || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ wasteType, totalQuantity }) => 
                    `${wasteType}: ${parseFloat(totalQuantity).toFixed(0)} kg`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="totalQuantity"
                >
                  {stats?.entries?.wasteByType?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.wasteType] || COLORS.diğer} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Daily Trend Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Günlük Atık Miktarı Trendi
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={stats?.entries?.dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'dd MMM', { locale: tr })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'dd MMMM yyyy', { locale: tr })}
                  formatter={(value) => `${parseFloat(value).toFixed(2)} kg`}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalQuantity" 
                  stroke="#2e7d32" 
                  strokeWidth={2}
                  dot={{ fill: '#2e7d32' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Collections */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Son Toplama İşlemleri
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.collections?.collections?.map((collection) => (
                <Box
                  key={collection.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="body1">
                      {collection.collectorCompany?.companyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(collection.collectionDate), 'dd MMMM yyyy', { locale: tr })}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6">
                      {collection.totalWeight} kg
                    </Typography>
                    <Chip
                      label={collection.status}
                      size="small"
                      color={collection.status === 'teslim_edildi' ? 'success' : 'warning'}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard