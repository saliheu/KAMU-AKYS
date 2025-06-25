# Temaslı Takip Sistemi

Bu modül **sağlık ve pandemi** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **temaslı takip** projesidir. Sistem, pandemi dönemlerinde temaslı kişilerin takibini ve yönetimini sağlar.

## 🚀 Proje Hakkında

Temaslı Takip Sistemi, bulaşıcı hastalıkların yayılımını kontrol altına almak için temaslı kişilerin hızlı ve etkili bir şekilde tespit edilmesini, bilgilendirilmesini ve takip edilmesini sağlayan kapsamlı bir platformdur.

## ✨ Özellikler

### Temel Özellikler
- [x] QR kod tabanlı mekan girişi
- [x] Bluetooth tabanlı yakın temas tespiti
- [x] GPS tabanlı lokasyon takibi
- [x] Otomatik risk hesaplama
- [x] Anlık bildirim sistemi
- [x] Anonimleştirilmiş veri saklama
- [x] E-Devlet entegrasyonu
- [x] Sağlık Bakanlığı HSYS entegrasyonu

### Temas Takip Özellikleri
- Yakın temas süresi ve mesafe hesaplama
- Risk seviyesi belirleme (düşük, orta, yüksek)
- Temas geçmişi görüntüleme
- Karantina süresi takibi
- Test sonucu entegrasyonu
- Aşı durumu takibi
- İzolasyon takibi
- Semptom günlüğü

### Mekan ve Lokasyon
- QR kod ile mekan giriş/çıkış
- Mekan risk haritası
- Kalabalık yoğunluk takibi
- Riskli bölge bildirimleri
- Seyahat geçmişi
- Ev/iş adresi tanımlama
- Güvenli alan bildirimleri

### Bildirim ve İletişim
- Maruziyet bildirimleri
- Test hatırlatmaları
- Karantina bildirimleri
- Sağlık durumu güncellemeleri
- Acil durum bildirimleri
- Çok dilli destek
- SMS ve push notification

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL (ilişkisel veriler)
- **NoSQL:** MongoDB (lokasyon verileri)
- **Cache:** Redis
- **Queue:** Bull + Redis
- **Real-time:** Socket.io
- **Message Broker:** Kafka

### Frontend
- **Framework:** React 18 + TypeScript
- **UI Library:** Material-UI
- **State Management:** Redux Toolkit
- **Maps:** Leaflet + React-Leaflet
- **QR Code:** qrcode.react
- **Charts:** Recharts

### Mobil
- **Framework:** React Native
- **Bluetooth:** React Native BLE
- **Background Tasks:** React Native Background Task
- **Push Notifications:** FCM

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
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/temasli-takip.git
cd temasli-takip

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

# Veritabanı migration
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## 📡 API Endpoints

### Kimlik Doğrulama
- `POST /api/v1/auth/register` - Kullanıcı kaydı
- `POST /api/v1/auth/login` - Giriş
- `POST /api/v1/auth/verify-otp` - OTP doğrulama
- `POST /api/v1/auth/refresh` - Token yenileme

### Temas Takibi
- `POST /api/v1/contacts/report` - Temas bildirimi
- `GET /api/v1/contacts/history` - Temas geçmişi
- `GET /api/v1/contacts/exposures` - Maruziyet listesi
- `POST /api/v1/contacts/risk-assessment` - Risk değerlendirmesi

### Lokasyon
- `POST /api/v1/locations/check-in` - Mekan girişi
- `POST /api/v1/locations/check-out` - Mekan çıkışı
- `GET /api/v1/locations/history` - Lokasyon geçmişi
- `GET /api/v1/locations/risk-map` - Risk haritası

### Sağlık Durumu
- `POST /api/v1/health/status` - Sağlık durumu güncelleme
- `POST /api/v1/health/symptoms` - Semptom bildirimi
- `GET /api/v1/health/history` - Sağlık geçmişi
- `POST /api/v1/health/test-result` - Test sonucu

### QR Kod
- `POST /api/v1/qr/generate` - QR kod oluşturma
- `POST /api/v1/qr/scan` - QR kod okuma
- `GET /api/v1/qr/verify/:code` - QR kod doğrulama

### Bildirimler
- `GET /api/v1/notifications` - Bildirim listesi
- `PUT /api/v1/notifications/:id/read` - Okundu işaretle
- `GET /api/v1/notifications/settings` - Bildirim ayarları

### İstatistikler
- `GET /api/v1/statistics/dashboard` - Genel istatistikler
- `GET /api/v1/statistics/daily-cases` - Günlük vaka sayıları
- `GET /api/v1/statistics/risk-zones` - Riskli bölgeler
- `GET /api/v1/statistics/vaccination-rate` - Aşılama oranları

## 🔒 Güvenlik ve Gizlilik

- End-to-end şifreleme
- Anonimleştirilmiş veri saklama
- KVKK ve GDPR uyumluluğu
- Minimum veri toplama prensibi
- Otomatik veri silme (21 gün)
- Kullanıcı onayı sistemi
- Şeffaf veri kullanımı

## 📱 Mobil Özellikler

- Bluetooth LE ile yakın temas tespiti
- Arka planda çalışma
- Düşük batarya tüketimi
- Offline çalışma desteği
- Otomatik senkronizasyon
- Widget desteği

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: temasli-takip@saglik.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/temasli-takip/wiki)
