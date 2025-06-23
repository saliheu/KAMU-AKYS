import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Tuketim = () => {
  const [tuketimler, setTuketimler] = useState([]);
  const [malzemeler, setMalzemeler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    malzeme: '',
    miktar: 1,
    tur: 'tuketim',
    aciklama: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tuketimRes, malzemeRes] = await Promise.all([
        axios.get('/api/tuketim'),
        axios.get('/api/malzemeler')
      ]);
      setTuketimler(tuketimRes.data.data);
      setMalzemeler(malzemeRes.data.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tuketim', formData);
      toast.success(formData.tur === 'tuketim' ? 'Tüketim kaydedildi' : 'Stok girişi yapıldı');
      setShowModal(false);
      setFormData({ malzeme: '', miktar: 1, tur: 'tuketim', aciklama: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'İşlem başarısız');
    }
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
          <h1 className="text-2xl font-semibold text-gray-900">Tüketim Takibi</h1>
          <p className="mt-2 text-sm text-gray-700">
            Malzeme tüketim ve stok giriş kayıtları
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
          >
            Yeni Kayıt
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarih</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Malzeme</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Miktar</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tür</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Maliyet</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kaydeden</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tuketimler.map((tuketim) => (
              <tr key={tuketim._id}>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(tuketim.tarih).toLocaleString('tr-TR')}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  {tuketim.malzeme?.ad}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {tuketim.miktar} {tuketim.malzeme?.birim}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tuketim.tur === 'tuketim' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {tuketim.tur === 'tuketim' ? 'Tüketim' : 'Stok Girişi'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  ₺{tuketim.maliyet?.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {tuketim.kaydeden?.username}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                    Yeni Tüketim/Stok Kaydı
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        İşlem Türü
                      </label>
                      <select
                        value={formData.tur}
                        onChange={(e) => setFormData({...formData, tur: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="tuketim">Tüketim</option>
                        <option value="stok_girisi">Stok Girişi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Malzeme
                      </label>
                      <select
                        required
                        value={formData.malzeme}
                        onChange={(e) => setFormData({...formData, malzeme: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Seçiniz</option>
                        {malzemeler.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.ad} (Stok: {m.stok} {m.birim})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Miktar
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        required
                        value={formData.miktar}
                        onChange={(e) => setFormData({...formData, miktar: parseFloat(e.target.value)})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Açıklama
                      </label>
                      <textarea
                        value={formData.aciklama}
                        onChange={(e) => setFormData({...formData, aciklama: e.target.value})}
                        rows={3}
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
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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

export default Tuketim;