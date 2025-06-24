# Geri Dönüşüm Takip Sistemi

Akıllı şehirler için kapsamlı geri dönüşüm ve atık yönetimi takip sistemi.

## Özellikler

- ✅ QR kod ile atık takibi
- ✅ IoT sensörlerle konteyner doluluk takibi
- ✅ Mobil uygulama ile vatandaş katılımı
- ✅ Geri dönüşüm puanı ve ödül sistemi
- ✅ Rota optimizasyonu için toplama planlaması
- ✅ Gerçek zamanlı harita görüntüleme
- ✅ Atık türlerine göre istatistikler
- ✅ Karbon ayak izi hesaplama
- ✅ Belediye entegrasyonu
- ✅ Raporlama ve analitik

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL + PostGIS
- Redis
- MQTT (IoT iletişimi)
- Socket.io
- Bull Queue

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Leaflet (harita)
- Chart.js

### Mobil
- React Native
- QR kod tarayıcı

## Kurulum

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/waste/scan` - QR kod ile atık kaydı
- `GET /api/containers` - Konteyner konumları
- `POST /api/collection/optimize` - Rota optimizasyonu
- `GET /api/users/:id/points` - Kullanıcı puanları
- `GET /api/analytics/carbon` - Karbon tasarrufu

## Lisans
MIT