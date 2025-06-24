# Atık Yönetim ve Takip Sistemi

Bu modül **sıfır atık** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **atık yönetim ve takip sistemi** projesidir.

## 🎯 Proje Hakkında

Bu proje, kamu kurumlarının Sıfır Atık hedeflerine ulaşması için atık üretimi, ayrıştırma, toplama ve bertaraf süreçlerinin dijital ortamda takip edilmesini sağlayan kapsamlı bir yönetim sistemidir.

## ✨ Özellikler

### Temel Özellikler
- ✅ Atık türü tanımlama ve kategorilendirme
- ✅ Atık üretim noktaları yönetimi
- ✅ Günlük/haftalık/aylık atık miktarı girişi
- ✅ Atık ayrıştırma oranları takibi
- ✅ Geri dönüşüm ve geri kazanım takibi
- ✅ QR kod ile atık konteyneri takibi
- ✅ Mobil uygulama desteği
- ✅ Raporlama ve analitik dashboard
- ✅ Mevzuata uygunluk kontrolü
- ✅ Bildirim ve hatırlatma sistemi
- ✅ Çevre Bakanlığı entegrasyonu
- ✅ Atık bertaraf firmalarıyla entegrasyon

### Teknik Özellikler
- RESTful API mimarisi
- JWT tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- Real-time updates (Socket.io)
- Message queue (RabbitMQ)
- Background jobs ve scheduler
- IoT sensör desteği
- QR kod okuma/oluşturma
- Responsive tasarım

## 🛠️ Teknoloji Yığını

### Backend
- **Node.js** (v18+) - Server runtime
- **Express.js** - Web framework
- **PostgreSQL** - Ana veritabanı
- **Sequelize** - ORM
- **Redis** - Cache ve session yönetimi
- **RabbitMQ** - Message queue
- **Socket.io** - Real-time iletişim
- **JWT** - Kimlik doğrulama
- **Bcrypt** - Şifre güvenliği
- **Node-cron** - Zamanlanmış görevler

### Frontend
- **React** (v18+) - UI library
- **Material-UI** - Component library
- **React Router** - Routing
- **React Query** - Server state yönetimi
- **React Hook Form** - Form yönetimi
- **Socket.io Client** - Real-time updates
- **Recharts** - Grafikler
- **date-fns** - Tarih işlemleri

### DevOps
- **Docker** & **Docker Compose**
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD

## 📋 Gereksinimler

- Docker ve Docker Compose
- Node.js 18+ (lokal geliştirme için)
- PostgreSQL 15+ (lokal geliştirme için)
- Redis (lokal geliştirme için)
- RabbitMQ (lokal geliştirme için)

## 🚀 Hızlı Başlangıç

### Docker ile Kurulum (Önerilen)

1. Repoyu klonlayın:
```bash
git clone https://github.com/kullaniciadi/atik-yonetim-takip-sistemi.git
cd atik-yonetim-takip-sistemi
```

2. Environment dosyasını oluşturun:
```bash
cp backend/.env.example backend/.env
```

3. Docker Compose ile servisleri başlatın:
```bash
docker-compose up -d
```

4. Tarayıcınızda açın:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- RabbitMQ Management: http://localhost:15672

### Test Hesabı
- E-posta: admin@sifiratik.gov.tr
- Şifre: Admin123!

## 📁 Proje Yapısı

```
atik-yonetim-takip-sistemi/
├── backend/
│   ├── src/
│   │   ├── config/         # Yapılandırma dosyaları
│   │   ├── controllers/    # İş mantığı
│   │   ├── models/         # Veritabanı modelleri
│   │   ├── routes/         # API rotaları
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Servis katmanı
│   │   ├── utils/          # Yardımcı fonksiyonlar
│   │   └── workers/        # Background işler
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── services/       # API servisleri
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React context
│   │   └── theme/          # MUI tema
│   ├── Dockerfile
│   └── package.json
├── mobile/                 # React Native mobil uygulama
├── database/
│   └── init.sql           # Veritabanı başlangıç scripti
├── docs/                   # Dokümantasyon
└── docker-compose.yml
```

## 🔧 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/logout` - Çıkış yap
- `POST /api/auth/refresh-token` - Token yenile

### Atık Girişleri
- `GET /api/waste-entries` - Atık girişlerini listele
- `POST /api/waste-entries` - Yeni atık girişi
- `POST /api/waste-entries/qr-scan` - QR kod ile giriş
- `POST /api/waste-entries/bulk` - Toplu giriş
- `GET /api/waste-entries/stats/summary` - İstatistikler

### Atık Noktaları
- `GET /api/waste-points` - Atık noktalarını listele
- `POST /api/waste-points` - Yeni atık noktası
- `PUT /api/waste-points/:id` - Atık noktası güncelle
- `GET /api/waste-points/:id/qr` - QR kod oluştur

### Toplama İşlemleri
- `GET /api/collections` - Toplama işlemlerini listele
- `POST /api/collections` - Yeni toplama planla
- `PUT /api/collections/:id/complete` - Toplamayı tamamla

### Raporlar
- `GET /api/reports` - Raporları listele
- `POST /api/reports/generate` - Rapor oluştur
- `POST /api/reports/:id/submit` - Bakanlığa gönder

## 🔐 Kullanıcı Rolleri

1. **Admin** - Tam yetki
2. **Yönetici** - Kurum yönetimi ve onaylama yetkisi
3. **Sorumlu** - Atık noktası ve giriş yönetimi
4. **Personel** - Atık girişi ve görüntüleme

## 📊 Veritabanı Şeması

Sistem aşağıdaki ana tablolardan oluşur:
- **Users** - Kullanıcı bilgileri
- **Institutions** - Kurum bilgileri
- **WastePoints** - Atık toplama noktaları
- **WasteContainers** - Atık konteynerleri
- **WasteEntries** - Atık giriş kayıtları
- **WasteCollections** - Toplama işlemleri
- **RecyclingCompanies** - Geri dönüşüm firmaları
- **Reports** - Raporlar

## 🧪 Test

```bash
# Backend testleri
cd backend
npm test

# Frontend testleri
cd frontend
npm test
```

## 📈 Performans

- Redis cache ile hızlı veri erişimi
- Message queue ile asenkron işlemler
- Database indexing ve query optimization
- Lazy loading ve pagination
- Real-time updates sadece ilgili kullanıcılara

## 🔒 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- Rate limiting
- CORS koruması
- SQL injection koruması
- XSS koruması
- Input validation
- Role-based access control

## 🌍 Çevre Değişkenleri

Backend için gerekli environment değişkenleri:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://user:pass@localhost:5672
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
```

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'e push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında yayınlanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için issue açabilir veya proje ekibiyle iletişime geçebilirsiniz.

## 🙏 Teşekkürler

Bu proje, Türkiye'nin 2030 Sıfır Atık hedeflerine ulaşmasına katkı sağlamak amacıyla geliştirilmiştir.