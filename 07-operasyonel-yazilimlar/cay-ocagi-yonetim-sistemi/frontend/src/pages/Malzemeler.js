import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Malzemeler = () => {
  const { isAdmin } = useAuth();
  const [malzemeler, setMalzemeler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMalzeme, setEditingMalzeme] = useState(null);
  const [formData, setFormData] = useState({
    ad: '',
    kategori: 'icecek',
    birim: 'adet',
    stok: 0,
    minimumStok: 10,
    birimFiyat: 0,
    tedarikci: '',
    notlar: ''
  });

  useEffect(() => {
    fetchMalzemeler();
  }, []);

  const fetchMalzemeler = async () => {
    try {
      const response = await axios.get('/api/malzemeler');
      setMalzemeler(response.data.data);
    } catch (error) {
      toast.error('Malzemeler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMalzeme) {
        await axios.put(`/api/malzemeler/${editingMalzeme._id}`, formData);
        toast.success('Malzeme güncellendi');
      } else {
        await axios.post('/api/malzemeler', formData);
        toast.success('Malzeme eklendi');
      }
      setShowModal(false);
      resetForm();
      fetchMalzemeler();
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu malzemeyi silmek istediğinize emin misiniz?')) {
      try {
        await axios.delete(`/api/malzemeler/${id}`);
        toast.success('Malzeme silindi');
        fetchMalzemeler();
      } catch (error) {
        toast.error('Silme işlemi başarısız');
      }
    }
  };

  const handleEdit = (malzeme) => {
    setEditingMalzeme(malzeme);
    setFormData(malzeme);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingMalzeme(null);
    setFormData({
      ad: '',
      kategori: 'icecek',
      birim: 'adet',
      stok: 0,
      minimumStok: 10,
      birimFiyat: 0,
      tedarikci: '',
      notlar: ''
    });
  };

  const getStokDurumuBadge = (malzeme) => {
    if (malzeme.stok === 0) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Tükendi</span>;
    } else if (malzeme.stok <= malzeme.minimumStok) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Kritik</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Yeterli</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Malzemeler</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm malzemelerin listesi ve stok durumu
          </p>
        </div>
        {isAdmin && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Yeni Malzeme
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Malzeme Adı
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Kategori
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Stok
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Birim
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Birim Fiyat
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Durum
                    </th>
                    {isAdmin && (
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">İşlemler</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {malzemeler.map((malzeme) => (
                    <tr key={malzeme._id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                        {malzeme.ad}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {malzeme.kategori}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {malzeme.stok}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {malzeme.birim}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ₺{malzeme.birimFiyat}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getStokDurumuBadge(malzeme)}
                      </td>
                      {isAdmin && (
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleEdit(malzeme)}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(malzeme._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingMalzeme ? 'Malzeme Düzenle' : 'Yeni Malzeme Ekle'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Malzeme Adı
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.ad}
                        onChange={(e) => setFormData({...formData, ad: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Kategori
                        </label>
                        <select
                          value={formData.kategori}
                          onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="icecek">İçecek</option>
                          <option value="yiyecek">Yiyecek</option>
                          <option value="temizlik">Temizlik</option>
                          <option value="diger">Diğer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Birim
                        </label>
                        <select
                          value={formData.birim}
                          onChange={(e) => setFormData({...formData, birim: e.target.value})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="adet">Adet</option>
                          <option value="paket">Paket</option>
                          <option value="kg">Kg</option>
                          <option value="litre">Litre</option>
                          <option value="kutu">Kutu</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Stok
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stok}
                          onChange={(e) => setFormData({...formData, stok: parseInt(e.target.value)})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Minimum Stok
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.minimumStok}
                          onChange={(e) => setFormData({...formData, minimumStok: parseInt(e.target.value)})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Birim Fiyat (₺)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.birimFiyat}
                        onChange={(e) => setFormData({...formData, birimFiyat: parseFloat(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tedarikçi
                      </label>
                      <input
                        type="text"
                        value={formData.tedarikci}
                        onChange={(e) => setFormData({...formData, tedarikci: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingMalzeme ? 'Güncelle' : 'Ekle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Malzemeler;