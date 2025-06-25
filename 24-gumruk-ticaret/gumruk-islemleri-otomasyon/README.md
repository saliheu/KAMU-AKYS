# Gümrük İşlemleri Otomasyon Sistemi

Bu modül **gümrük ve ticaret** kategorisi altında kamu kurumları için geliştirilecek açık kaynak **gümrük işlemleri otomasyon** projesidir. Sistem, gümrük beyannamesi, tarife hesaplama, risk analizi ve lojistik süreçlerini dijitalleştirir.

## 🚀 Proje Hakkında

Gümrük İşlemleri Otomasyon Sistemi, gümrük müdürlükleri ve dış ticaret firmalarının tüm gümrük işlemlerini tek platformdan yönetmelerini sağlayan kapsamlı bir çözümdür. BİLGE sistemi ile entegre çalışarak, ithalat/ihracat işlemlerini hızlandırır ve kolaylaştırır.

## ✨ Özellikler

### Temel Özellikler
- [x] Gümrük beyannamesi hazırlama ve gönderme
- [x] Otomatik GTİP kodu tespiti
- [x] Tarife ve vergi hesaplama
- [x] Risk analizi ve kırmızı/yeşil hat
- [x] Elektronik belge yönetimi
- [x] Antrepo ve geçici depolama takibi
- [x] TIR-Karnesi işlemleri
- [x] Tek Pencere Sistemi (TPS) entegrasyonu

### Beyanname İşlemleri
- İthalat/İhracat beyannamesi
- Transit beyannamesi
- Özet beyan
- Tamamlayıcı beyanname
- ENS/EXS bildirimleri
- A.TR belgesi düzenleme
- EUR.1 dolaşım belgesi
- Menşe şahadetnamesi

### Risk Yönetimi
- AI destekli risk analizi
- Firma risk profili
- Ürün bazlı risk skorlama
- Kırmızı/sarı/yeşil hat yönlendirme
- Anomali tespiti
- Kaçakçılık önleme algoritmaları
- Muayene önceliklendirme

### Entegrasyonlar
- BİLGE Sistemi
- Tek Pencere Sistemi (TPS)
- NCTS (Yeni Bilgisayarlı Transit Sistemi)
- E-Devlet Kapısı
- Bankalar (teminat işlemleri)
- Nakliye firmaları
- Gümrük müşavirleri

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL + MongoDB
- **Cache:** Redis
- **Message Queue:** Apache Kafka
- **ORM:** Sequelize
- **API Dokümantasyon:** Swagger/OpenAPI
- **Authentication:** JWT + OAuth2

### Frontend
- **Framework:** React.js + TypeScript
- **UI Library:** Ant Design Pro
- **State Management:** Redux Toolkit + RTK Query
- **Forms:** Formik + Yup
- **Grafikler:** Apache ECharts
- **PDF İşleme:** React-PDF

### AI & Analytics
- **Risk Analizi:** TensorFlow.js / Brain.js
- **OCR:** Tesseract.js
- **GTİP Tahmini:** Custom ML Model
- **Anomali Tespiti:** Isolation Forest

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
- MongoDB 6+
- Redis 7+
- Docker & Docker Compose

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/gumruk-islemleri-otomasyon.git
cd gumruk-islemleri-otomasyon

# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanı migration
npm run migrate
npm run seed

# Tarife güncellemesi
npm run tariff-update

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

# Risk analizi modelini yükleyin
docker-compose exec backend npm run risk-analysis
```

## 📡 API Endpoints

### Beyanname İşlemleri
- `POST /api/v1/declarations/create` - Beyanname oluştur
- `GET /api/v1/declarations/:id` - Beyanname detayı
- `POST /api/v1/declarations/:id/submit` - Beyannameyi gönder
- `PUT /api/v1/declarations/:id/update` - Beyanname güncelle
- `GET /api/v1/declarations/:id/status` - Durum sorgulama

### GTİP ve Tarife
- `GET /api/v1/tariff/search` - GTİP kodu arama
- `POST /api/v1/tariff/calculate` - Vergi hesaplama
- `GET /api/v1/tariff/rates` - Güncel tarife oranları
- `POST /api/v1/tariff/ai-suggest` - AI ile GTİP önerisi

### Risk Analizi
- `POST /api/v1/risk/analyze` - Risk analizi yap
- `GET /api/v1/risk/profile/:firmId` - Firma risk profili
- `GET /api/v1/risk/history` - Risk geçmişi
- `POST /api/v1/risk/update-model` - Model güncelleme

### Belge Yönetimi
- `POST /api/v1/documents/upload` - Belge yükleme
- `GET /api/v1/documents/:id` - Belge görüntüleme
- `POST /api/v1/documents/ocr` - OCR ile okuma
- `GET /api/v1/documents/template/:type` - Belge şablonu

### Muayene ve Kontrol
- `POST /api/v1/inspection/request` - Muayene talebi
- `GET /api/v1/inspection/:id/result` - Muayene sonucu
- `POST /api/v1/inspection/:id/photos` - Fotoğraf yükleme
- `GET /api/v1/inspection/schedule` - Muayene takvimi

### Raporlar
- `GET /api/v1/reports/statistics` - İstatistikler
- `GET /api/v1/reports/performance` - Performans raporu
- `GET /api/v1/reports/compliance` - Uyumluluk raporu
- `POST /api/v1/reports/custom` - Özel rapor

## 🔒 Güvenlik

- End-to-end şifreleme
- Elektronik imza desteği
- Multi-factor authentication
- Role-based access control
- API rate limiting
- Audit logging
- Data masking

## 📱 Mobil Özellikler

- Beyanname takibi
- Muayene fotoğraf çekimi
- Push bildirimleri
- QR kod ile belge doğrulama
- Offline çalışma modu

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: gumruk-otomasyon@ticaret.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/gumruk-islemleri-otomasyon/wiki)
