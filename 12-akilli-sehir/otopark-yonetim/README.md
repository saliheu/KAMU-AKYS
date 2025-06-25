# Otopark Yönetim Sistemi

Bu modül **akıllı şehir** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **otopark yönetim** projesidir. Sistem, modern IoT teknolojileri ile donatılmış akıllı otopark yönetimi sağlar.

## 🚀 Proje Hakkında

Otopark Yönetim Sistemi, şehirlerdeki park sorunlarını çözmek için geliştirilmiş kapsamlı bir platformdur. IoT sensörler, plaka tanıma sistemleri ve mobil ödeme entegrasyonları ile modern bir park deneyimi sunar.

## ✨ Özellikler

### Temel Özellikler
- [x] Gerçek zamanlı park yeri takibi
- [x] Otomatik plaka tanıma sistemi
- [x] Mobil rezervasyon ve ödeme
- [x] IoT sensör entegrasyonu
- [x] Dinamik fiyatlandırma
- [x] HGS/OGS entegrasyonu
- [x] Engelli ve gazi park yeri yönetimi
- [x] Çoklu dil desteği

### Park Yönetimi
- Gerçek zamanlı doluluk takibi
- Otomatik bariyer kontrolü
- Park süre takibi
- Abone yönetimi
- Vale park hizmeti
- Elektrikli araç şarj istasyonları
- Bisiklet/scooter park alanları
- Yönlendirme sistemi

### Plaka Tanıma ve Güvenlik
- Giriş/çıkış plaka okuma
- Kara liste yönetimi
- Çalıntı araç tespiti
- Güvenlik kamera entegrasyonu
- Olay yönetimi
- Acil durum protokolleri

### Ödeme ve Faturalama
- Kredi kartı ödeme
- Mobil ödeme (NFC, QR)
- HGS/OGS ile ödeme
- Kurumsal faturalama
- Abonelik paketleri
- İndirim ve kampanya yönetimi
- Otomatik fatura kesimi

### IoT ve Sensör Sistemi
- Ultrasonik park sensörleri
- Kamera tabanlı doluluk tespiti
- Hava kalitesi sensörleri
- Aydınlatma kontrolü
- Akıllı yönlendirme tabelaları
- Mobil uygulama entegrasyonu

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL
- **Time Series DB:** InfluxDB (sensör verileri)
- **Cache:** Redis
- **Message Broker:** MQTT + Kafka
- **API Gateway:** Kong

### Frontend
- **Framework:** React 18 + TypeScript
- **UI Library:** Material-UI
- **State Management:** Redux Toolkit
- **Maps:** Leaflet + Mapbox
- **Charts:** Recharts
- **Real-time:** Socket.io

### IoT ve Donanım
- **Protokoller:** MQTT, Modbus, HTTP
- **Sensörler:** Ultrasonik, Kamera, RFID
- **Plaka Tanıma:** OpenALPR, Tesseract
- **Bariyer Kontrol:** PLC entegrasyonu
- **Edge Computing:** Raspberry Pi, Arduino

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
- InfluxDB 2+
- MQTT Broker (Mosquitto)
- Docker & Docker Compose

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/otopark-yonetim.git
cd otopark-yonetim

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

# Sensör simülatörünü başlatın
docker-compose exec backend npm run simulate-sensors
```

## 📡 API Endpoints

### Park Yönetimi
- `GET /api/v1/parking/spots` - Boş park yerleri
- `POST /api/v1/parking/check-in` - Araç girişi
- `POST /api/v1/parking/check-out` - Araç çıkışı
- `GET /api/v1/parking/status/:spotId` - Park yeri durumu
- `PUT /api/v1/parking/reserve` - Park yeri rezervasyonu

### Plaka Tanıma
- `POST /api/v1/vehicles/recognize` - Plaka tanıma
- `GET /api/v1/vehicles/:plate` - Araç bilgisi
- `POST /api/v1/vehicles/blacklist` - Kara listeye ekle
- `GET /api/v1/vehicles/history/:plate` - Araç geçmişi

### Ödeme İşlemleri
- `POST /api/v1/payments/calculate` - Ücret hesaplama
- `POST /api/v1/payments/process` - Ödeme işlemi
- `GET /api/v1/payments/receipt/:id` - Makbuz
- `POST /api/v1/payments/subscribe` - Abonelik

### Sensör Verileri
- `GET /api/v1/sensors/status` - Sensör durumları
- `POST /api/v1/sensors/data` - Sensör veri gönderimi
- `GET /api/v1/sensors/history/:sensorId` - Sensör geçmişi
- `WS /api/v1/sensors/stream` - Canlı veri akışı

### Raporlar
- `GET /api/v1/reports/occupancy` - Doluluk raporu
- `GET /api/v1/reports/revenue` - Gelir raporu
- `GET /api/v1/reports/violations` - İhlal raporu
- `GET /api/v1/reports/analytics` - Analitik dashboard

### Bariyer Kontrol
- `POST /api/v1/barriers/open` - Bariyer aç
- `POST /api/v1/barriers/close` - Bariyer kapat
- `GET /api/v1/barriers/status/:id` - Bariyer durumu
- `POST /api/v1/barriers/emergency` - Acil açılım

## 🔒 Güvenlik

- End-to-end şifreleme
- API rate limiting
- JWT token authentication
- Role-based access control
- IP whitelisting
- Audit logging
- PCI DSS uyumluluğu

## 📱 Mobil Özellikler

- Park yeri arama ve yönlendirme
- QR kod ile giriş/çıkış
- Mobil ödeme
- Push bildirimler
- Park süresi hatırlatma
- Favoriler ve geçmiş

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: otopark-yonetim@akillisehir.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/otopark-yonetim/wiki)
