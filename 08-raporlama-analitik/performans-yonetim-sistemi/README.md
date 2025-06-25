# Performans Yönetim Sistemi

Kamu kurumları için kapsamlı performans ölçüm, takip ve iyileştirme platformu.

## Özellikler

### KPI Yönetimi
- ✅ Stratejik hedef belirleme
- ✅ KPI tanımlama ve takibi
- ✅ Gerçek zamanlı performans göstergeleri
- ✅ Hedef-gerçekleşme karşılaştırması
- ✅ Otomatik skorlama sistemi

### Çalışan Performansı
- ✅ 360 derece değerlendirme
- ✅ Hedef belirleme ve takip
- ✅ Yetkinlik değerlendirmesi
- ✅ Kariyer gelişim planları
- ✅ Performans görüşmeleri

### Kurum Performansı
- ✅ Birim bazlı performans ölçümü
- ✅ Proje performans takibi
- ✅ Bütçe-performans analizi
- ✅ Verimlilik metrikleri
- ✅ Benchmark analizi

### Raporlama ve Analitik
- ✅ Dinamik dashboardlar
- ✅ Trend analizleri
- ✅ Tahmine dayalı performans
- ✅ Karşılaştırmalı raporlar
- ✅ Drill-down özelliği

### Entegrasyonlar
- ✅ İK sistemleri entegrasyonu
- ✅ Finansal sistemler bağlantısı
- ✅ Proje yönetim araçları
- ✅ E-devlet entegrasyonu
- ✅ API desteği

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis (önbellekleme)
- Socket.io (gerçek zamanlı)
- TensorFlow.js (tahminleme)
- Bull Queue (iş kuyruğu)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Chart.js & D3.js
- React Query

## API Endpoints

### KPI Yönetimi
- `GET /api/kpis` - KPI listesi
- `POST /api/kpis` - Yeni KPI
- `PUT /api/kpis/:id` - KPI güncelleme
- `GET /api/kpis/:id/metrics` - KPI metrikleri
- `POST /api/kpis/:id/calculate` - KPI hesaplama

### Değerlendirmeler
- `GET /api/evaluations` - Değerlendirme listesi
- `POST /api/evaluations` - Yeni değerlendirme
- `GET /api/evaluations/:id` - Değerlendirme detayı
- `POST /api/evaluations/:id/complete` - Değerlendirme tamamlama

### Hedefler
- `GET /api/goals` - Hedef listesi
- `POST /api/goals` - Hedef oluşturma
- `PUT /api/goals/:id/progress` - İlerleme güncelleme
- `GET /api/goals/alignment` - Hedef uyumu

### Raporlar
- `GET /api/reports/dashboard` - Dashboard verileri
- `GET /api/reports/performance` - Performans raporu
- `GET /api/reports/trends` - Trend analizi
- `POST /api/reports/export` - Rapor dışa aktarma

## Varsayılan Kullanıcılar

### Sistem Yöneticisi
- Email: admin@performans.gov.tr
- Şifre: Admin123!

### Yönetici
- Email: yonetici@performans.gov.tr
- Şifre: Yonetici123!

### Çalışan
- Email: calisan@performans.gov.tr
- Şifre: Calisan123!

## Lisans

MIT