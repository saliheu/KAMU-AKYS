# Zabıta Yönetim ve Denetim Sistemi

Belediye zabıta hizmetlerinin dijital yönetimi, saha denetimi, ceza kesme ve vatandaş şikayetlerini yöneten kapsamlı bir belediye hizmetleri platformu.

## Özellikler

### Zabıta Memuru Özellikleri
- **Mobil Denetim**: Saha denetimi ve tutanak oluşturma
- **Ceza Kesme**: Dijital ceza kesme ve makbuz düzenleme
- **Fotoğraf/Video**: Denetim kanıt toplama
- **GPS Takip**: Gerçek zamanlı konum takibi
- **Görev Yönetimi**: Günlük görev ve rota planlaması
- **Offline Çalışma**: İnternet olmadan tutanak oluşturma

### Denetim Yönetimi
- **İşyeri Denetimi**: Ruhsat, hijyen ve fiyat denetimi
- **Seyyar Satıcı**: Seyyar satıcı takip ve denetimi
- **Pazar Yeri**: Pazar yeri düzen ve denetimi
- **Çevre Denetimi**: Çevre kirliliği ve atık denetimi
- **İmar Denetimi**: Kaçak yapı ve tadilat denetimi
- **Gürültü Kontrolü**: Gürültü ölçümü ve denetimi

### Vatandaş Hizmetleri
- **Şikayet/İhbar**: Online şikayet ve ihbar sistemi
- **Ceza Sorgulama**: Ceza borç sorgulama ve ödeme
- **İşyeri Ruhsatı**: Ruhsat başvuru ve takibi
- **Kayıp Eşya**: Kayıp eşya bildirimi ve sorgulama
- **Bilgi Edinme**: Zabıta hizmetleri hakkında bilgi

### Ceza ve Tahsilat
- **E-Ceza**: Dijital ceza kesme sistemi
- **QR Kodlu Makbuz**: QR kod ile ceza sorgulama
- `Online Ödeme`: Kredi kartı ile ceza ödemesi
- **Taksitlendirme**: Ceza taksitlendirme imkanı
- **İtiraz Sistemi**: Online ceza itirazı

### Yönetim Paneli
- **Harita Görünümü**: Denetim ve ekip harita takibi
- **Performans Takibi**: Ekip ve memur performansı
- **İstatistikler**: Denetim ve ceza istatistikleri
- **Raporlama**: Detaylı faaliyet raporları
- **Vardiya Yönetimi**: Ekip ve vardiya planlaması

### Entegre Sistemler
- **E-Belediye**: Belediye sistemleri entegrasyonu
- **Nüfus Müdürlüğü**: TC kimlik doğrulama
- **Tapu Müdürlüğü**: Mülkiyet sorgulama
- **Vergi Dairesi**: Vergi borç sorgulama
- **Emniyet**: Güvenlik koordinasyonu

## Teknolojiler

### Backend
- Node.js & Express.js
- PostgreSQL + PostGIS
- Redis önbellekleme
- JWT kimlik doğrulama
- Socket.io (gerçek zamanlı)
- Bull (iş kuyruğu)
- Sharp (görüntü işleme)

### Frontend
- React.js
- Material-UI
- Redux state yönetimi
- React Query
- Leaflet (harita)
- PWA (Progressive Web App)
- IndexedDB (offline veri)

### Mobil
- React Native
- Expo
- AsyncStorage
- React Native Maps
- Camera API

### DevOps
- Docker & Kubernetes
- GitHub Actions CI/CD
- Prometheus & Grafana
- ELK Stack

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Zabıta memuru girişi
- `POST /api/auth/citizen-login` - Vatandaş girişi
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### Denetim İşlemleri
- `GET /api/inspections` - Denetim listesi
- `POST /api/inspections` - Yeni denetim
- `GET /api/inspections/:id` - Denetim detayı
- `PUT /api/inspections/:id` - Denetim güncelleme
- `POST /api/inspections/:id/photos` - Fotoğraf ekleme

### Ceza İşlemleri
- `POST /api/penalties` - Ceza kesme
- `GET /api/penalties/:id` - Ceza detayı
- `GET /api/penalties/qr/:code` - QR kod sorgulama
- `POST /api/penalties/:id/pay` - Ceza ödeme
- `POST /api/penalties/:id/appeal` - Ceza itirazı

### Şikayet Yönetimi
- `GET /api/complaints` - Şikayet listesi
- `POST /api/complaints` - Yeni şikayet
- `GET /api/complaints/:id` - Şikayet detayı
- `PUT /api/complaints/:id/assign` - Şikayet atama
- `PUT /api/complaints/:id/resolve` - Şikayet kapatma

### İşyeri İşlemleri
- `GET /api/businesses` - İşyeri listesi
- `GET /api/businesses/:id` - İşyeri detayı
- `POST /api/businesses/license` - Ruhsat başvurusu
- `GET /api/businesses/:id/inspections` - İşyeri denetimleri
- `GET /api/businesses/:id/penalties` - İşyeri cezaları

### Ekip Yönetimi
- `GET /api/teams` - Ekip listesi
- `POST /api/teams` - Yeni ekip oluştur
- `GET /api/teams/:id/location` - Ekip konumu
- `POST /api/teams/:id/assign` - Görev atama
- `GET /api/teams/:id/performance` - Ekip performansı

### Görev Yönetimi
- `GET /api/tasks` - Görev listesi
- `POST /api/tasks` - Yeni görev oluştur
- `GET /api/tasks/:id` - Görev detayı
- `PUT /api/tasks/:id/status` - Görev durumu güncelle
- `POST /api/tasks/:id/report` - Görev raporu

### Harita Servisleri
- `GET /api/map/inspections` - Denetim noktaları
- `GET /api/map/teams` - Ekip konumları
- `GET /api/map/complaints` - Şikayet konumları
- `POST /api/map/route` - Rota planlama
- `GET /api/map/heatmap` - Yoğunluk haritası

### Raporlama
- `GET /api/reports/daily` - Günlük rapor
- `GET /api/reports/penalties` - Ceza raporları
- `GET /api/reports/inspections` - Denetim raporları
- `GET /api/reports/performance` - Performans raporu
- `GET /api/reports/revenue` - Tahsilat raporu

### Bildirimler
- `GET /api/notifications` - Bildirim listesi
- `POST /api/notifications/send` - Bildirim gönder
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `POST /api/notifications/broadcast` - Toplu bildirim

## Kurulum

```bash
# Backend kurulumu
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev

# Frontend kurulumu
cd frontend
npm install
npm start

# Mobil uygulama
cd mobile
npm install
expo start
```

## Çevre Değişkenleri

```env
# Veritabanı
DATABASE_URL=postgresql://user:password@localhost:5432/zabita_yonetim

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=8h

# Harita
GOOGLE_MAPS_API_KEY=your-maps-key
MAPBOX_ACCESS_TOKEN=your-mapbox-token

# SMS
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+905551234567

# E-posta
SMTP_HOST=smtp.belediye.gov.tr
SMTP_PORT=587
SMTP_USER=zabita@belediye.gov.tr
SMTP_PASS=your-password

# Dosya Yükleme
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Pusher (Gerçek zamanlı)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=eu

# E-Belediye API
EBELEDIYE_API_URL=https://api.belediye.gov.tr
EBELEDIYE_API_KEY=your-api-key
```

## Güvenlik Özellikleri

- HTTPS zorunluluğu
- Rate limiting
- SQL injection koruması
- XSS koruması
- CORS politikaları
- Veri şifreleme
- KVKK uyumluluğu
- Rol tabanlı yetkilendirme
- IP kısıtlaması

## Mobil Özellikler

- Offline çalışma modu
- GPS takip
- Kamera entegrasyonu
- Push bildirimler
- Barkod/QR okuyucu
- Ses kaydı
- El yazısı imza
- Bluetooth yazıcı desteği

## Test

```bash
# Unit testler
npm test

# Integration testler
npm run test:integration

# E2E testler
npm run test:e2e

# Mobil testler
npm run test:mobile

# Coverage raporu
npm run test:coverage
```

## Lisans

MIT