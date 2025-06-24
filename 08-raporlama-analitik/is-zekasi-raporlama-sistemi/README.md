# İş Zekası Raporlama Sistemi

Kamu kurumları için geliştirilmiş kapsamlı iş zekası ve raporlama platformu.

## Özellikler

- ✅ Gerçek zamanlı veri görselleştirme
- ✅ Özelleştirilebilir dashboard'lar
- ✅ Otomatik rapor oluşturma ve zamanlama
- ✅ Çoklu veri kaynağı desteği (SQL, NoSQL, API, CSV, Excel)
- ✅ Gelişmiş grafik ve chart kütüphanesi
- ✅ Veri analizi ve tahminleme
- ✅ KPI takibi ve uyarı sistemi
- ✅ Rol bazlı erişim kontrolü
- ✅ Rapor paylaşımı ve export (PDF, Excel, CSV)
- ✅ Mobil uyumlu arayüz

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL (ana veritabanı)
- MongoDB (esnek veri saklama)
- Redis (önbellekleme)
- ClickHouse (analitik veritabanı)
- Apache Kafka (veri akışı)
- Bull Queue (arka plan işleri)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Recharts & D3.js
- Apache ECharts
- Socket.io Client

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

## Varsayılan Kullanıcı
- Email: admin@bi.gov.tr
- Şifre: Admin123!

## Lisans
MIT