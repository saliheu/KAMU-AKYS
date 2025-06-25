# Uzaktan Eğitim Platformu

Milli Eğitim Bakanlığı için geliştirilmiş, tüm eğitim kademelerini kapsayan kapsamlı bir uzaktan eğitim ve öğrenme yönetim sistemi.

## Özellikler

### Öğrenci Özellikleri
- **Canlı Dersler**: Video konferans ile canlı ders katılımı
- **Ders Kayıtları**: Kaçırılan derslerin video kayıtlarını izleme
- **Ödevler**: Online ödev teslimi ve takibi
- **Sınavlar**: Online sınav ve quiz sistemi
- **İlerleme Takibi**: Kişisel öğrenme istatistikleri
- **Soru-Cevap**: Öğretmenlere soru sorma platformu

### Öğretmen Özellikleri
- **Ders Yönetimi**: Canlı ders başlatma ve yönetimi
- **İçerik Yükleme**: Video, doküman ve sunum yükleme
- **Ödev Verme**: Ödev oluşturma ve değerlendirme
- **Sınav Hazırlama**: Online sınav ve quiz oluşturma
- **Öğrenci Takibi**: Öğrenci performans ve katılım takibi
- **Sanal Sınıf**: Beyaz tahta, ekran paylaşımı, breakout rooms

### Veli Özellikleri
- **Çocuk Takibi**: Çocukların ders katılımı ve performansı
- **Ödev Kontrolü**: Verilen ve tamamlanan ödevler
- **Devamsızlık**: Katılım raporları
- **Öğretmen İletişimi**: Öğretmenlerle mesajlaşma
- **Bildirimler**: Önemli duyuru ve hatırlatmalar

### Yönetici Özellikleri
- **Okul Yönetimi**: Okul, sınıf ve ders programı yönetimi
- **Kullanıcı Yönetimi**: Öğrenci, öğretmen ve veli hesapları
- **Raporlama**: Detaylı kullanım ve performans raporları
- **Entegrasyon**: MEBBİS ve e-okul entegrasyonu
- **Kaynak Yönetimi**: Sunucu ve bant genişliği takibi

## Teknolojiler

### Backend
- Node.js & Express.js
- PostgreSQL veritabanı
- Redis önbellekleme
- Socket.io (gerçek zamanlı iletişim)
- Agora/WebRTC (video konferans)
- AWS S3 (dosya depolama)
- Bull (iş kuyruğu)

### Frontend
- React.js
- Material-UI
- Redux state yönetimi
- Socket.io-client
- Video.js
- Canvas (beyaz tahta)
- Chart.js

### DevOps
- Docker & Kubernetes
- GitHub Actions CI/CD
- Prometheus & Grafana
- ELK Stack
- CDN (içerik dağıtımı)

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/forgot-password` - Şifre sıfırlama

### Canlı Dersler
- `GET /api/live-classes` - Canlı ders listesi
- `POST /api/live-classes` - Yeni canlı ders oluştur
- `GET /api/live-classes/:id/join` - Derse katıl
- `POST /api/live-classes/:id/end` - Dersi bitir
- `GET /api/live-classes/:id/recording` - Ders kaydı

### Ders İçerikleri
- `GET /api/courses` - Ders listesi
- `GET /api/courses/:id/content` - Ders içerikleri
- `POST /api/courses/:id/upload` - İçerik yükleme
- `DELETE /api/content/:id` - İçerik silme
- `GET /api/content/:id/download` - İçerik indirme

### Ödevler
- `GET /api/assignments` - Ödev listesi
- `POST /api/assignments` - Yeni ödev oluştur
- `GET /api/assignments/:id` - Ödev detayı
- `POST /api/assignments/:id/submit` - Ödev teslimi
- `PUT /api/assignments/:id/grade` - Ödev notlandırma

### Sınavlar
- `GET /api/exams` - Sınav listesi
- `POST /api/exams` - Yeni sınav oluştur
- `GET /api/exams/:id/start` - Sınava başla
- `POST /api/exams/:id/submit` - Sınav teslimi
- `GET /api/exams/:id/results` - Sınav sonuçları

### Mesajlaşma
- `GET /api/messages` - Mesaj listesi
- `POST /api/messages` - Yeni mesaj gönder
- `GET /api/messages/:conversationId` - Konuşma detayı
- `PUT /api/messages/:id/read` - Okundu işaretle

### İstatistikler
- `GET /api/stats/attendance` - Katılım istatistikleri
- `GET /api/stats/performance` - Performans istatistikleri
- `GET /api/stats/progress` - İlerleme raporları
- `GET /api/stats/usage` - Platform kullanım istatistikleri

### Bildirimler
- `GET /api/notifications` - Bildirim listesi
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `PUT /api/notifications/preferences` - Bildirim tercihleri

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
DATABASE_URL=postgresql://user:password@localhost:5432/uzaktan_egitim

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Video Konferans (Agora)
AGORA_APP_ID=your-app-id
AGORA_APP_CERTIFICATE=your-certificate

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=uzaktan-egitim
AWS_REGION=eu-central-1

# E-posta
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# MEBBİS Entegrasyon
MEBBIS_API_URL=https://mebbis.meb.gov.tr/api
MEBBIS_API_KEY=your-api-key
```

## Güvenlik Özellikleri

- HTTPS zorunluluğu
- Rate limiting
- DDoS koruması
- End-to-end şifreleme (video)
- KVKK uyumluluğu
- İçerik filtreleme
- Güvenli sınav modu
- IP kısıtlaması

## Performans Optimizasyonu

- CDN kullanımı
- Video adaptive streaming
- Lazy loading
- Redis önbellekleme
- Database indexing
- Load balancing
- Auto-scaling

## Test

```bash
# Unit testler
npm test

# Integration testler
npm run test:integration

# E2E testler
npm run test:e2e

# Load testing
npm run test:load

# Coverage raporu
npm run test:coverage
```

## Lisans

MIT