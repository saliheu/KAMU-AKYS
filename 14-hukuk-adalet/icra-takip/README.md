# İcra Takip Sistemi

Bu modül **hukuk ve adalet** kategorisi altında kamu kurumları için geliştirilecek açık kaynak **icra takip** projesidir. Sistem, icra müdürlükleri ve avukatların icra takip süreçlerini dijital ortamda yönetmelerini sağlar.

## 🚀 Proje Hakkında

İcra Takip Sistemi, icra ve iflas takip işlemlerinin elektronik ortamda yürütülmesini sağlayan kapsamlı bir platformdur. UYAP ile entegre çalışarak, alacaklı ve borçluların takip süreçlerini hızlandırır, maliyetleri azaltır ve şeffaflık sağlar.

## ✨ Özellikler

### Temel Özellikler
- [x] UYAP entegrasyonu
- [x] E-haciz işlemleri
- [x] Otomatik faiz hesaplama
- [x] Dosya ve taraf yönetimi
- [x] Ödeme takibi ve makbuz
- [x] İtiraz ve şikayet yönetimi
- [x] Haciz ve satış işlemleri
- [x] Elektronik tebligat entegrasyonu

### Takip Türleri
- İlamsız icra takibi
- İlamlı icra takibi
- Kambiyo senetlerine mahsus takip
- Kiralanan taşınmazın tahliyesi
- İflas takibi
- Rehnin paraya çevrilmesi
- İpoteğin paraya çevrilmesi
- Haciz yoluyla takip

### İcra İşlemleri
- Takip talebi oluşturma
- Ödeme emri düzenleme
- İtiraz ve şikayet işlemleri
- Haciz tutanağı hazırlama
- Satış ilanı ve ihalesi
- Paraların paylaştırılması
- İnfaz ve tahliye
- Dosya devir ve birleştirme

### Entegrasyonlar
- UYAP (Ulusal Yargı Ağı Projesi)
- MERNİS (Nüfus kayıtları)
- TAKBIS (Tapu kayıtları)
- Trafik Tescil
- Bankalar (hesap/maaş haczi)
- SGK (emekli maaşı haczi)
- Vergi daireleri
- PTT (adres sorgulama)

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL
- **Cache:** Redis
- **Queue:** Bull + Redis
- **ORM:** Sequelize
- **API Dokümantasyon:** Swagger/OpenAPI
- **Authentication:** JWT + OAuth2

### Frontend
- **Framework:** React.js + TypeScript
- **UI Library:** Ant Design Pro
- **State Management:** Redux Toolkit
- **Forms:** Formik + Yup
- **Grafikler:** Recharts
- **PDF İşleme:** React-PDF

### Hesaplama & İşlem
- **Faiz Hesaplama:** Custom Calculator
- **Para Birimleri:** Big.js / Decimal.js
- **Tarih İşlemleri:** date-fns / moment.js
- **Raporlama:** JasperReports / PDFKit

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
git clone https://github.com/kamu-kurum/icra-takip.git
cd icra-takip

# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

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

# İlk kurulum scriptlerini çalıştırın
docker-compose exec backend npm run calculate-interest
```

## 📡 API Endpoints

### Takip İşlemleri
- `POST /api/v1/proceedings/create` - Yeni takip başlat
- `GET /api/v1/proceedings/:id` - Takip detayı
- `PUT /api/v1/proceedings/:id` - Takip güncelle
- `GET /api/v1/proceedings/:id/history` - İşlem geçmişi
- `POST /api/v1/proceedings/:id/close` - Takip kapat

### Ödeme Emirleri
- `POST /api/v1/payment-orders/create` - Ödeme emri oluştur
- `GET /api/v1/payment-orders/:id` - Ödeme emri detayı
- `POST /api/v1/payment-orders/:id/notify` - Tebliğ et
- `GET /api/v1/payment-orders/:id/status` - Tebligat durumu

### İtiraz ve Şikayetler
- `POST /api/v1/objections/create` - İtiraz kaydı
- `GET /api/v1/objections/:id` - İtiraz detayı
- `POST /api/v1/objections/:id/response` - İtiraz yanıtı
- `GET /api/v1/objections/list` - İtiraz listesi

### Haciz İşlemleri
- `POST /api/v1/seizures/create` - Haciz talebi
- `GET /api/v1/seizures/:id` - Haciz detayı
- `POST /api/v1/seizures/:id/assets` - Mal bildirimi
- `POST /api/v1/seizures/:id/release` - Haciz kaldırma

### Satış İşlemleri
- `POST /api/v1/auctions/create` - Satış ilanı
- `GET /api/v1/auctions/:id` - İhale detayı
- `POST /api/v1/auctions/:id/bid` - Teklif ver
- `POST /api/v1/auctions/:id/complete` - Satış tamamla

### Hesaplamalar
- `POST /api/v1/calculations/interest` - Faiz hesaplama
- `POST /api/v1/calculations/costs` - Masraf hesaplama
- `GET /api/v1/calculations/rates` - Güncel oranlar
- `POST /api/v1/calculations/installment` - Taksitlendirme

### Raporlar
- `GET /api/v1/reports/daily` - Günlük rapor
- `GET /api/v1/reports/statistics` - İstatistikler
- `GET /api/v1/reports/performance` - Performans raporu
- `POST /api/v1/reports/custom` - Özel rapor

## 🔒 Güvenlik

- E-imza zorunluluğu
- SSL/TLS şifreleme
- Role-based access control
- API rate limiting
- Data masking
- Audit logging
- KVKK uyumluluğu

## 📱 Mobil Özellikler

- Dosya takibi
- Ödeme bildirimleri
- Belge görüntüleme
- İtiraz/şikayet
- Borç sorgulama

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: icra-takip@adalet.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/icra-takip/wiki)
