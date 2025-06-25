# Aşı Takip ve Randevu Sistemi

Vatandaşların aşı takibi ve randevu yönetimini sağlayan kapsamlı bir sağlık platformu.

## Özellikler

### Vatandaş Özellikleri
- **Aşı Kartı**: Dijital aşı kartı görüntüleme ve QR kod oluşturma
- **Randevu Yönetimi**: Online aşı randevusu alma, değiştirme ve iptal etme
- **Aşı Takvimi**: Kişiselleştirilmiş aşı takvimi ve hatırlatmalar
- **Aile Yönetimi**: Aile bireylerinin aşı takibi
- **Bildirimler**: SMS ve e-posta ile randevu hatırlatmaları

### Sağlık Personeli Özellikleri
- **Aşı Uygulama**: Aşı uygulama kaydı ve doğrulama
- **Stok Yönetimi**: Aşı stok takibi ve yönetimi
- **Randevu Takvimi**: Günlük aşı randevularını görüntüleme
- **Yan Etki Bildirimi**: Aşı yan etki raporlama
- **İstatistik Paneli**: Aşılama oranları ve istatistikler

### Yönetici Özellikleri
- **Merkez Yönetimi**: Aşı merkezleri ve personel yönetimi
- **Kampanya Yönetimi**: Aşı kampanyaları oluşturma ve takip
- **Raporlama**: Detaylı aşılama raporları ve analizler
- **Entegrasyon**: Sağlık Bakanlığı sistemleri ile entegrasyon

## Teknolojiler

### Backend
- Node.js & Express.js
- PostgreSQL veritabanı
- Redis önbellekleme
- JWT kimlik doğrulama
- QR kod oluşturma
- SMS/E-posta servisleri (Twilio, SendGrid)

### Frontend
- React.js
- Material-UI
- Redux state yönetimi
- React Query
- Chart.js
- QR kod okuyucu

### DevOps
- Docker & Kubernetes
- GitHub Actions CI/CD
- Prometheus & Grafana
- ELK Stack

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Vatandaş kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### Aşı Kartı
- `GET /api/vaccine-card/:tc` - Aşı kartı görüntüleme
- `GET /api/vaccine-card/qr/:tc` - QR kod oluşturma
- `POST /api/vaccine-card/verify` - QR kod doğrulama

### Randevu Yönetimi
- `GET /api/appointments` - Randevu listesi
- `POST /api/appointments` - Yeni randevu
- `PUT /api/appointments/:id` - Randevu güncelleme
- `DELETE /api/appointments/:id` - Randevu iptal
- `GET /api/appointments/available-slots` - Uygun slotlar

### Aşı Yönetimi
- `GET /api/vaccines` - Aşı listesi
- `POST /api/vaccines/apply` - Aşı uygulama kaydı
- `GET /api/vaccines/history/:tc` - Aşı geçmişi
- `POST /api/vaccines/side-effects` - Yan etki bildirimi

### Aile Yönetimi
- `GET /api/family/members` - Aile üyeleri
- `POST /api/family/add-member` - Aile üyesi ekle
- `DELETE /api/family/remove-member/:id` - Aile üyesi çıkar

### Bildirimler
- `GET /api/notifications` - Bildirim listesi
- `PUT /api/notifications/preferences` - Bildirim tercihleri
- `POST /api/notifications/mark-read/:id` - Okundu işaretle

### Raporlama (Admin)
- `GET /api/reports/vaccination-rates` - Aşılama oranları
- `GET /api/reports/center-statistics` - Merkez istatistikleri
- `GET /api/reports/campaign-analysis` - Kampanya analizleri
- `GET /api/reports/side-effects` - Yan etki raporları

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
DATABASE_URL=postgresql://user:password@localhost:5432/asi_takip

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# SMS Servisi
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# E-posta Servisi
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@asitakip.gov.tr

# Sağlık Bakanlığı API
MOH_API_URL=https://api.saglik.gov.tr
MOH_API_KEY=your-api-key
```

## Güvenlik Özellikleri

- HTTPS zorunluluğu
- Rate limiting
- SQL injection koruması
- XSS koruması
- CORS politikaları
- Veri şifreleme
- KVKK uyumluluğu
- İki faktörlü doğrulama

## Test

```bash
# Unit testler
npm test

# Integration testler
npm run test:integration

# E2E testler
npm run test:e2e

# Coverage raporu
npm run test:coverage
```

## Lisans

MIT