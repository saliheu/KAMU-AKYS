# Atık Yönetim Sistemi

Bu modül **çevre ve doğa koruma** kategorisi altında kamu kurumları için geliştirilecek açık kaynak **atık yönetim** projesidir. Sistem, katı atık, geri dönüşüm, tehlikeli atık ve elektronik atık yönetimi için entegre bir çözüm sunar.

## 🚀 Proje Hakkında

Atık Yönetim Sistemi, belediyeler ve çevre yönetimi kurumları için atık toplama, taşıma, işleme ve bertaraf süreçlerini dijitalleştiren kapsamlı bir platformdur. IoT sensörlü akıllı konteynerler, rota optimizasyonu, geri dönüşüm takibi ve vatandaş mobil uygulaması ile entegre çalışır.

## ✨ Özellikler

### Temel Özellikler
- [x] Akıllı konteyner yönetimi (IoT sensörlü doluluk takibi)
- [x] Atık toplama rota optimizasyonu
- [x] QR kod/barkod ile atık takibi
- [x] Geri dönüşüm puan sistemi
- [x] Tehlikeli atık yönetimi
- [x] E-atık toplama ve takibi
- [x] Vatandaş mobil uygulaması
- [x] Harita tabanlı görselleştirme

### Atık Kategorileri
- Evsel atıklar
- Geri dönüşülebilir atıklar (kağıt, cam, plastik, metal)
- Organik atıklar (kompost)
- Tehlikeli atıklar
- Tıbbi atıklar
- Elektronik atıklar (AEEE)
- İnşaat ve yıkıntı atıkları
- Endüstriyel atıklar

### Operasyonel Özellikler
- Araç filosu yönetimi
- Personel ve vardiya yönetimi
- Toplama takvimi oluşturma
- Otomatik bildirimler (SMS/Push)
- Şikayet ve talep yönetimi
- Ceza ve denetim modülü
- Transfer istasyonu yönetimi
- Bertaraf tesisi entegrasyonu

### Analiz ve Raporlama
- Atık miktarı istatistikleri
- Geri dönüşüm oranları
- Karbon ayak izi hesaplama
- Maliyet analizleri
- Performans göstergeleri (KPI)
- Yasal uyumluluk raporları
- Çevresel etki değerlendirmesi

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL + MongoDB (IoT verileri)
- **Cache:** Redis
- **Message Queue:** Bull + Redis
- **IoT Platform:** MQTT (Mosquitto)
- **API Dokümantasyon:** Swagger/OpenAPI
- **Authentication:** JWT + OAuth2

### Frontend
- **Framework:** React.js + TypeScript
- **UI Library:** Ant Design / Material-UI
- **State Management:** Redux Toolkit
- **Harita:** Leaflet + OpenStreetMap
- **Grafikler:** Recharts / Chart.js
- **PWA:** Service Workers

### Mobil Uygulama
- **Framework:** React Native
- **State:** Redux + Redux Persist
- **Maps:** React Native Maps
- **Push Notifications:** Firebase Cloud Messaging

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
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/atik-yonetim.git
cd atik-yonetim

# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanı migration ve seed
npm run migrate
npm run seed

# Backend'i başlatın
npm run dev

# Frontend kurulumu (yeni terminal)
cd ../frontend
npm install
npm start

# Mobil uygulama (yeni terminal)
cd ../mobile
npm install
npm run android # veya npm run ios
```

### Docker ile Kurulum

```bash
# Tüm servisleri başlatın
docker-compose up -d

# Veritabanını hazırlayın
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## 📡 API Endpoints

### Konteyner Yönetimi
- `GET /api/v1/containers` - Konteyner listesi
- `GET /api/v1/containers/:id` - Konteyner detayı
- `POST /api/v1/containers` - Yeni konteyner ekle
- `PUT /api/v1/containers/:id` - Konteyner güncelle
- `GET /api/v1/containers/:id/fullness` - Doluluk durumu

### Atık Toplama
- `GET /api/v1/collections` - Toplama kayıtları
- `POST /api/v1/collections` - Yeni toplama kaydı
- `GET /api/v1/collections/routes` - Toplama rotaları
- `POST /api/v1/collections/optimize-route` - Rota optimizasyonu

### Geri Dönüşüm
- `GET /api/v1/recycling/points` - Geri dönüşüm noktaları
- `POST /api/v1/recycling/deposit` - Atık bırakma kaydı
- `GET /api/v1/recycling/user/:id/points` - Kullanıcı puanları
- `POST /api/v1/recycling/redeem` - Puan kullanımı

### Vatandaş Servisleri
- `POST /api/v1/citizens/register` - Vatandaş kaydı
- `GET /api/v1/citizens/schedule` - Toplama takvimi
- `POST /api/v1/citizens/request` - Toplama talebi
- `POST /api/v1/citizens/complaint` - Şikayet bildirimi

### Raporlar
- `GET /api/v1/reports/waste-statistics` - Atık istatistikleri
- `GET /api/v1/reports/recycling-rates` - Geri dönüşüm oranları
- `GET /api/v1/reports/carbon-footprint` - Karbon ayak izi
- `GET /api/v1/reports/cost-analysis` - Maliyet analizi

### Yönetim
- `GET /api/v1/vehicles` - Araç yönetimi
- `GET /api/v1/personnel` - Personel yönetimi
- `GET /api/v1/facilities` - Tesis yönetimi
- `GET /api/v1/regulations` - Mevzuat ve uyumluluk

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- API rate limiting
- Data encryption (AES-256)
- HTTPS zorunluluğu
- OWASP güvenlik standartları

## 📱 Mobil Özellikler

- Atık türü seçimi ve bilgilendirme
- En yakın geri dönüşüm noktası
- QR kod ile atık bırakma
- Toplama takvimi bildirimleri
- Puan bakiyesi ve geçmişi
- Şikayet/talep oluşturma

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: atik-yonetim@kamu.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/atik-yonetim/wiki)
