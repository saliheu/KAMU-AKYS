# Müze ve Ören Yeri Yönetim Sistemi

Kültür ve Turizm Bakanlığı için geliştirilmiş, müze ve ören yerlerinin dijital yönetimi, ziyaretçi deneyimi ve envanter takibini sağlayan kapsamlı bir platform.

## Özellikler

### Ziyaretçi Özellikleri
- **Online Bilet**: QR kodlu online bilet satın alma
- **Sanal Tur**: 360° sanal müze turları
- **Mobil Rehber**: Sesli rehberlik ve AR deneyimi
- **Eser Bilgileri**: Detaylı eser açıklamaları ve hikayeleri
- **Etkinlik Takvimi**: Sergiler, atölyeler ve etkinlikler
- **Müze Kartı**: Dijital müze kartı ve indirimler

### Müze Yönetimi
- **Envanter Yönetimi**: Eser kayıt ve takip sistemi
- **Ziyaretçi Analizi**: Detaylı ziyaretçi istatistikleri
- **Bilet Yönetimi**: Kota ve fiyat yönetimi
- **Güvenlik Sistemi**: Eser güvenlik ve alarm yönetimi
- **Personel Yönetimi**: Vardiya ve görev atamaları
- **Bakım Takibi**: Eser bakım ve restorasyon takibi

### Dijital Deneyim
- **AR/VR Uygulamaları**: Artırılmış gerçeklik deneyimleri
- **3D Modelleme**: Eserlerin 3D görüntüleme
- **Interaktif Haritalar**: Müze içi navigasyon
- **Oyunlaştırma**: Çocuklar için eğitici oyunlar
- **Sosyal Medya**: Paylaşım ve etiketleme özellikleri

### Eser Yönetimi
- **Dijital Arşiv**: Yüksek çözünürlüklü eser görüntüleri
- **Kataloglama**: Uluslararası standartlarda katalog
- **Koruma Planı**: Eser koruma ve izleme
- **Geçici Sergiler**: Geçici sergi yönetimi
- **Eser Transferi**: Müzeler arası eser transferi

### Yönetici Özellikleri
- **Dashboard**: Gerçek zamanlı yönetim paneli
- **Raporlama**: Detaylı performans raporları
- **Entegrasyon**: Bakanlık sistemleri entegrasyonu
- **Bütçe Yönetimi**: Gelir-gider takibi
- **İstatistikler**: Ziyaretçi ve gelir analizleri

## Teknolojiler

### Backend
- Node.js & Express.js
- PostgreSQL veritabanı
- Redis önbellekleme
- JWT kimlik doğrulama
- AWS S3 (medya depolama)
- Three.js (3D rendering)
- Sharp (görüntü işleme)

### Frontend
- React.js
- Material-UI
- Redux state yönetimi
- Three.js/React Three Fiber
- Mapbox GL JS
- AR.js
- Chart.js

### DevOps
- Docker & Kubernetes
- GitHub Actions CI/CD
- Prometheus & Grafana
- ELK Stack
- CDN (medya dağıtımı)

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Yeni üyelik
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### Müze ve Ören Yerleri
- `GET /api/museums` - Müze listesi
- `GET /api/museums/:id` - Müze detayı
- `GET /api/museums/:id/virtual-tour` - Sanal tur
- `GET /api/museums/:id/map` - Müze haritası
- `GET /api/museums/nearby` - Yakındaki müzeler

### Biletleme
- `GET /api/tickets/types` - Bilet türleri ve fiyatlar
- `POST /api/tickets/purchase` - Bilet satın alma
- `GET /api/tickets/:id` - Bilet detayı
- `POST /api/tickets/:id/validate` - Bilet doğrulama
- `GET /api/tickets/my-tickets` - Biletlerim

### Eserler
- `GET /api/artifacts` - Eser listesi
- `GET /api/artifacts/:id` - Eser detayı
- `GET /api/artifacts/:id/3d-model` - 3D model
- `GET /api/artifacts/:id/audio-guide` - Sesli rehber
- `POST /api/artifacts/:id/favorite` - Favorilere ekle

### Etkinlikler
- `GET /api/events` - Etkinlik takvimi
- `GET /api/events/:id` - Etkinlik detayı
- `POST /api/events/:id/register` - Etkinlik kaydı
- `GET /api/workshops` - Atölye programları

### Müze Kartı
- `POST /api/museum-card/apply` - Müze kartı başvurusu
- `GET /api/museum-card/benefits` - Kart avantajları
- `POST /api/museum-card/renew` - Kart yenileme
- `GET /api/museum-card/usage` - Kullanım geçmişi

### Envanter Yönetimi (Admin)
- `GET /api/inventory` - Envanter listesi
- `POST /api/inventory/artifact` - Yeni eser kaydı
- `PUT /api/inventory/artifact/:id` - Eser güncelleme
- `POST /api/inventory/condition-report` - Durum raporu
- `GET /api/inventory/restoration` - Restorasyon takibi

### Ziyaretçi Analizi
- `GET /api/analytics/visitors` - Ziyaretçi istatistikleri
- `GET /api/analytics/revenue` - Gelir analizleri
- `GET /api/analytics/popular-artifacts` - Popüler eserler
- `GET /api/analytics/visitor-flow` - Ziyaretçi akışı

### Sanal Deneyim
- `GET /api/ar/markers` - AR işaretçileri
- `GET /api/vr/experiences` - VR deneyimleri
- `POST /api/social/share` - Sosyal medya paylaşımı
- `GET /api/games/educational` - Eğitici oyunlar

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
```

## Çevre Değişkenleri

```env
# Veritabanı
DATABASE_URL=postgresql://user:password@localhost:5432/muze_yonetim

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=muze-medya
AWS_REGION=eu-central-1

# Ödeme Sistemi
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Harita
MAPBOX_ACCESS_TOKEN=your-mapbox-token

# E-posta
SMTP_HOST=smtp.kulturturizm.gov.tr
SMTP_PORT=587
SMTP_USER=noreply@muze.gov.tr
SMTP_PASS=your-password

# Bakanlık API
MINISTRY_API_URL=https://api.ktb.gov.tr
MINISTRY_API_KEY=your-api-key

# CDN
CDN_URL=https://cdn.muze.gov.tr
```

## Güvenlik Özellikleri

- HTTPS zorunluluğu
- Rate limiting
- SQL injection koruması
- XSS koruması
- CORS politikaları
- Veri şifreleme
- KVKK uyumluluğu
- Güvenlik kameraları entegrasyonu
- Eser takip sistemi

## Özel Özellikler

### Çoklu Dil Desteği
- Türkçe
- İngilizce
- Almanca
- Fransızca
- Arapça
- Rusça

### Erişilebilirlik
- Görme engelliler için sesli rehber
- İşitme engelliler için işaret dili
- Tekerlekli sandalye rotaları
- Braille açıklamalar

## Test

```bash
# Unit testler
npm test

# Integration testler
npm run test:integration

# E2E testler
npm run test:e2e

# Performance testler
npm run test:performance

# Coverage raporu
npm run test:coverage
```

## Lisans

MIT