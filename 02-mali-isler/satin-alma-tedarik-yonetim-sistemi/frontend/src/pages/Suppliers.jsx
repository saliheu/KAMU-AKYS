import { useState } from 'react'
import { useQuery } from 'react-query'
import { Plus, Search, Building2, Mail, Phone, Star } from 'lucide-react'
import api from '../services/api'

function Suppliers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const { data, isLoading } = useQuery(['suppliers', searchTerm, categoryFilter], async () => {
    const params = new URLSearchParams()
    if (searchTerm) params.append('search', searchTerm)
    if (categoryFilter) params.append('category', categoryFilter)
    
    const response = await api.get(`/suppliers?${params}`)
    return response.data
  })

  const categoryLabels = {
    malzeme: 'Malzeme',
    hizmet: 'Hizmet',
    yapim: 'Yapım'
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tedarikçiler</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kayıtlı tedarikçileri görüntüleyin ve yönetin
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Yeni Tedarikçi
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="label">Ara</label>
            <div className="relative">
              <input
                type="text"
                className="input pl-10"
                placeholder="Firma adı, vergi no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="label">Kategori</label>
            <select
              className="input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tümü</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Yükleniyor...
          </div>
        ) : data?.suppliers?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            Tedarikçi bulunamadı
          </div>
        ) : (
          data?.suppliers?.map((supplier) => (
            <div key={supplier.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {supplier.companyName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    VN: {supplier.taxNumber}
                  </p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  supplier.category === 'malzeme' ? 'bg-blue-100 text-blue-800' :
                  supplier.category === 'hizmet' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {categoryLabels[supplier.category]}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                  {supplier.city} / {supplier.district}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {supplier.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {supplier.email}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {supplier.rating || '0.0'}
                  </span>
                </div>
                <button className="text-sm text-primary-600 hover:text-primary-900 font-medium">
                  Detaylar →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Suppliers