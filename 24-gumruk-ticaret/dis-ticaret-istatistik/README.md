# Dış Ticaret İstatistik Sistemi

Bu modül **gümrük ve ticaret** kategorisi altında kamu kurumları için geliştirilecek açık kaynak **dış ticaret istatistik** projesidir. Sistem, ithalat ve ihracat verilerini toplayarak kapsamlı istatistikler, analizler ve raporlar sunar.

## 🚀 Proje Hakkında

Dış Ticaret İstatistik Sistemi, Türkiye'nin dış ticaret verilerini gerçek zamanlı olarak toplayan, işleyen ve analiz eden modern bir platformdur. Ticaret Bakanlığı, TÜİK, gümrük müdürlükleri ve özel sektör tarafından kullanılabilir. Sistem, uluslararası ticaret kodları (HS, SITC, BEC) ve standartlarla uyumlu çalışır.

## ✨ Özellikler

### Temel Özellikler
- [x] Gerçek zamanlı ithalat/ihracat veri toplama
- [x] GTİP bazlı ürün sınıflandırma
- [x] Ülke ve bölge bazlı analizler
- [x] Ticaret dengesi hesaplamaları
- [x] Trend analizleri ve tahminleme
- [x] Interaktif dashboard ve görselleştirme
- [x] Otomatik rapor üretimi
- [x] API ile veri paylaşımı

### Veri Kategorileri
- İthalat/İhracat değerleri
- Ürün grupları (HS, SITC, BEC, ISIC)
- Ülke ve ekonomik bölgeler
- Gümrük rejimleri
- Taşıma modları
- Giriş/Çıkış gümrükleri
- Firma bazlı istatistikler
- Sektörel analizler

### Analiz Özellikleri
- Ticaret dengesi analizi
- Karşılaştırmalı ülke analizleri
- Ürün bazlı pazar payları
- Mevsimsel düzeltme
- Zaman serisi analizleri
- İhracat/İthalat birim değer endeksleri
- Konsantrasyon analizleri
- Rekabet gücü göstergeleri

### Raporlama
- Aylık dış ticaret raporları
- Ülke profil raporları
- Sektörel analiz raporları
- Firma performans raporları
- Özel tarih aralığı raporları
- Karşılaştırmalı dönem raporları
- Excel/PDF/CSV formatlarında dışa aktarım

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL (işlemsel) + ClickHouse (analitik)
- **Cache:** Redis
- **Queue:** Bull + Redis
- **ETL:** Custom ETL Pipeline
- **API Dokümantasyon:** Swagger/OpenAPI
- **Authentication:** JWT + API Keys

### Frontend
- **Framework:** React.js + TypeScript
- **UI Library:** Ant Design
- **State Management:** Redux Toolkit
- **Grafikler:** Apache ECharts + D3.js
- **Tablolar:** AG-Grid
- **Haritalar:** Mapbox GL JS

### Big Data & Analytics
- **OLAP:** ClickHouse
- **Data Processing:** Apache Spark (opsiyonel)
- **Streaming:** Apache Kafka
- **Data Format:** Parquet files

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
- ClickHouse 23+
- Redis 7+
- Docker & Docker Compose

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/dis-ticaret-istatistik.git
cd dis-ticaret-istatistik

# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanı migration
npm run migrate
npm run seed

# ETL işlemlerini başlatın
npm run etl

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

# İlk veri yüklemesi
docker-compose exec backend npm run etl
```

## 📡 API Endpoints

### İstatistik Verileri
- `GET /api/v1/statistics/summary` - Özet istatistikler
- `GET /api/v1/statistics/trade-balance` - Ticaret dengesi
- `GET /api/v1/statistics/by-country` - Ülke bazlı istatistikler
- `GET /api/v1/statistics/by-product` - Ürün bazlı istatistikler
- `GET /api/v1/statistics/time-series` - Zaman serisi verileri

### Analizler
- `GET /api/v1/analysis/trends` - Trend analizleri
- `GET /api/v1/analysis/market-share` - Pazar payı analizi
- `GET /api/v1/analysis/concentration` - Yoğunlaşma analizi
- `GET /api/v1/analysis/competitiveness` - Rekabet gücü analizi

### Sorgulama
- `POST /api/v1/query/custom` - Özel sorgu
- `GET /api/v1/query/products` - Ürün sorgulama
- `GET /api/v1/query/countries` - Ülke sorgulama
- `GET /api/v1/query/companies` - Firma sorgulama

### Raporlar
- `POST /api/v1/reports/generate` - Rapor oluştur
- `GET /api/v1/reports/templates` - Rapor şablonları
- `GET /api/v1/reports/scheduled` - Zamanlanmış raporlar
- `GET /api/v1/reports/download/:id` - Rapor indir

### Referans Veriler
- `GET /api/v1/reference/hs-codes` - GTİP kodları
- `GET /api/v1/reference/countries` - Ülke kodları
- `GET /api/v1/reference/currencies` - Para birimleri
- `GET /api/v1/reference/units` - Ölçü birimleri

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- API key yönetimi
- Role-based access control (RBAC)
- Rate limiting
- Data masking (hassas veriler için)
- Audit logging

## 📊 Dashboard Özellikleri

- Gerçek zamanlı ticaret verileri
- İnteraktif haritalar
- Drill-down özellikli grafikler
- Özelleştirilebilir widget'lar
- Veri dışa aktarımı
- Scheduled dashboard reports

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: dis-ticaret-istatistik@ticaret.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/dis-ticaret-istatistik/wiki)
