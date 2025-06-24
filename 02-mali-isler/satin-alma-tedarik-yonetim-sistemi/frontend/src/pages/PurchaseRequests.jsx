import { useState } from 'react'
import { useQuery } from 'react-query'
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'

function PurchaseRequests() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data, isLoading, refetch } = useQuery('purchase-requests', async () => {
    const params = new URLSearchParams()
    if (searchTerm) params.append('search', searchTerm)
    if (statusFilter) params.append('status', statusFilter)
    
    const response = await api.get(`/purchase-requests?${params}`)
    return response.data
  })

  const statusColors = {
    taslak: 'bg-gray-100 text-gray-800',
    onay_bekliyor: 'bg-yellow-100 text-yellow-800',
    onaylandi: 'bg-green-100 text-green-800',
    reddedildi: 'bg-red-100 text-red-800',
    ihale_asamasinda: 'bg-blue-100 text-blue-800',
    tamamlandi: 'bg-purple-100 text-purple-800',
    iptal: 'bg-gray-100 text-gray-800'
  }

  const statusLabels = {
    taslak: 'Taslak',
    onay_bekliyor: 'Onay Bekliyor',
    onaylandi: 'Onaylandı',
    reddedildi: 'Reddedildi',
    ihale_asamasinda: 'İhale Aşamasında',
    tamamlandi: 'Tamamlandı',
    iptal: 'İptal'
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Satın Alma Talepleri</h1>
          <p className="mt-1 text-sm text-gray-600">
            Tüm satın alma taleplerini görüntüleyin ve yönetin
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Talep
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Ara</label>
            <div className="relative">
              <input
                type="text"
                className="input pl-10"
                placeholder="Talep no, başlık..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="label">Durum</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tümü</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={refetch} className="btn btn-secondary">
              <Filter className="h-5 w-5 mr-2" />
              Filtrele
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Talep No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departman
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tahmini Bütçe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : data?.requests?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Talep bulunamadı
                  </td>
                </tr>
              ) : (
                data?.requests?.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.requestNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{parseFloat(request.estimatedBudget).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="h-5 w-5" />
                        </button>
                        {request.status === 'taslak' && (
                          <>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PurchaseRequests