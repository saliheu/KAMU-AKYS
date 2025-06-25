# Engelli Vatandaş Hizmetleri Yönetim Sistemi

Engelli vatandaşlara yönelik hizmetlerin yönetimi, başvuru süreçleri ve destek sistemlerini içeren kapsamlı bir sosyal hizmetler platformu.

## Özellikler

### Engelli Vatandaş Özellikleri
- **Engelli Kimlik Kartı**: Dijital engelli kimlik kartı ve QR kod
- **Hizmet Başvuruları**: Çeşitli destek ve hizmet başvuruları
- **Randevu Sistemi**: Sağlık, rehabilitasyon ve danışmanlık randevuları
- **Yardımcı Cihaz**: Tekerlekli sandalye, işitme cihazı vb. talepleri
- **Ulaşım Desteği**: Engelli ulaşım kartı ve servis talepleri
- **Eğitim Desteği**: Özel eğitim ve kurs başvuruları

### Bakım Hizmetleri
- **Evde Bakım**: Evde bakım hizmeti başvurusu ve takibi
- **Bakım Merkezleri**: Gündüzlü/yatılı bakım merkezi başvuruları
- **Refakatçi Desteği**: Refakatçi talep ve yönetimi
- **Psikolojik Destek**: Online terapi ve danışmanlık hizmetleri

### İstihdam Desteği
- **İş Başvuruları**: Engelli kotası olan iş ilanları
- **Meslek Edindirme**: Mesleki eğitim kursları
- **Girişimcilik Desteği**: Engelli girişimci destekleri
- **İşyeri Uygunluk**: İşyeri erişilebilirlik değerlendirmesi

### Erişilebilirlik Özellikleri
- **Sesli Komutlar**: Görme engelliler için sesli navigasyon
- **Büyük Font**: Ayarlanabilir metin boyutu
- **Yüksek Kontrast**: Görme kolaylığı için kontrast modu
- **İşaret Dili**: Video içeriklerde işaret dili desteği
- **Sesli Okuma**: Metin okuma özelliği
- **Klavye Navigasyonu**: Tam klavye erişilebilirliği

### Yönetici Özellikleri
- **Başvuru Yönetimi**: Tüm başvuruların takibi ve onayı
- **Kaynak Yönetimi**: Hizmet ve ekipman envanteri
- **Personel Yönetimi**: Bakım personeli ve uzman atamaları
- **Raporlama**: Detaylı hizmet ve istatistik raporları
- **Bütçe Takibi**: Yardım ve hizmet bütçe yönetimi

## Teknolojiler

### Backend
- Node.js & Express.js
- PostgreSQL veritabanı
- Redis önbellekleme
- JWT kimlik doğrulama
- Google Cloud Speech-to-Text
- Google Cloud Text-to-Speech
- Socket.io (gerçek zamanlı)

### Frontend
- React.js
- Material-UI (WCAG 2.1 uyumlu)
- Redux state yönetimi
- React Query
- Web Speech API
- Chart.js

### DevOps
- Docker & Kubernetes
- GitHub Actions CI/CD
- Prometheus & Grafana
- ELK Stack

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Engelli vatandaş kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/voice-login` - Sesli giriş

### Engelli Kimlik Kartı
- `GET /api/disability-card/:tc` - Kimlik kartı görüntüleme
- `POST /api/disability-card/apply` - Kimlik kartı başvurusu
- `GET /api/disability-card/qr/:tc` - QR kod oluşturma
- `PUT /api/disability-card/update` - Bilgi güncelleme

### Hizmet Başvuruları
- `GET /api/services` - Hizmet listesi
- `POST /api/services/apply` - Hizmet başvurusu
- `GET /api/services/applications` - Başvuru listesi
- `GET /api/services/application/:id` - Başvuru detayı
- `PUT /api/services/application/:id/cancel` - Başvuru iptali

### Yardımcı Cihazlar
- `GET /api/assistive-devices` - Cihaz kataloğu
- `POST /api/assistive-devices/request` - Cihaz talebi
- `GET /api/assistive-devices/requests` - Taleplerim
- `PUT /api/assistive-devices/request/:id/return` - Cihaz iadesi

### Bakım Hizmetleri
- `POST /api/care-services/home-care` - Evde bakım başvurusu
- `GET /api/care-services/centers` - Bakım merkezleri
- `POST /api/care-services/center-apply` - Merkez başvurusu
- `GET /api/care-services/caregiver` - Bakıcı talepleri

### İstihdam
- `GET /api/employment/jobs` - İş ilanları
- `POST /api/employment/apply/:jobId` - İş başvurusu
- `GET /api/employment/courses` - Meslek kursları
- `POST /api/employment/course-enroll` - Kurs kaydı

### Randevular
- `GET /api/appointments` - Randevu listesi
- `POST /api/appointments` - Yeni randevu
- `PUT /api/appointments/:id` - Randevu güncelleme
- `DELETE /api/appointments/:id` - Randevu iptali

### Erişilebilirlik
- `GET /api/accessibility/locations` - Erişilebilir mekanlar
- `POST /api/accessibility/report` - Erişim problemi bildirimi
- `GET /api/accessibility/routes` - Engelli dostu rotalar
- `POST /api/accessibility/evaluate` - Mekan değerlendirmesi

### Destek Hizmetleri
- `POST /api/support/emergency` - Acil yardım çağrısı
- `GET /api/support/chat` - Canlı destek
- `POST /api/support/callback` - Geri arama talebi
- `GET /api/support/faq` - Sık sorulan sorular

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
DATABASE_URL=postgresql://user:password@localhost:5432/engelli_hizmetler

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
GOOGLE_PROJECT_ID=your-project-id

# SMS Servisi
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# E-posta Servisi
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@engellihizmetleri.gov.tr

# Harita Servisi
GOOGLE_MAPS_API_KEY=your-maps-api-key

# Sosyal Hizmetler API
ASHB_API_URL=https://api.ashb.gov.tr
ASHB_API_KEY=your-api-key
```

## Güvenlik Özellikleri

- HTTPS zorunluluğu
- Rate limiting
- SQL injection koruması
- XSS koruması
- CORS politikaları
- Veri şifreleme
- KVKK uyumluluğu
- Çok faktörlü doğrulama

## Erişilebilirlik Standartları

- WCAG 2.1 Level AA uyumlu
- Ekran okuyucu desteği
- Klavye navigasyonu
- Sesli komutlar
- Alternatif metin
- Yüksek kontrast modu
- Ayarlanabilir font boyutu
- Video altyazıları

## Test

```bash
# Unit testler
npm test

# Integration testler
npm run test:integration

# Erişilebilirlik testleri
npm run test:a11y

# E2E testler
npm run test:e2e

# Coverage raporu
npm run test:coverage
```

## Lisans

MIT