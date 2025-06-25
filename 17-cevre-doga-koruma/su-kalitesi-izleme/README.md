# Su Kalitesi İzleme Sistemi

Bu modül **çevre ve doğa koruma** kategorisi altında kamu kurumları için geliştirilecek açık kaynak **su kalitesi izleme** projesidir. Sistem, su kaynaklarının kalitesini gerçek zamanlı olarak izlemek, analiz etmek ve raporlamak için kapsamlı bir çözüm sunar.

## 🚀 Proje Hakkında

Su Kalitesi İzleme Sistemi, nehirler, göller, barajlar ve içme suyu kaynaklarındaki su kalitesini sürekli olarak takip eden, IoT sensörlerle entegre çalışan, erken uyarı sistemleri içeren modern bir izleme platformudur. Çevre ve Şehircilik Bakanlığı, belediyeler, su ve kanalizasyon idareleri tarafından kullanılabilir.

## ✨ Özellikler

### Temel Özellikler
- [x] Gerçek zamanlı su kalitesi ölçüm ve izleme
- [x] IoT sensör yönetimi ve veri toplama (MQTT protokolü)
- [x] Çoklu parametre takibi (pH, oksijen, sıcaklık, bulanıklık vb.)
- [x] Harita tabanlı görselleştirme ve konumsal analiz
- [x] Otomatik alarm ve bildirim sistemi
- [x] Trend analizi ve tahminleme modelleri
- [x] Mobil uygulama desteği
- [x] RESTful API ve WebSocket entegrasyonu

### İzleme Parametreleri
- pH değeri
- Çözünmüş oksijen (DO)
- Sıcaklık
- Elektriksel iletkenlik (EC)
- Bulanıklık (Türbidite)
- Nitrat/Nitrit seviyeleri
- Fosfat seviyeleri
- Ağır metal konsantrasyonları
- Mikrobiyal kirlilik göstergeleri
- Kimyasal oksijen ihtiyacı (COD)
- Biyolojik oksijen ihtiyacı (BOD)

### Analiz ve Raporlama
- Gerçek zamanlı dashboard
- Geçmiş veri analizi
- Trend grafikleri ve istatistikler
- Karşılaştırmalı analizler
- Uyarı ve alarm raporları
- Yasal uyumluluk raporları
- Excel/PDF rapor dışa aktarımı

### Entegrasyonlar
- Meteoroloji verileri entegrasyonu
- Coğrafi bilgi sistemleri (GIS)
- SCADA sistemleri
- Laboratuvar bilgi yönetim sistemleri (LIMS)
- SMS ve e-posta bildirimleri
- Mobil push notifications

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL (ana veri) + InfluxDB (zaman serisi verileri)
- **Cache:** Redis
- **Message Broker:** MQTT (Mosquitto) + RabbitMQ
- **API Dokümantasyon:** Swagger/OpenAPI
- **Authentication:** JWT + OAuth2
- **Real-time:** Socket.io + WebSockets

### Frontend
- **Framework:** React.js + TypeScript
- **UI Library:** Material-UI / Ant Design
- **State Management:** Redux Toolkit + RTK Query
- **Harita:** Leaflet / Mapbox GL
- **Grafikler:** Chart.js / D3.js
- **Real-time Updates:** Socket.io-client

### DevOps & Altyapı
- **Container:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitLab CI / GitHub Actions
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)

## 📋 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- InfluxDB 2.0+
- Redis 7+
- Docker & Docker Compose

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/su-kalitesi-izleme.git
cd su-kalitesi-izleme

# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanı migration
npm run migrate

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

# Logları takip edin
docker-compose logs -f
```

## 📡 API Endpoints

### Sensör Yönetimi
- `GET /api/v1/sensors` - Tüm sensörleri listele
- `GET /api/v1/sensors/:id` - Sensör detayı
- `POST /api/v1/sensors` - Yeni sensör ekle
- `PUT /api/v1/sensors/:id` - Sensör güncelle
- `DELETE /api/v1/sensors/:id` - Sensör sil

### Ölçüm Verileri
- `GET /api/v1/measurements` - Ölçüm verilerini listele
- `GET /api/v1/measurements/realtime` - Gerçek zamanlı veriler
- `POST /api/v1/measurements` - Yeni ölçüm ekle
- `GET /api/v1/measurements/export` - Veri dışa aktarımı

### İstasyonlar
- `GET /api/v1/stations` - İzleme istasyonları
- `GET /api/v1/stations/:id/status` - İstasyon durumu
- `POST /api/v1/stations` - Yeni istasyon ekle

### Alarmlar
- `GET /api/v1/alarms` - Aktif alarmlar
- `GET /api/v1/alarms/history` - Alarm geçmişi
- `POST /api/v1/alarms/acknowledge/:id` - Alarm onaylama
- `PUT /api/v1/alarms/rules` - Alarm kuralları güncelleme

### Raporlar
- `GET /api/v1/reports/daily` - Günlük rapor
- `GET /api/v1/reports/monthly` - Aylık rapor
- `GET /api/v1/reports/compliance` - Uyumluluk raporu
- `POST /api/v1/reports/generate` - Özel rapor oluştur

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- API rate limiting
- SQL injection koruması
- XSS ve CSRF koruması
- Şifrelenmiş veri iletimi (HTTPS)
- Audit logging

## 📱 Mobil Uygulama

React Native tabanlı mobil uygulama ile:
- Gerçek zamanlı su kalitesi takibi
- Alarm bildirimleri
- Harita üzerinde istasyon görüntüleme
- Offline veri senkronizasyonu

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: su-kalitesi@kamu.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/su-kalitesi-izleme/wiki)
