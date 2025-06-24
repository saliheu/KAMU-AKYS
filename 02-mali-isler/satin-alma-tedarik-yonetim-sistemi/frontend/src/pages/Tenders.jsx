import { useState } from 'react'
import { useQuery } from 'react-query'
import { Calendar, Users, DollarSign, FileText } from 'lucide-react'
import api from '../services/api'

function Tenders() {
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery(['tenders', statusFilter], async () => {
    const params = new URLSearchParams()
    if (statusFilter) params.append('status', statusFilter)
    
    const response = await api.get(`/tenders?${params}`)
    return response.data
  })

  const statusColors = {
    hazirlaniyor: 'bg-gray-100 text-gray-800',
    ilan_edildi: 'bg-blue-100 text-blue-800',
    teklif_toplama: 'bg-yellow-100 text-yellow-800',
    degerlendirme: 'bg-purple-100 text-purple-800',
    sonuclandi: 'bg-green-100 text-green-800',
    iptal: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    hazirlaniyor: 'Hazırlanıyor',
    ilan_edildi: 'İlan Edildi',
    teklif_toplama: 'Teklif Toplama',
    degerlendirme: 'Değerlendirme',
    sonuclandi: 'Sonuçlandı',
    iptal: 'İptal'
  }

  const methodLabels = {
    acik_ihale: 'Açık İhale',
    kapali_zarf: 'Kapalı Zarf',
    pazarlik_usulu: 'Pazarlık Usulü',
    dogrudan_temin: 'Doğrudan Temin'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">İhaleler</h1>
        <p className="mt-1 text-sm text-gray-600">
          Aktif ve tamamlanmış ihaleleri görüntüleyin
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Durum:</label>
          <select
            className="input max-w-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tümü</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenders List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Yükleniyor...
          </div>
        ) : data?.tenders?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            İhale bulunamadı
          </div>
        ) : (
          data?.tenders?.map((tender) => (
            <div key={tender.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {tender.tenderNumber}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[tender.status]}`}>
                      {statusLabels[tender.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {tender.purchaseRequest?.title}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {methodLabels[tender.tenderMethod]}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <div>
                    <p className="text-gray-500">İlan Tarihi</p>
                    <p className="font-medium">
                      {new Date(tender.announcementDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Son Teklif</p>
                    <p className="font-medium">
                      {new Date(tender.deadlineDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Tahmini Bedel</p>
                    <p className="font-medium">
                      ₺{parseFloat(tender.estimatedValue).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="h-5 w-5 mr-2 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Katılımcı</p>
                    <p className="font-medium">{tender.participants?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-3">
                <button className="btn btn-secondary text-sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Dokümanlar
                </button>
                <button className="btn btn-primary text-sm">
                  Detaylar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Tenders