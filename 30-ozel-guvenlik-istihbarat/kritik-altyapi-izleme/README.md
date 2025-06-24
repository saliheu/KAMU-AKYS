# Kritik Altyapı İzleme Sistemi

Enerji, su, ulaşım ve telekomünikasyon gibi kritik altyapıların gerçek zamanlı izlenmesi ve yönetimi için geliştirilmiş kapsamlı platform.

## Özellikler

### Altyapı İzleme
- ✅ Gerçek zamanlı altyapı durumu takibi
- ✅ Çoklu altyapı tipi desteği (enerji, su, gaz, telekomünikasyon)
- ✅ Harita üzerinde görselleştirme
- ✅ Performans metrikleri ve KPI takibi
- ✅ Kapasite ve kullanım analizi

### Sensör ve IoT Entegrasyonu
- ✅ MQTT protokolü ile IoT sensör desteği
- ✅ Modbus ve SNMP protokol desteği
- ✅ Gerçek zamanlı veri toplama
- ✅ Sensör sağlık durumu takibi
- ✅ Otomatik sensör keşfi

### Alarm ve Uyarı Sistemi
- ✅ Çok seviyeli alarm sistemi
- ✅ Özelleştirilebilir alarm kuralları
- ✅ E-posta ve SMS bildirimleri
- ✅ Alarm eskalasyonu
- ✅ Alarm geçmişi ve analitik

### Bakım Yönetimi
- ✅ Planlı bakım takibi
- ✅ Arıza kaydı ve yönetimi
- ✅ İş emri sistemi
- ✅ Bakım takvimi
- ✅ Yedek parça yönetimi

### Raporlama ve Analitik
- ✅ Gerçek zamanlı dashboard'lar
- ✅ Tarihsel veri analizi
- ✅ Trend analizi ve tahminleme
- ✅ Özelleştirilebilir raporlar
- ✅ Veri dışa aktarma

### Güvenlik ve Erişim
- ✅ Rol bazlı erişim kontrolü
- ✅ Güvenlik olayları takibi
- ✅ Siber güvenlik izleme
- ✅ Audit log
- ✅ İki faktörlü kimlik doğrulama

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL (ana veritabanı)
- InfluxDB (zaman serisi verileri)
- Redis (önbellekleme)
- MQTT (IoT iletişimi)
- Socket.io (gerçek zamanlı)
- Bull Queue (arka plan işleri)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Leaflet (harita)
- Chart.js & D3.js
- Socket.io Client

### IoT ve Protokoller
- MQTT
- Modbus TCP/RTU
- SNMP
- OPC UA
- REST API

## Kurulum

### Gereksinimler
- Node.js 16+
- PostgreSQL 13+
- InfluxDB 2+
- Redis 6+
- MQTT Broker (Mosquitto)

### Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanını oluşturun
createdb infrastructure_monitoring_db

# Sunucuyu başlatın
npm run dev
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Altyapı
- `GET /api/infrastructure` - Altyapı listesi
- `GET /api/infrastructure/:id` - Altyapı detayı
- `POST /api/infrastructure` - Altyapı ekleme
- `PUT /api/infrastructure/:id` - Altyapı güncelleme
- `GET /api/infrastructure/:id/status` - Durum bilgisi
- `GET /api/infrastructure/:id/metrics` - Metrikler

### Sensörler
- `GET /api/sensors` - Sensör listesi
- `POST /api/sensors` - Sensör ekleme
- `GET /api/sensors/:id/data` - Sensör verileri
- `POST /api/sensors/:id/calibrate` - Kalibrasyon
- `GET /api/sensors/discover` - Otomatik keşif

### Alarmlar
- `GET /api/alerts` - Alarm listesi
- `GET /api/alerts/active` - Aktif alarmlar
- `POST /api/alerts/:id/acknowledge` - Alarm onaylama
- `POST /api/alerts/:id/resolve` - Alarm çözümleme
- `GET /api/alerts/statistics` - Alarm istatistikleri

### Bakım
- `GET /api/maintenance/schedules` - Bakım planları
- `POST /api/maintenance/schedules` - Bakım planı oluşturma
- `GET /api/maintenance/work-orders` - İş emirleri
- `POST /api/maintenance/work-orders` - İş emri oluşturma
- `PUT /api/maintenance/work-orders/:id` - İş emri güncelleme

### Metrikler ve Raporlar
- `GET /api/metrics/realtime` - Gerçek zamanlı metrikler
- `GET /api/metrics/historical` - Tarihsel veriler
- `GET /api/reports/dashboard` - Dashboard verileri
- `POST /api/reports/generate` - Rapor oluşturma
- `GET /api/reports/export` - Veri dışa aktarma

## Desteklenen Altyapı Tipleri

### Enerji
- Elektrik şebekeleri
- Trafo merkezleri
- Güneş enerjisi santralleri
- Rüzgar türbinleri
- Hidroelektrik santraller

### Su ve Atık Su
- Su arıtma tesisleri
- Pompa istasyonları
- Su depoları
- Kanalizasyon şebekeleri
- Atık su arıtma tesisleri

### Gaz
- Gaz dağıtım şebekeleri
- Basınç düşürme istasyonları
- Gaz depolama tesisleri
- SCADA sistemleri

### Telekomünikasyon
- Baz istasyonları
- Fiber optik şebekeler
- Veri merkezleri
- İnternet değişim noktaları

### Ulaşım
- Trafik yönetim sistemleri
- Akıllı kavşaklar
- Toplu taşıma sistemleri
- Park yönetimi

## Güvenlik Özellikleri

- End-to-end şifreleme
- Güvenli IoT iletişimi
- DDoS koruması
- Anomali tespiti
- Güvenlik duvarı entegrasyonu
- VPN desteği
- Güvenlik olayları loglama

## Varsayılan Kullanıcı

- Email: admin@altyapi.gov.tr
- Şifre: Admin123!

## Lisans

MIT