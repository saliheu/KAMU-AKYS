# Ticaret Sicili Yönetim Sistemi

Bu modül **gümrük ve ticaret** kategorisi altında kamu kurumları için geliştirilecek açık kaynak **ticaret sicili yönetim** projesidir. Sistem, şirket kuruluş, değişiklik ve tasfiye işlemlerini dijital ortamda yönetir.

## 🚀 Proje Hakkında

Ticaret Sicili Yönetim Sistemi, ticaret sicili müdürlüklerinin tüm işlemlerini dijitalleştiren, MERSİS (Merkezi Sicil Kayıt Sistemi) ile entegre çalışan modern bir platformdur. Şirket kuruluşları, ana sözleşme değişiklikleri, organ değişiklikleri ve tescil işlemlerini hızlı ve güvenli şekilde gerçekleştirir.

## ✨ Özellikler

### Temel Özellikler
- [x] Online şirket kuruluş işlemleri
- [x] Elektronik tescil ve ilan
- [x] MERSİS entegrasyonu
- [x] E-imza ve KEP desteği
- [x] Otomatik belge üretimi
- [x] Ticaret sicili gazetesi yayını
- [x] Online ödeme sistemi
- [x] Blockchain tabanlı belge doğrulama

### İşlem Türleri
- Şirket kuruluşu (A.Ş., Ltd. Şti., Koop. vb.)
- Ana sözleşme değişiklikleri
- Sermaye artırımı/azaltımı
- Unvan ve adres değişiklikleri
- Yönetim kurulu/müdür değişiklikleri
- Şube açılışı/kapanışı
- Birleşme ve bölünme
- Tasfiye işlemleri

### Belge Yönetimi
- Otomatik ana sözleşme hazırlama
- İmza sirküleri oluşturma
- Yetki belgesi düzenleme
- Faaliyet belgesi
- Oda kayıt belgesi
- Ticaret sicili tasdiknamesi
- QR kodlu belge doğrulama

### Entegrasyonlar
- MERSİS (Merkezi Sicil Kayıt Sistemi)
- GİB (Gelir İdaresi Başkanlığı)
- SGK (Sosyal Güvenlik Kurumu)
- UETS (Ulusal Elektronik Tebligat Sistemi)
- KEP (Kayıtlı Elektronik Posta)
- E-Devlet Kapısı
- Noterlik sistemi

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL
- **Cache:** Redis
- **Queue:** Bull + Redis
- **ORM:** Sequelize
- **API Dokümantasyon:** Swagger/OpenAPI
- **Authentication:** JWT + OAuth2

### Frontend
- **Framework:** React.js + TypeScript
- **UI Library:** Ant Design Pro
- **State Management:** Redux Toolkit
- **Forms:** Formik + Yup
- **PDF İşleme:** React-PDF
- **E-İmza:** WebCrypto API

### Güvenlik & Doğrulama
- **E-İmza:** Elektronik imza entegrasyonu
- **Blockchain:** Hyperledger Fabric
- **Şifreleme:** AES-256 + RSA
- **2FA:** TOTP (Google Authenticator)

### DevOps & Altyapı
- **Container:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** Jenkins / GitLab CI
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack

## 📋 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/ticaret-sicili-yonetim.git
cd ticaret-sicili-yonetim

# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanı migration
npm run migrate
npm run seed

# Backend'i başlatın
npm run dev

# Frontend kurulumu (yeni terminal)
cd ../frontend
npm install
npm start
```

### Docker ile Kurulum

```bash
# Tüm servisleri başlatın
docker-compose up -d

# İlk kurulum
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## 📡 API Endpoints

### Şirket İşlemleri
- `POST /api/v1/companies/establish` - Şirket kuruluşu
- `GET /api/v1/companies/:taxNo` - Şirket bilgileri
- `PUT /api/v1/companies/:id` - Şirket güncelleme
- `POST /api/v1/companies/:id/liquidate` - Tasfiye işlemi

### Tescil İşlemleri
- `POST /api/v1/registrations` - Yeni tescil talebi
- `GET /api/v1/registrations/:id` - Tescil detayı
- `PUT /api/v1/registrations/:id/approve` - Tescil onayı
- `POST /api/v1/registrations/:id/publish` - Gazete ilanı

### Belge İşlemleri
- `POST /api/v1/documents/generate` - Belge oluştur
- `GET /api/v1/documents/:id` - Belge görüntüle
- `POST /api/v1/documents/:id/sign` - E-imza işlemi
- `GET /api/v1/documents/verify/:qrCode` - QR doğrulama

### Sorgulama
- `GET /api/v1/search/companies` - Şirket arama
- `GET /api/v1/search/officials` - Yetkili arama
- `GET /api/v1/search/documents` - Belge arama
- `POST /api/v1/search/advanced` - Detaylı arama

### Ödeme İşlemleri
- `POST /api/v1/payments/calculate` - Ücret hesaplama
- `POST /api/v1/payments/create` - Ödeme oluştur
- `GET /api/v1/payments/:id/status` - Ödeme durumu
- `GET /api/v1/payments/receipt/:id` - Makbuz

### Entegrasyonlar
- `POST /api/v1/mersis/sync` - MERSİS senkronizasyon
- `POST /api/v1/gib/register` - GİB kayıt
- `POST /api/v1/sgk/register` - SGK kayıt
- `POST /api/v1/kep/send` - KEP gönderimi

## 🔒 Güvenlik

- E-imza zorunluluğu
- KEP üzerinden tebligat
- Blockchain ile belge doğrulama
- SSL/TLS şifreleme
- IP kısıtlaması
- Audit logging
- KVKK uyumluluğu

## 📱 Mobil Özellikler

- Belge görüntüleme
- QR kod okuma
- Durum takibi
- Push bildirimleri
- Offline belge saklama

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: ticaret-sicili@ticaret.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/ticaret-sicili-yonetim/wiki)
