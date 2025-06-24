# Afet Koordinasyon Merkezi

Bu modül **afet acil durum** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **afet koordinasyon merkezi** projesidir.

## 🎯 Proje Hakkında

Afet Koordinasyon Merkezi, doğal afetler ve acil durumlar sırasında kamu kurumları, sivil toplum kuruluşları, gönüllüler ve vatandaşlar arasındaki koordinasyonu sağlayan merkezi bir yönetim platformudur. Sistem, gerçek zamanlı veri akışı, kaynak yönetimi, haberleşme ve karar destek mekanizmaları ile afet müdahalesini optimize eder.

## ✨ Özellikler

### Temel Özellikler
- ✅ Gerçek zamanlı afet durumu haritası ve takibi
- ✅ Çoklu kurum koordinasyon paneli
- ✅ Kaynak ve lojistik yönetimi
- ✅ Gönüllü ve personel koordinasyonu
- ✅ Acil durum haberleşme sistemi
- ✅ Vatandaş yardım talebi ve bildirimi
- ✅ Toplanma alanları ve güvenli bölge yönetimi
- ✅ Arama kurtarma ekipleri takibi
- ✅ İhtiyaç listesi ve yardım eşleştirme
- ✅ Afet sonrası hasar tespit ve raporlama
- ✅ Erken uyarı sistem entegrasyonu
- ✅ Medya ve halkla ilişkiler yönetimi

### Teknik Özellikler
- WebSocket ile gerçek zamanlı iletişim
- Offline çalışma desteği (PWA)
- Çoklu dil desteği
- Harita tabanlı görselleştirme
- Push notification desteği
- SMS ve e-posta entegrasyonu
- Drone görüntü işleme desteği
- IoT sensör entegrasyonu
- Makine öğrenmesi ile tahminleme

## 🛠️ Teknoloji Yığını

### Backend
- **Node.js** (v18+) - Server runtime
- **Express.js** - Web framework
- **PostgreSQL** - Ana veritabanı
- **PostGIS** - Coğrafi veri desteği
- **Redis** - Cache ve real-time data
- **Socket.io** - WebSocket iletişim
- **Bull** - Job queue yönetimi
- **JWT** - Kimlik doğrulama
- **Twilio** - SMS entegrasyonu
- **WebRTC** - Video konferans

### Frontend
- **React** (v18+) - UI library
- **Redux Toolkit** - State yönetimi
- **Material-UI** - Component library
- **Mapbox GL JS** - Harita görselleştirme
- **Socket.io Client** - Real-time updates
- **React Query** - Server state yönetimi
- **Workbox** - PWA ve offline desteği
- **Chart.js** - Grafikler

### DevOps
- **Docker** & **Docker Compose**
- **Kubernetes** - Container orchestration
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD
- **Prometheus** & **Grafana** - Monitoring

## 📋 Gereksinimler

- Docker ve Docker Compose
- Node.js 18+ (lokal geliştirme için)
- PostgreSQL 15+ with PostGIS (lokal geliştirme için)
- Redis (lokal geliştirme için)
- Mapbox API anahtarı (harita servisleri için)

## 🚀 Hızlı Başlangıç

### Docker ile Kurulum (Önerilen)

1. Repoyu klonlayın:
```bash
git clone https://github.com/kullaniciadi/afet-koordinasyon-merkezi.git
cd afet-koordinasyon-merkezi
```

2. Environment dosyasını oluşturun:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Docker Compose ile servisleri başlatın:
```bash
docker-compose up -d
```

4. Tarayıcınızda açın:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

### Test Hesapları
- **Koordinatör:** koordinator@afad.gov.tr / Afad123!
- **İl Yöneticisi:** yonetici@istanbul.gov.tr / Istanbul123!
- **STK Temsilcisi:** stk@kizilay.org.tr / Kizilay123!

## 📁 Proje Yapısı

```
afet-koordinasyon-merkezi/
├── backend/
│   ├── src/
│   │   ├── config/         # Yapılandırma dosyaları
│   │   ├── controllers/    # İş mantığı
│   │   ├── models/         # Veritabanı modelleri
│   │   ├── routes/         # API rotaları
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Servis katmanı
│   │   ├── utils/          # Yardımcı fonksiyonlar
│   │   ├── workers/        # Background işler
│   │   └── websocket/      # Socket.io handlers
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── services/       # API servisleri
│   │   ├── store/          # Redux store
│   │   ├── hooks/          # Custom React hooks
│   │   ├── maps/           # Harita bileşenleri
│   │   └── utils/          # Yardımcı fonksiyonlar
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── mobile/                 # React Native mobil uygulama
├── database/
│   ├── migrations/         # Veritabanı migrations
│   └── seeders/           # Test verileri
├── docs/                   # API dokümantasyonu
└── docker-compose.yml
```

## 🔧 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/logout` - Çıkış yap
- `POST /api/auth/refresh-token` - Token yenile
- `GET /api/auth/profile` - Profil bilgileri

### Afet Yönetimi
- `GET /api/disasters` - Aktif afetleri listele
- `POST /api/disasters` - Yeni afet tanımla
- `PUT /api/disasters/:id` - Afet durumu güncelle
- `GET /api/disasters/:id/map` - Afet haritası

### Kaynak Yönetimi
- `GET /api/resources` - Mevcut kaynakları listele
- `POST /api/resources/request` - Kaynak talebi oluştur
- `PUT /api/resources/:id/allocate` - Kaynak tahsis et
- `GET /api/resources/inventory` - Envanter durumu

### Personel ve Gönüllü
- `GET /api/personnel` - Personel listesi
- `POST /api/personnel/deploy` - Personel görevlendir
- `GET /api/volunteers` - Gönüllü listesi
- `POST /api/volunteers/register` - Gönüllü kaydı

### Yardım Talepleri
- `GET /api/help-requests` - Yardım talepleri
- `POST /api/help-requests` - Yeni talep oluştur
- `PUT /api/help-requests/:id/assign` - Talep ata
- `PUT /api/help-requests/:id/complete` - Talebi tamamla

### Raporlama
- `GET /api/reports/dashboard` - Dashboard verileri
- `GET /api/reports/statistics` - İstatistikler
- `POST /api/reports/generate` - Rapor oluştur
- `GET /api/reports/export/:format` - Rapor dışa aktar

### WebSocket Events
- `disaster:update` - Afet durumu güncellemesi
- `resource:request` - Kaynak talebi
- `help:new` - Yeni yardım talebi
- `team:location` - Ekip konum güncellemesi
- `alert:broadcast` - Acil durum uyarısı

## 🔐 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- API rate limiting
- Request validation ve sanitization
- SQL injection koruması
- XSS koruması
- HTTPS zorunluluğu
- Audit logging
- Encrypted data storage

## 📊 Kullanıcı Rolleri

1. **Süper Admin** - Sistem yönetimi
2. **Koordinatör** - Afet koordinasyonu
3. **İl Yöneticisi** - İl bazlı yönetim
4. **Kurum Yetkilisi** - Kurum kaynakları
5. **STK Temsilcisi** - STK koordinasyonu
6. **Saha Görevlisi** - Saha operasyonları
7. **Gönüllü** - Gönüllü faaliyetleri
8. **Vatandaş** - Yardım talebi ve bildirim

## 🚨 Afet Türleri

Sistem aşağıdaki afet türlerini destekler:
- Deprem
- Sel
- Yangın
- Heyelan
- Çığ
- Fırtına
- Tsunami
- Pandemi
- KBRN (Kimyasal, Biyolojik, Radyolojik, Nükleer)
- Terör Saldırısı

## 🧪 Test

```bash
# Backend testleri
cd backend
npm test
npm run test:coverage

# Frontend testleri
cd frontend
npm test
npm run test:e2e
```

## 📈 Performans

- Redis cache ile optimizasyon
- Database connection pooling
- Lazy loading ve code splitting
- Image optimization ve CDN
- WebSocket connection management
- Horizontal scaling desteği

## 🌍 Çevre Değişkenleri

Backend için gerekli environment değişkenleri:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/afet_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
MAPBOX_ACCESS_TOKEN=your-mapbox-token
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

## 🤝 Katkıda Bulunma

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

Bu proje, Türkiye'nin afet müdahale kapasitesini güçlendirmek ve afetzedelere daha hızlı ulaşmak amacıyla geliştirilmiştir.