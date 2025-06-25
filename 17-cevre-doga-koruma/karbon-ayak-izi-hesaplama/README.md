# Karbon Ayak İzi Hesaplama Sistemi

Bu modül **çevre ve doğa koruma** kategorisi altında kamu kurumları için geliştirilecek açık kaynak **karbon ayak izi hesaplama** projesidir. Sistem, kurumların ve bireylerin karbon emisyonlarını hesaplamak, izlemek ve azaltmak için kapsamlı bir platform sunar.

## 🚀 Proje Hakkında

Karbon Ayak İzi Hesaplama Sistemi, kamu kurumları, özel sektör ve bireylerin sera gazı emisyonlarını GHG Protocol standartlarına uygun olarak hesaplayan, karbon nötr hedeflerine ulaşmalarına yardımcı olan modern bir platformdur. ISO 14064, PAS 2050 ve diğer uluslararası standartları destekler.

## ✨ Özellikler

### Temel Özellikler
- [x] Kapsam 1, 2 ve 3 emisyon hesaplamaları
- [x] GHG Protocol uyumlu metodoloji
- [x] Sektör bazlı emisyon faktörleri
- [x] Otomatik veri toplama ve entegrasyon
- [x] Gerçek zamanlı karbon takibi
- [x] Karbon dengeleme projeleri
- [x] Sertifika ve raporlama sistemi
- [x] Mobil uygulama desteği

### Hesaplama Kategorileri

#### Kurumsal Karbon Ayak İzi
- Enerji tüketimi (elektrik, doğalgaz, kömür)
- Ulaşım ve lojistik
- Üretim süreçleri
- Atık yönetimi
- Su kullanımı
- Tedarik zinciri
- Çalışan seyahatleri
- Varlık yaşam döngüsü

#### Bireysel Karbon Ayak İzi
- Ev enerji tüketimi
- Ulaşım (özel araç, toplu taşıma, uçak)
- Beslenme alışkanlıkları
- Alışveriş ve tüketim
- Atık üretimi
- Su kullanımı

### Analiz ve Raporlama
- Detaylı emisyon raporları
- Trend analizleri
- Karşılaştırmalı değerlendirmeler
- Hedef belirleme ve takip
- Azaltım senaryoları
- Maliyet-fayda analizleri
- Yasal uyumluluk raporları

### Özel Özellikler
- AI destekli emisyon tahmini
- Blockchain tabanlı karbon kredisi
- IoT sensör entegrasyonu
- Uydu görüntüleri analizi
- Karbon piyasası entegrasyonu
- Yeşil finansman desteği

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL + TimescaleDB
- **Cache:** Redis
- **Queue:** Bull + Redis
- **ORM:** Objection.js + Knex.js
- **API Dokümantasyon:** Swagger/OpenAPI
- **Authentication:** JWT + OAuth2

### Frontend
- **Framework:** React.js + TypeScript
- **UI Library:** Material-UI
- **State Management:** Redux Toolkit
- **Grafikler:** D3.js + Recharts
- **Forms:** React Hook Form
- **Haritalar:** Mapbox GL JS

### Hesaplama Motoru
- **Emisyon Faktörleri:** IPCC, DEFRA, EPA veritabanları
- **Hesaplama Kütüphanesi:** Custom Carbon Calculator Engine
- **Big Data İşleme:** Apache Spark (büyük veri setleri için)

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
- Docker & Docker Compose

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/karbon-ayak-izi-hesaplama.git
cd karbon-ayak-izi-hesaplama

# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanı kurulumu
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

# Emisyon faktörlerini yükleyin
docker-compose exec backend npm run calculate
```

## 📡 API Endpoints

### Hesaplama
- `POST /api/v1/calculate/corporate` - Kurumsal karbon ayak izi
- `POST /api/v1/calculate/individual` - Bireysel karbon ayak izi
- `POST /api/v1/calculate/product` - Ürün karbon ayak izi
- `POST /api/v1/calculate/event` - Etkinlik karbon ayak izi
- `GET /api/v1/calculate/factors` - Emisyon faktörleri

### Veri Girişi
- `POST /api/v1/data/energy` - Enerji tüketim verileri
- `POST /api/v1/data/transport` - Ulaşım verileri
- `POST /api/v1/data/waste` - Atık verileri
- `POST /api/v1/data/import` - Toplu veri yükleme

### Raporlar
- `GET /api/v1/reports/summary` - Özet rapor
- `GET /api/v1/reports/detailed` - Detaylı rapor
- `GET /api/v1/reports/comparison` - Karşılaştırma raporu
- `GET /api/v1/reports/certificate` - Sertifika oluşturma

### Hedefler ve Takip
- `POST /api/v1/targets` - Hedef belirleme
- `GET /api/v1/targets/progress` - İlerleme takibi
- `GET /api/v1/targets/recommendations` - Azaltım önerileri

### Karbon Dengeleme
- `GET /api/v1/offset/projects` - Dengeleme projeleri
- `POST /api/v1/offset/purchase` - Karbon kredisi satın alma
- `GET /api/v1/offset/certificates` - Dengeleme sertifikaları

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama
- API key yönetimi
- Role-based access control (RBAC)
- Veri şifreleme (AES-256)
- HTTPS zorunluluğu
- Audit trail

## 📱 Mobil Özellikler

- Günlük karbon takibi
- Ulaşım modu otomatik tespiti
- Fatura tarama ve otomatik veri girişi
- Push bildirimleri
- Offline hesaplama desteği

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: karbon-ayak-izi@kamu.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/karbon-ayak-izi-hesaplama/wiki)
