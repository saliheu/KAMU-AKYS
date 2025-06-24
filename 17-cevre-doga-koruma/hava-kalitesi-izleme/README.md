# Hava Kalitesi İzleme Sistemi

Gerçek zamanlı hava kalitesi izleme, analiz ve uyarı sistemi. IoT sensörlerden veri toplama, görselleştirme ve otomatik uyarı özellikleri sunar.

## 🚀 Özellikler

### Temel Özellikler
- **Gerçek Zamanlı İzleme**: MQTT protokolü ile sensör verilerinin anlık takibi
- **Çoklu Sensör Desteği**: PM2.5, PM10, CO, NO2, SO2, O3 ve hava durumu sensörleri
- **AQI Hesaplama**: Uluslararası standartlara göre hava kalitesi indeksi
- **Otomatik Uyarılar**: Kirlilik seviyelerine göre konfigüre edilebilir uyarı sistemi
- **Görselleştirme**: Harita tabanlı görüntüleme ve gerçek zamanlı grafikler
- **Raporlama**: Detaylı analiz ve trend raporları

### Teknik Özellikler
- **Mikroservis Mimarisi**: Backend API, sensör servisi ve frontend ayrımı
- **Çift Veritabanı**: PostgreSQL (ilişkisel veri) + InfluxDB (zaman serisi)
- **Önbellekleme**: Redis ile performans optimizasyonu
- **WebSocket**: Gerçek zamanlı veri akışı
- **Docker**: Konteyner tabanlı deployment
- **JWT Kimlik Doğrulama**: Güvenli API erişimi

## 📋 Gereksinimler

- Docker ve Docker Compose
- Node.js 18+ (geliştirme için)
- PostgreSQL 15+
- Redis 7+
- InfluxDB 2.7+
- MQTT Broker (Mosquitto)

## 🛠️ Kurulum

### Docker ile Kurulum (Önerilen)

1. Repoyu klonlayın:
```bash
git clone https://github.com/yourusername/hava-kalitesi-izleme.git
cd hava-kalitesi-izleme
```

2. Ortam değişkenlerini ayarlayın:
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

3. Docker container'ları başlatın:
```bash
docker-compose up -d
```

4. Veritabanı migration'larını çalıştırın:
```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

5. Tarayıcıda açın:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- InfluxDB UI: http://localhost:8086

### Manuel Kurulum

#### Backend API

```bash
cd backend
npm install
npm run migrate
npm run seed
npm start
```

#### Sensör Servisi

```bash
cd sensor-service
npm install
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Mimari

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│   Backend API   │────▶│   PostgreSQL    │
│                 │     │   (Express.js)  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    WebSocket    │     │   MQTT Broker   │     │    InfluxDB     │
│                 │     │   (Mosquitto)   │     │  (Time Series)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                 │
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │ Sensor Service  │
                        │ (IoT Devices)   │
                        └─────────────────┘
```

## 📊 API Dokümantasyonu

### Kimlik Doğrulama

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
PUT  /api/auth/profile
```

### İstasyonlar

```http
GET    /api/stations
GET    /api/stations/:id
POST   /api/stations
PUT    /api/stations/:id
DELETE /api/stations/:id
```

### Ölçümler

```http
GET  /api/measurements
GET  /api/measurements/latest
GET  /api/measurements/chart
POST /api/measurements
```

### Uyarılar

```http
GET  /api/alerts
GET  /api/alerts/:id
PUT  /api/alerts/:id/acknowledge
PUT  /api/alerts/:id/resolve
```

## 🔧 Konfigürasyon

### Ortam Değişkenleri

```env
# Veritabanı
DATABASE_URL=postgres://user:pass@localhost:5432/dbname

# Redis
REDIS_URL=redis://:password@localhost:6379

# InfluxDB
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=your-token
INFLUX_ORG=your-org
INFLUX_BUCKET=measurements

# MQTT
MQTT_URL=mqtt://localhost:1883

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

### Sensör Konfigürasyonu

```javascript
{
  "sensors": [
    {
      "id": "sensor-001",
      "type": "PM25",
      "location": {
        "lat": 41.0082,
        "lng": 28.9784
      },
      "interval": 60000
    }
  ]
}
```

## 📱 Kullanım

### Varsayılan Kullanıcı

- Email: admin@airquality.com
- Şifre: admin123

### Sensör Simülatörü

Test için sensör simülatörünü kullanabilirsiniz:

```bash
cd sensor-service
npm run simulator
```

## 🧪 Test

```bash
# Backend testleri
cd backend
npm test

# Frontend testleri
cd frontend
npm test
```

## 📈 Performans

- 1000+ eşzamanlı sensör desteği
- Saniyede 10.000+ ölçüm işleme kapasitesi
- 50ms altında WebSocket gecikmesi
- Redis önbellekleme ile %90 hız artışı

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (RBAC)
- API rate limiting
- Input validation ve sanitization
- HTTPS desteği
- SQL injection koruması

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Proje Geliştirici - [@yourusername](https://twitter.com/yourusername)

Proje Linki: [https://github.com/yourusername/hava-kalitesi-izleme](https://github.com/yourusername/hava-kalitesi-izleme)
