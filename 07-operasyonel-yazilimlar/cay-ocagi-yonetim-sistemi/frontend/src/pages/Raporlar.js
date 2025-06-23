import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Raporlar = () => {
  const [stokRaporu, setStokRaporu] = useState(null);
  const [maliyetAnalizi, setMaliyetAnalizi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [stok, maliyet] = await Promise.all([
        axios.get('/api/raporlar/stok-durumu'),
        axios.get('/api/raporlar/maliyet-analizi')
      ]);
      setStokRaporu(stok.data.data);
      setMaliyetAnalizi(maliyet.data.data);
    } catch (error) {
      console.error('Rapor yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const kategoriData = stokRaporu ? Object.entries(stokRaporu.kategoriBazli).map(([key, value]) => ({
    name: key,
    value: value.toplamDeger
  })) : [];

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Raporlar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stok Özeti */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Stok Durumu Özeti</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Malzeme:</span>
              <span className="font-medium">{stokRaporu?.toplamMalzemeSayisi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kritik Stok:</span>
              <span className="font-medium text-red-600">{stokRaporu?.kritikMalzemeSayisi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Stok Değeri:</span>
              <span className="font-medium">₺{stokRaporu?.toplamStokDegeri.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Kategori Dağılımı */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Kategori Bazlı Stok Değeri</h2>
          <PieChart width={300} height={200}>
            <Pie
              data={kategoriData}
              cx={150}
              cy={100}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {kategoriData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₺${value.toFixed(2)}`} />
          </PieChart>
        </div>

        {/* Aylık Trend */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Aylık Maliyet Trendi</h2>
          <BarChart width={700} height={300} data={maliyetAnalizi?.aylikTrend || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="_id" 
              tickFormatter={(value) => `${value.ay}/${value.yil}`}
            />
            <YAxis />
            <Tooltip formatter={(value) => `₺${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="toplamMaliyet" fill="#8884d8" name="Toplam Maliyet" />
          </BarChart>
        </div>

        {/* Kritik Stok Listesi */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Kritik Stoktaki Malzemeler</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Malzeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mevcut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Minimum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eksik
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stokRaporu?.kritikMalzemeler.map((malzeme) => (
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
    </div>
  );
};

export default Raporlar;