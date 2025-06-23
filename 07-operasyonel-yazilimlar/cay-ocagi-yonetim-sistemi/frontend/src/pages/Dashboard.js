import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    toplamMalzeme: 0,
    kritikMalzeme: 0,
    gunlukMaliyet: 0,
    stokDegeri: 0
  });
  const [kritikMalzemeler, setKritikMalzemeler] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [stokRaporu, gunlukOzet] = await Promise.all([
        axios.get('/api/raporlar/stok-durumu'),
        axios.get('/api/tuketim/gunluk-ozet')
      ]);

      setStats({
        toplamMalzeme: stokRaporu.data.data.toplamMalzemeSayisi,
        kritikMalzeme: stokRaporu.data.data.kritikMalzemeSayisi,
        gunlukMaliyet: gunlukOzet.data.data.toplamMaliyet,
        stokDegeri: stokRaporu.data.data.toplamStokDegeri
      });

      setKritikMalzemeler(stokRaporu.data.data.kritikMalzemeler.slice(0, 5));
    } catch (error) {
      console.error('Dashboard veri hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Toplam Malzeme',
      value: stats.toplamMalzeme,
      icon: CubeIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Kritik Stok',
      value: stats.kritikMalzeme,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500'
    },
    {
      title: 'Günlük Maliyet',
      value: `₺${stats.gunlukMaliyet.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Stok Değeri',
      value: `₺${stats.stokDegeri.toFixed(2)}`,
      icon: ChartBarIcon,
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {kritikMalzemeler.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Kritik Stok Durumundaki Malzemeler
            </h3>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Malzeme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mevcut Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Minimum Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Eksik Miktar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kritikMalzemeler.map((malzeme) => (
                    <tr key={malzeme.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {malzeme.ad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {malzeme.kategori}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {malzeme.stok}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {malzeme.minimumStok}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {malzeme.eksikMiktar}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;