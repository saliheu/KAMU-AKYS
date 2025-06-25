# Elektronik Tebligat Sistemi

Bu modül **hukuk ve adalet** kategorisi altında kamu kurumları için geliştirilecek açık kaynak **elektronik tebligat** projesidir. Sistem, UETS (Ulusal Elektronik Tebligat Sistemi) ile entegre çalışarak resmi tebligatların elektronik ortamda iletilmesini sağlar.

## 🚀 Proje Hakkında

Elektronik Tebligat Sistemi, mahkemeler, icra müdürlükleri, kamu kurumları ve avukatların tebligat işlemlerini dijital ortamda gerçekleştirmelerini sağlayan modern bir platformdur. Fiziki tebligat süreçlerini ortadan kaldırarak zaman ve maliyet tasarrufu sağlar.

## ✨ Özellikler

### Temel Özellikler
- [x] UETS entegrasyonu
- [x] E-imza ile tebligat gönderimi
- [x] KEP (Kayıtlı Elektronik Posta) desteği
- [x] Otomatik tebligat takibi
- [x] Tebellüğ belgesi oluşturma
- [x] Süre hesaplama ve takibi
- [x] Toplu tebligat gönderimi
- [x] Blockchain ile doğrulama

### Tebligat Türleri
- Adli tebligatlar
- İdari tebligatlar
- İcra tebligatları
- Vergi tebligatları
- Trafik ceza tebligatları
- Sosyal güvenlik tebligatları
- Özel hukuk tebligatları
- Ticari tebligatlar

### Tebligat İşlemleri
- Tebligat hazırlama ve gönderme
- Muhatap sorgulama
- Adres doğrulama
- Tebligat durumu takibi
- İade ve red yönetimi
- Süre uzatma talepleri
- İtiraz ve savunma
- Arşiv ve arama

### Entegrasyonlar
- UETS (Ulusal Elektronik Tebligat Sistemi)
- UYAP (Ulusal Yargı Ağı Projesi)
- KEP (Kayıtlı Elektronik Posta)
- MERNİS (Merkezi Nüfus İdaresi Sistemi)
- E-Devlet Kapısı
- PTT tebligat sistemi
- Baro levha sorgulaması

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
- **UI Library:** Material-UI
- **State Management:** Redux Toolkit
- **Forms:** React Hook Form + Yup
- **PDF İşleme:** React-PDF
- **E-İmza:** WebCrypto API

### Güvenlik & Doğrulama
- **E-İmza:** Elektronik imza entegrasyonu
- **Blockchain:** Hyperledger Fabric
- **Şifreleme:** AES-256 + RSA
- **2FA:** TOTP + SMS

### DevOps & Altyapı
- **Container:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitLab CI
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack

## 📋 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- UETS API erişimi
- E-imza sertifikası

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/elektronik-tebligat.git
cd elektronik-tebligat

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

# UETS bağlantı testi
docker-compose exec backend npm test:uets
```

## 📡 API Endpoints

### Tebligat İşlemleri
- `POST /api/v1/notifications/create` - Tebligat oluştur
- `POST /api/v1/notifications/send` - Tebligat gönder
- `GET /api/v1/notifications/:id` - Tebligat detayı
- `GET /api/v1/notifications/:id/status` - Durum sorgulama
- `POST /api/v1/notifications/:id/cancel` - Tebligat iptali

### Muhatap İşlemleri
- `GET /api/v1/recipients/search` - Muhatap sorgulama
- `POST /api/v1/recipients/verify` - Adres doğrulama
- `GET /api/v1/recipients/:id/history` - Tebligat geçmişi
- `POST /api/v1/recipients/bulk-import` - Toplu muhatap ekleme

### Tebellüğ İşlemleri
- `GET /api/v1/receipts/:id` - Tebellüğ belgesi
- `POST /api/v1/receipts/:id/sign` - Tebellüğ imzalama
- `GET /api/v1/receipts/:id/verify` - Tebellüğ doğrulama
- `POST /api/v1/receipts/:id/reject` - Tebligat reddi

### Süre Yönetimi
- `GET /api/v1/deadlines/:notificationId` - Süre hesaplama
- `POST /api/v1/deadlines/extend` - Süre uzatma talebi
- `GET /api/v1/deadlines/holidays` - Tatil günleri
- `GET /api/v1/deadlines/calculate` - Süre hesaplayıcı

### UETS Entegrasyonu
- `POST /api/v1/uets/send` - UETS'e gönder
- `GET /api/v1/uets/status/:id` - UETS durum sorgulama
- `POST /api/v1/uets/callback` - UETS geri bildirim
- `GET /api/v1/uets/reports` - UETS raporları

### Raporlar
- `GET /api/v1/reports/statistics` - İstatistikler
- `GET /api/v1/reports/delivery-rate` - Teslim oranları
- `GET /api/v1/reports/performance` - Performans raporu
- `POST /api/v1/reports/custom` - Özel rapor

## 🔒 Güvenlik

- E-imza zorunluluğu
- End-to-end şifreleme
- Blockchain ile bütünlük kontrolü
- Multi-factor authentication
- IP whitelisting
- Audit logging
- KVKK uyumluluğu

## 📱 Mobil Özellikler

- Tebligat bildirimleri
- E-imza ile tebellüğ
- QR kod ile doğrulama
- Süre takibi
- Offline görüntüleme

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: elektronik-tebligat@adalet.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/elektronik-tebligat/wiki)
