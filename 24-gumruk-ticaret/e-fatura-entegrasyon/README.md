# E-Fatura Entegrasyon Sistemi

Bu modül **gümrük ve ticaret** kategorisi altında kamu kurumları için geliştirilecek açık kaynak **e-fatura entegrasyon** projesidir. Sistem, GİB (Gelir İdaresi Başkanlığı) e-fatura sistemine tam uyumlu entegrasyon çözümü sunar.

## 🚀 Proje Hakkında

E-Fatura Entegrasyon Sistemi, işletmelerin ve kamu kurumlarının e-fatura, e-arşiv, e-irsaliye ve e-müstahsil makbuzu süreçlerini yöneten kapsamlı bir platformdur. GİB web servisleri ile entegre çalışarak fatura oluşturma, gönderme, alma ve saklama işlemlerini otomatikleştirir.

## ✨ Özellikler

### Temel Özellikler
- [x] GİB web servisleri entegrasyonu
- [x] E-fatura oluşturma ve gönderme
- [x] E-arşiv fatura desteği
- [x] E-irsaliye yönetimi
- [x] E-müstahsil makbuzu
- [x] UBL-TR 2.1 formatı desteği
- [x] Elektronik imza ve mühür
- [x] Otomatik arşivleme

### Fatura İşlemleri
- Temel/Ticari fatura oluşturma
- Toplu fatura gönderimi
- Fatura iptal/itiraz yönetimi
- Red/kabul işlemleri
- Fatura kopyalama ve şablonlar
- Otomatik numara yönetimi
- Çoklu döviz desteği
- KDV muafiyet kodları

### Entegrasyon Özellikleri
- ERP/muhasebe yazılımı entegrasyonu
- REST API ve SOAP servisleri
- Webhook bildirimleri
- Batch işlem desteği
- Otomatik senkronizasyon
- Hata yönetimi ve retry mekanizması
- Performans optimizasyonu

### Raporlama ve Analiz
- Fatura listeleri ve filtreleme
- Gelen/giden fatura raporları
- KDV raporları
- E-defter uyumlu raporlar
- Müşteri bazlı analizler
- Grafik ve dashboard
- Excel/PDF dışa aktarım

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL
- **Cache:** Redis
- **Queue:** Bull + Redis
- **ORM:** Objection.js + Knex.js
- **XML İşleme:** libxmljs2 + xmlbuilder2
- **API Dokümantasyon:** Swagger/OpenAPI

### Frontend
- **Framework:** React.js + TypeScript
- **UI Library:** Ant Design
- **State Management:** Redux Toolkit
- **Forms:** React Hook Form
- **PDF Görüntüleme:** React-PDF
- **Grafikler:** Recharts

### GİB Entegrasyon
- **Protokol:** SOAP + REST
- **Güvenlik:** WS-Security + SSL/TLS
- **İmza:** Elektronik imza (e-imza)
- **Format:** UBL-TR 2.1
- **Şifreleme:** SHA-256 + RSA

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
- Redis 7+
- GİB Test hesabı
- Elektronik imza sertifikası

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/e-fatura-entegrasyon.git
cd e-fatura-entegrasyon

# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin (GİB kredileri)

# Veritabanı migration
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

# GİB bağlantı testi
docker-compose exec backend npm run test:gib
```

## 📡 API Endpoints

### Fatura İşlemleri
- `POST /api/v1/invoices/create` - Fatura oluştur
- `POST /api/v1/invoices/send` - Fatura gönder
- `GET /api/v1/invoices/:uuid` - Fatura detayı
- `POST /api/v1/invoices/:uuid/cancel` - Fatura iptal
- `GET /api/v1/invoices/:uuid/pdf` - PDF indir
- `GET /api/v1/invoices/:uuid/ubl` - UBL XML indir

### E-Arşiv
- `POST /api/v1/archive/create` - E-arşiv oluştur
- `POST /api/v1/archive/report` - GİB raporu
- `GET /api/v1/archive/list` - E-arşiv listesi

### E-İrsaliye
- `POST /api/v1/despatch/create` - İrsaliye oluştur
- `GET /api/v1/despatch/:uuid` - İrsaliye detayı
- `POST /api/v1/despatch/:uuid/response` - Yanıt gönder

### GİB İşlemleri
- `GET /api/v1/gib/user-list` - Mükellef sorgulama
- `POST /api/v1/gib/send-invoice` - GİB'e gönder
- `GET /api/v1/gib/inbox` - Gelen kutusu
- `GET /api/v1/gib/outbox` - Giden kutusu
- `POST /api/v1/gib/get-invoice` - Fatura indir

### Raporlar
- `GET /api/v1/reports/summary` - Özet rapor
- `GET /api/v1/reports/vat` - KDV raporu
- `GET /api/v1/reports/customer` - Müşteri raporu
- `POST /api/v1/reports/export` - Rapor dışa aktarım

### Yönetim
- `GET /api/v1/settings/series` - Seri yönetimi
- `POST /api/v1/settings/signature` - İmza ayarları
- `GET /api/v1/settings/templates` - Şablon yönetimi
- `POST /api/v1/settings/integration` - Entegrasyon ayarları

## 🔒 Güvenlik

- Elektronik imza zorunluluğu
- SSL/TLS şifreli iletişim
- GİB kullanıcı doğrulama
- API anahtarı yönetimi
- Rate limiting
- Veri şifreleme
- Audit logging

## 📱 Özellikler

- Responsive tasarım
- Toplu işlem desteği
- Otomatik hata düzeltme
- Performans optimizasyonu
- 7/24 erişim
- Yedekleme ve arşivleme

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: e-fatura@ticaret.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/e-fatura-entegrasyon/wiki)
