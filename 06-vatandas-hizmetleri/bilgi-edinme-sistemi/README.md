# Bilgi Edinme Sistemi

4982 sayılı Bilgi Edinme Hakkı Kanunu kapsamında vatandaşların kamu kurumlarından bilgi edinme taleplerini yönetmek için geliştirilmiş kapsamlı sistem.

## Özellikler

### Vatandaş Özellikleri
- ✅ Online bilgi edinme başvurusu
- ✅ Başvuru durumu takibi
- ✅ Belge yükleme ve indirme
- ✅ Başvuru geçmişi görüntüleme
- ✅ İtiraz ve şikayet sistemi
- ✅ SMS/E-posta bildirimleri

### Kurum Özellikleri
- ✅ Başvuru yönetimi ve atama
- ✅ Otomatik süre takibi
- ✅ Toplu işlem desteği
- ✅ Şablon yanıtlar
- ✅ İstatistik ve raporlama
- ✅ Kurum içi yönlendirme

### Sistem Özellikleri
- ✅ 4982 sayılı kanuna uyumlu süreç yönetimi
- ✅ Otomatik süre hesaplama (15+15 gün)
- ✅ Çoklu kurum desteği
- ✅ E-Devlet entegrasyonu hazırlığı
- ✅ Güvenli belge saklama
- ✅ Gelişmiş arama ve filtreleme

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis (önbellekleme)
- Socket.io (gerçek zamanlı)
- Bull Queue (arka plan işleri)
- JWT Authentication
- Multer (dosya yükleme)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- React Query
- Socket.io Client
- Chart.js

## Kurulum

### Backend
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanını oluşturun
createdb bilgi_edinme_db

# Sunucuyu başlatın
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Vatandaş kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/refresh` - Token yenileme
- `GET /api/auth/me` - Profil bilgileri

### Başvurular
- `GET /api/requests` - Başvuru listesi
- `GET /api/requests/:id` - Başvuru detayı
- `POST /api/requests` - Yeni başvuru
- `PUT /api/requests/:id` - Başvuru güncelleme
- `POST /api/requests/:id/respond` - Başvuru yanıtlama
- `POST /api/requests/:id/appeal` - İtiraz

### Kurumlar
- `GET /api/institutions` - Kurum listesi
- `GET /api/institutions/:id` - Kurum detayı
- `GET /api/institutions/:id/categories` - Kurum kategorileri

### Takip
- `GET /api/tracking/:trackingCode` - Başvuru takibi
- `POST /api/tracking/status` - Durum sorgulama

### İstatistikler
- `GET /api/statistics/dashboard` - Dashboard verileri
- `GET /api/statistics/reports` - Raporlar
- `GET /api/statistics/performance` - Performans metrikleri

### Yönetim
- `GET /api/admin/users` - Kullanıcı yönetimi
- `GET /api/admin/settings` - Sistem ayarları
- `POST /api/admin/templates` - Şablon yönetimi

## Başvuru Süreçleri

### Standart Süreç
1. Vatandaş başvuru yapar
2. Sistem otomatik olarak ilgili kuruma yönlendirir
3. Kurum yetkilisi başvuruyu inceler
4. 15 iş günü içinde yanıt verilir
5. Gerekirse 15 gün ek süre alınabilir

### İtiraz Süreci
1. Vatandaş yanıta itiraz edebilir
2. İtiraz üst makama yönlendirilir
3. 15 gün içinde değerlendirilir
4. Nihai karar bildirilir

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı erişim kontrolü
- Rate limiting
- Güvenli dosya yükleme
- KVKK uyumlu veri saklama
- İşlem logları

## Varsayılan Kullanıcılar

### Vatandaş
- TC: 11111111111
- Şifre: Vatandas123!

### Kurum Yetkilisi
- Email: yetkili@kurum.gov.tr
- Şifre: Yetkili123!

### Admin
- Email: admin@bilgiedinme.gov.tr
- Şifre: Admin123!

## Lisans

MIT