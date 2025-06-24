import { useQuery } from 'react-query'
import {
  ShoppingCart,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function Dashboard() {
  const { data: stats } = useQuery('dashboard-stats', async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  })

  const mockStats = {
    totalRequests: 45,
    pendingRequests: 12,
    activeTenders: 8,
    activeContracts: 23,
    monthlySpending: 1250000,
    yearlyBudget: 15000000,
    supplierCount: 67,
    completedOrders: 156
  }

  const monthlyData = [
    { month: 'Oca', amount: 850000 },
    { month: 'Şub', amount: 920000 },
    { month: 'Mar', amount: 1100000 },
    { month: 'Nis', amount: 980000 },
    { month: 'May', amount: 1250000 },
    { month: 'Haz', amount: 1150000 },
  ]

  const statCards = [
    {
      title: 'Toplam Talep',
      value: mockStats.totalRequests,
      icon: FileText,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: 'Bekleyen Talepler',
      value: mockStats.pendingRequests,
      icon: Clock,
      color: 'bg-yellow-500',
      trend: '-5%'
    },
    {
      title: 'Aktif İhaleler',
      value: mockStats.activeTenders,
      icon: AlertCircle,
      color: 'bg-purple-500',
      trend: '+8%'
    },
    {
      title: 'Aktif Sözleşmeler',
      value: mockStats.activeContracts,
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: '+15%'
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Satın alma ve tedarik süreçlerinizin genel görünümü
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Monthly Spending Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aylık Harcama</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₺${value.toLocaleString('tr-TR')}`} />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Overview */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bütçe Durumu</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Yıllık Bütçe</span>
                <span className="font-medium">₺{mockStats.yearlyBudget.toLocaleString('tr-TR')}</span>
              </div>
              <div className="mt-2 relative">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div 
                    style={{ width: '45%' }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">%45 kullanıldı</p>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Toplam Tedarikçi</span>
                <span className="text-sm font-medium">{mockStats.supplierCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tamamlanan Sipariş</span>
                <span className="text-sm font-medium">{mockStats.completedOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bu Ay Harcama</span>
                <span className="text-sm font-medium">₺{mockStats.monthlySpending.toLocaleString('tr-TR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Son Aktiviteler</h3>
        <div className="space-y-3">
          {[
            { action: 'Yeni satın alma talebi oluşturuldu', user: 'Ahmet Yılmaz', time: '5 dk önce', type: 'request' },
            { action: 'İhale sonuçlandı', user: 'Sistem', time: '1 saat önce', type: 'tender' },
            { action: 'Sözleşme imzalandı', user: 'Mehmet Öz', time: '3 saat önce', type: 'contract' },
            { action: 'Sipariş teslim alındı', user: 'Ayşe Kaya', time: '5 saat önce', type: 'order' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'request' ? 'bg-blue-500' :
                activity.type === 'tender' ? 'bg-purple-500' :
                activity.type === 'contract' ? 'bg-green-500' :
                'bg-gray-500'
              }`} />
              <div className="flex-1">
                <span className="text-gray-900">{activity.action}</span>
                <span className="text-gray-500"> - {activity.user}</span>
              </div>
              <span className="text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard