import { useAuth } from '../hooks/useAuth'

function Settings() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Ayarlar</h1>
        <p className="mt-1 text-sm text-gray-600">
          Sistem ayarlarını yönetin
        </p>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Profil Bilgileri</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500">Ad Soyad</label>
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">E-posta</label>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Departman</label>
            <p className="font-medium">{user?.department}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Rol</label>
            <p className="font-medium capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings