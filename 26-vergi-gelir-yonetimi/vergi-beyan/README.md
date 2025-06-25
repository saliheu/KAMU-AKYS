# Vergi Beyan ve Ödeme Sistemi

Gelir İdaresi Başkanlığı için geliştirilmiş, tüm vergi türlerinin beyanı, tahakkuku ve ödemesini yöneten kapsamlı bir dijital vergi platformu.

## Özellikler

### Mükellef Özellikleri
- **Beyanname Verme**: Tüm vergi türleri için online beyanname
- **Otomatik Hesaplama**: Vergi matrahı ve ödenecek tutar hesaplama
- **Ödeme İşlemleri**: Kredi kartı, banka ve havale ile ödeme
- **Belge Yönetimi**: Fatura, makbuz ve belge yükleme
- **Hatırlatmalar**: Beyan ve ödeme tarihi hatırlatmaları
- **Geçmiş Sorgulama**: Beyan ve ödeme geçmişi

### Beyanname Türleri
- **Gelir Vergisi**: Yıllık gelir vergisi beyannamesi
- **KDV**: Aylık/3 aylık KDV beyannamesi
- **Kurumlar Vergisi**: Kurumlar vergisi beyannamesi
- **Motorlu Taşıtlar**: MTV ödemeleri
- **Emlak Vergisi**: Emlak vergisi beyan ve ödemeleri
- **Damga Vergisi**: E-damga vergisi işlemleri

### İşletme Özellikleri
- **E-Fatura**: E-fatura oluşturma ve gönderme
- **E-Defter**: Elektronik defter tutma
- **E-Arşiv**: E-arşiv fatura düzenleme
- **Mali Müşavir Yetkilendirme**: Mali müşavir yetki yönetimi
- **Toplu İşlemler**: Çoklu beyanname gönderimi
- **Muhtasar Beyanname**: İşveren beyannameleri

### Yönetici Özellikleri
- **Risk Analizi**: Mükellef risk skorlama ve analizi
- **Denetim Yönetimi**: Vergi denetim süreç yönetimi
- **Tahsilat Takibi**: Gecikmiş ödemeler ve icra takibi
- **Raporlama**: Detaylı vergi tahsilat raporları
- **Mevzuat Güncelleme**: Vergi oranları ve kuralları

## Teknolojiler

### Backend
- Node.js & Express.js
- PostgreSQL veritabanı
- Redis önbellekleme
- JWT kimlik doğrulama
- Decimal.js (hassas hesaplama)
- PDFKit (belge oluşturma)
- XML işleme

### Frontend
- React.js
- Material-UI
- Redux state yönetimi
- React Query
- Chart.js
- React-PDF

### DevOps
- Docker & Kubernetes
- GitHub Actions CI/CD
- Prometheus & Grafana
- ELK Stack

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - E-devlet/Vergi kimlik no ile giriş
- `POST /api/auth/verify-sms` - SMS doğrulama
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### Mükellef İşlemleri
- `GET /api/taxpayer/info` - Mükellef bilgileri
- `GET /api/taxpayer/obligations` - Vergi yükümlülükleri
- `PUT /api/taxpayer/update` - Bilgi güncelleme
- `GET /api/taxpayer/balance` - Borç-alacak durumu

### Beyanname İşlemleri
- `GET /api/declarations/types` - Beyanname türleri
- `POST /api/declarations/create` - Yeni beyanname
- `GET /api/declarations` - Beyanname listesi
- `GET /api/declarations/:id` - Beyanname detayı
- `POST /api/declarations/:id/submit` - Beyanname gönder
- `PUT /api/declarations/:id/correct` - Düzeltme beyannamesi

### Vergi Hesaplama
- `POST /api/tax/calculate/income` - Gelir vergisi hesaplama
- `POST /api/tax/calculate/vat` - KDV hesaplama
- `POST /api/tax/calculate/corporate` - Kurumlar vergisi
- `GET /api/tax/rates` - Güncel vergi oranları

### Ödeme İşlemleri
- `GET /api/payments/debt` - Borç sorgulama
- `POST /api/payments/pay` - Ödeme yap
- `GET /api/payments/history` - Ödeme geçmişi
- `POST /api/payments/installment` - Taksitlendirme
- `GET /api/payments/receipt/:id` - Makbuz indir

### E-Fatura/E-Defter
- `POST /api/e-invoice/create` - E-fatura oluştur
- `GET /api/e-invoice/inbox` - Gelen faturalar
- `GET /api/e-invoice/outbox` - Gönderilen faturalar
- `POST /api/e-ledger/upload` - E-defter yükle
- `GET /api/e-ledger/status` - E-defter durumu

### Belge Yönetimi
- `POST /api/documents/upload` - Belge yükle
- `GET /api/documents` - Belge listesi
- `GET /api/documents/:id/download` - Belge indir
- `DELETE /api/documents/:id` - Belge sil

### Raporlama
- `GET /api/reports/tax-return` - Vergi beyannname raporu
- `GET /api/reports/payment-history` - Ödeme özeti
- `GET /api/reports/annual-summary` - Yıllık özet
- `GET /api/reports/certificate` - Vergi levhası

### Entegrasyonlar
- `GET /api/integration/banks` - Banka listesi
- `POST /api/integration/bank-statement` - Banka ekstresi
- `GET /api/integration/exchange-rates` - Döviz kurları
- `POST /api/integration/accounting-sync` - Muhasebe senkron

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
DATABASE_URL=postgresql://user:password@localhost:5432/vergi_beyan

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=30m

# E-Devlet Entegrasyon
EDEVLET_API_URL=https://giris.turkiye.gov.tr
EDEVLET_API_KEY=your-api-key

# Banka Entegrasyonu
BANK_API_URL=https://api.bankaentegrasyon.gov.tr
BANK_API_KEY=your-api-key

# E-posta
SMTP_HOST=smtp.gib.gov.tr
SMTP_PORT=587
SMTP_USER=noreply@gib.gov.tr
SMTP_PASS=your-password

# SMS Servisi
SMS_API_URL=https://sms.gib.gov.tr
SMS_API_KEY=your-api-key

# Kripto
ENCRYPTION_KEY=your-encryption-key
SIGNING_KEY=your-signing-key
```

## Güvenlik Özellikleri

- HTTPS zorunluluğu
- İki faktörlü doğrulama
- E-imza desteği
- Veri şifreleme
- SQL injection koruması
- XSS koruması
- Rate limiting
- IP beyaz listesi
- Oturum yönetimi

## Uyumluluk

- 213 Sayılı Vergi Usul Kanunu
- 193 Sayılı Gelir Vergisi Kanunu
- 5520 Sayılı Kurumlar Vergisi Kanunu
- 3065 Sayılı KDV Kanunu
- KVKK uyumluluğu
- ISO 27001 sertifikası

## Test

```bash
# Unit testler
npm test

# Integration testler
npm run test:integration

# E2E testler
npm run test:e2e

# Güvenlik testleri
npm run test:security

# Coverage raporu
npm run test:coverage
```

## Lisans

MIT