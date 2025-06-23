# Çay Ocağı Yönetim Sistemi

Kamu kurumları için geliştirilmiş açık kaynak çay ocağı yönetim sistemi. Malzeme takibi, tüketim yönetimi, raporlama ve personel yönetimi özelliklerini içerir.

## 🚀 Özellikler

- **Malzeme Yönetimi**: Stok takibi, kritik stok uyarıları
- **Tüketim Takibi**: Günlük tüketim kayıtları, stok giriş/çıkış
- **Raporlama**: Maliyet analizi, stok durumu, trend raporları
- **Personel Yönetimi**: Kullanıcı yetkilendirme, rol yönetimi
- **Dashboard**: Anlık durum özeti, kritik stok bildirimleri

## 🛠️ Teknoloji Stack

### Backend
- Node.js + Express.js
- MongoDB
- JWT Authentication
- Bcrypt.js

### Frontend
- React 18
- Tailwind CSS
- React Router v6
- Recharts (grafikler)
- Axios

## 📋 Gereksinimler

- Node.js v14+
- MongoDB v4.4+
- npm veya yarn

## 🔧 Kurulum

### 1. Repoyu klonlayın
```bash
git clone [repo-url]
cd cay-ocagi-yonetim-sistemi
```

### 2. Bağımlılıkları yükleyin
```bash
npm run install:all
```

### 3. Environment dosyasını oluşturun
```bash
cp backend/.env.example backend/.env
```

### 4. MongoDB'yi başlatın
```bash
# Docker kullanıyorsanız
docker-compose up -d mongodb

# Veya lokal MongoDB kullanın
```

### 5. Uygulamayı başlatın
```bash
# Development modunda
npm run dev

# Veya ayrı ayrı
cd backend && npm run dev
cd frontend && npm start
```

## 🐳 Docker ile Çalıştırma

```bash
docker-compose up -d
```

Uygulama şu adreslerde çalışacaktır:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## 🔐 İlk Giriş

Sistem ilk kurulumda demo kullanıcı oluşturur:
- Kullanıcı: admin
- Şifre: 123456

**ÖNEMLİ**: Üretim ortamında bu kullanıcıyı değiştirin!

## 📚 API Endpoints

### Auth
- POST `/api/auth/login` - Giriş yap
- POST `/api/auth/register` - Yeni kullanıcı
- GET `/api/auth/me` - Mevcut kullanıcı

### Malzemeler
- GET `/api/malzemeler` - Tüm malzemeler
- POST `/api/malzemeler` - Yeni malzeme (Admin)
- PUT `/api/malzemeler/:id` - Malzeme güncelle (Admin)
- DELETE `/api/malzemeler/:id` - Malzeme sil (Admin)

### Tüketim
- GET `/api/tuketim` - Tüketim kayıtları
- POST `/api/tuketim` - Yeni tüketim kaydı
- GET `/api/tuketim/gunluk-ozet` - Günlük özet

### Raporlar
- GET `/api/raporlar/stok-durumu` - Stok durumu
- GET `/api/raporlar/aylik` - Aylık rapor
- GET `/api/raporlar/maliyet-analizi` - Maliyet analizi

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 İletişim

Proje Sahibi: Kamu AKYS Ekibi

---

🇹🇷 Türkiye Cumhuriyeti kamu kurumları için açık kaynak çözüm