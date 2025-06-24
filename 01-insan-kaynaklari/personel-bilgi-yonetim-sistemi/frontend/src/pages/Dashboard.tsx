import React from 'react';
import { useQuery } from 'react-query';
import {
  UsersIcon,
  BuildingOfficeIcon,
  UserPlusIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';

interface DashboardStats {
  totalPersonnel: number;
  totalDepartments: number;
  newHires: number;
  onLeave: number;
}

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>(
    'dashboardStats',
    async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    }
  );

  const statCards = [
    {
      name: 'Toplam Personel',
      value: stats?.totalPersonnel || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Departmanlar',
      value: stats?.totalDepartments || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Bu Ay İşe Giren',
      value: stats?.newHires || 0,
      icon: UserPlusIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'İzindeki Personel',
      value: stats?.onLeave || 0,
      icon: CalendarDaysIcon,
      color: 'bg-red-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Son Aktiviteler</h2>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Aktivite verisi henüz mevcut değil.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
              Yeni Personel Ekle
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              İzin Talepleri
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Raporlar
            </button>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Belgeler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;