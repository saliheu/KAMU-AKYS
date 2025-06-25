# Trafik Yoğunluk İzleme Sistemi

Akıllı şehirler için gerçek zamanlı trafik yoğunluğu izleme, analiz ve yönetim sistemi.

## Özellikler

### Trafik İzleme
- ✅ Gerçek zamanlı trafik yoğunluk haritası
- ✅ Kamera ve sensör entegrasyonu
- ✅ AI destekli araç sayımı
- ✅ Ortalama hız hesaplama
- ✅ Trafik akış analizi

### Akıllı Yönetim
- ✅ Adaptif trafik ışığı kontrolü
- ✅ Dinamik rota önerileri
- ✅ Tıkanıklık tahmin sistemi
- ✅ Olay tespit ve uyarı
- ✅ Acil durum koridoru yönetimi

### Veri Kaynakları
- ✅ CCTV kamera görüntüleri
- ✅ IoT trafik sensörleri
- ✅ GPS verileri
- ✅ Mobil uygulama verileri
- ✅ Sosyal medya entegrasyonu

### Analitik ve Raporlama
- ✅ Trafik yoğunluk ısı haritası
- ✅ Zaman bazlı trafik analizi
- ✅ Performans metrikleri
- ✅ Tahmine dayalı analitik
- ✅ Karbon emisyon hesaplama

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL (ana veri)
- InfluxDB (zaman serisi)
- Redis (önbellekleme)
- Kafka (veri akışı)
- TensorFlow.js (AI)
- OpenCV (görüntü işleme)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Mapbox GL JS
- D3.js (görselleştirme)
- Socket.io Client

## API Endpoints

### Trafik Verileri
- `GET /api/traffic/realtime` - Gerçek zamanlı veri
- `GET /api/traffic/density/:area` - Bölge yoğunluğu
- `GET /api/traffic/flow/:road` - Yol akış hızı
- `POST /api/traffic/predict` - Yoğunluk tahmini

### Sensörler
- `GET /api/sensors` - Sensör listesi
- `POST /api/sensors/data` - Veri alımı
- `GET /api/sensors/:id/status` - Sensör durumu

### Analitik
- `GET /api/analytics/heatmap` - Isı haritası
- `GET /api/analytics/trends` - Trendler
- `GET /api/analytics/incidents` - Olaylar

## Varsayılan Kullanıcı

- Email: admin@trafik.gov.tr
- Şifre: Admin123!

## Lisans

MIT