# Mahkeme Randevu Sistemi - Backend

T.C. Adalet Bakanlığı Mahkeme Randevu Sistemi backend uygulaması.

## Özellikler

- 🔐 JWT tabanlı kimlik doğrulama
- 🏛️ E-Devlet entegrasyonu
- ⚖️ UYAP sistemi entegrasyonu
- 📧 E-posta bildirimleri
- 📱 SMS bildirimleri
- 📅 Randevu yönetimi
- 👨‍⚖️ Hakim ve avukat yönetimi
- 🏢 Mahkeme yönetimi
- 📊 İstatistik ve raporlama
- 🔄 Otomatik hatırlatıcılar
- 🗄️ PostgreSQL veritabanı
- 💾 Redis önbellekleme
- 📝 Swagger API dokümantasyonu

## Kurulum

### Gereksinimler

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- Redis >= 6.0
- npm >= 9.0.0

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin:
```bash
cp .env.example .env
```

3. Veritabanını oluşturun:
```bash
createdb mahkeme_randevu
```

4. Veritabanı tablolarını oluşturun:
```bash
npm run db:migrate
```

5. Test verileri ekleyin (opsiyonel):
```bash
npm run db:seed
```

6. Uygulamayı başlatın:
```bash
# Development
npm run dev

# Production
npm start
```

## API Dokümantasyonu

API dokümantasyonuna `http://localhost:3000/api-docs` adresinden erişebilirsiniz.

## Proje Yapısı

```
backend/
├── config/           # Yapılandırma dosyaları
│   ├── database.js   # PostgreSQL yapılandırması
│   ├── redis.js      # Redis yapılandırması
│   ├── passport.js   # Kimlik doğrulama stratejileri
│   └── swagger.js    # API dokümantasyonu
├── controllers/      # İş mantığı kontrolörleri
├── jobs/            # Zamanlanmış görevler
├── middleware/      # Express middleware'leri
├── models/          # Veritabanı modelleri
├── routes/          # API rotaları
├── services/        # Dış servis entegrasyonları
├── utils/           # Yardımcı fonksiyonlar
├── server.js        # Ana uygulama dosyası
└── package.json     # Proje bağımlılıkları
```

## Güvenlik

- Tüm hassas veriler şifrelenir
- Rate limiting ile DoS koruması
- SQL injection koruması
- XSS koruması
- CORS yapılandırması
- Helmet.js ile güvenlik başlıkları
- JWT token doğrulaması
- Brute force koruması

## Komutlar

```bash
# Development sunucusu
npm run dev

# Production sunucusu
npm start

# Testleri çalıştır
npm test

# Kod kalitesi kontrolü
npm run lint

# Hatırlatıcı görevi çalıştır
npm run jobs:reminder

# Temizlik görevi çalıştır
npm run jobs:cleanup
```

## Lisans

Bu proje T.C. Adalet Bakanlığı'na aittir ve özel lisans altındadır.