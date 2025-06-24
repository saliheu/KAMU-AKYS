# Dijital Kütüphane Yönetim Sistemi

Modern bir dijital kütüphane yönetim sistemi. Kullanıcılar kitap ödünç alabilir, rezervasyon yapabilir, koleksiyon oluşturabilir ve kitapları değerlendirebilir.

## Özellikler

### Kullanıcı Özellikleri
- ✅ Kitap arama ve filtreleme
- ✅ PDF/EPUB okuyucu
- ✅ Kitap ödünç alma ve rezervasyon
- ✅ Kitap değerlendirme ve yorum yapma
- ✅ Kişisel koleksiyon oluşturma
- ✅ Okuma istatistikleri
- ✅ Bildirim sistemi
- ✅ Profil yönetimi

### Admin Özellikleri
- ✅ Kitap yönetimi (CRUD)
- ✅ Kullanıcı yönetimi
- ✅ Detaylı raporlar ve istatistikler
- ✅ Kategori yönetimi
- ✅ Ödünç alma işlemleri takibi
- ✅ Sistem ayarları

### Teknik Özellikler
- ✅ Elasticsearch ile gelişmiş arama
- ✅ Redis ile önbellekleme
- ✅ Gerçek zamanlı bildirimler (Socket.io)
- ✅ E-posta bildirimleri
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Dosya yükleme (kitap PDF/EPUB)
- ✅ Arka plan görevleri (Bull Queue)
- ✅ Zamanlanmış görevler

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- Redis (önbellekleme)
- Elasticsearch (tam metin arama)
- Socket.io (gerçek zamanlı iletişim)
- Bull Queue (arka plan görevleri)
- JWT (kimlik doğrulama)
- Multer (dosya yükleme)
- Nodemailer (e-posta)

### Frontend
- React 18 + TypeScript
- Redux Toolkit (state yönetimi)
- React Query (server state)
- Material-UI (UI komponenleri)
- React Router v6
- Socket.io Client
- React Hook Form + Yup
- Vite (build tool)

## Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Elasticsearch 8+
- Docker (opsiyonel)

### Docker ile Kurulum (Önerilen)

1. Repoyu klonlayın:
```bash
git clone https://github.com/yourusername/dijital-kutuphane.git
cd dijital-kutuphane
```

2. Geliştirme ortamı için servisleri başlatın:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

3. Backend kurulumu:
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

4. Frontend kurulumu:
```bash
cd ../frontend
npm install
npm run dev
```

### Manuel Kurulum

1. PostgreSQL, Redis ve Elasticsearch'ü kurun ve çalıştırın

2. Veritabanı oluşturun:
```sql
CREATE DATABASE library_db;
```

3. Backend kurulumu:
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

4. Frontend kurulumu:
```bash
cd ../frontend
npm install
npm run dev
```

## Ortam Değişkenleri

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://library_user:library_pass@localhost:5432/library_db

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@library.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=/api
VITE_SOCKET_URL=/
```

## Kullanım

### Varsayılan Admin Hesabı
- Email: admin@library.com
- Şifre: admin123

### API Endpoints

#### Auth
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/logout` - Çıkış yap
- `POST /api/auth/refresh` - Token yenile
- `GET /api/auth/profile` - Profil bilgileri
- `PUT /api/auth/profile` - Profil güncelle

#### Books
- `GET /api/books` - Kitapları listele
- `GET /api/books/:id` - Kitap detayı
- `POST /api/books` - Kitap ekle (Admin)
- `PUT /api/books/:id` - Kitap güncelle (Admin)
- `DELETE /api/books/:id` - Kitap sil (Admin)
- `GET /api/books/:id/download` - Kitap indir

#### Borrowings
- `GET /api/borrowings` - Ödünç işlemleri
- `POST /api/borrowings` - Kitap ödünç ver
- `PUT /api/borrowings/:id/renew` - Süre uzat
- `PUT /api/borrowings/:id/return` - Kitap iade et

## Proje Yapısı

```
dijital-kutuphane/
├── backend/
│   ├── config/         # Veritabanı ve servis konfigürasyonları
│   ├── middleware/     # Express middleware'leri
│   ├── models/         # Sequelize modelleri
│   ├── routes/         # API rotaları
│   ├── services/       # İş mantığı servisleri
│   ├── utils/          # Yardımcı fonksiyonlar
│   ├── jobs/           # Arka plan görevleri
│   ├── queues/         # Bull queue tanımları
│   └── server.js       # Ana sunucu dosyası
├── frontend/
│   ├── src/
│   │   ├── components/ # React komponenleri
│   │   ├── pages/      # Sayfa komponenleri
│   │   ├── layouts/    # Layout komponenleri
│   │   ├── services/   # API servisleri
│   │   ├── store/      # Redux store
│   │   ├── hooks/      # Custom React hooks
│   │   ├── types/      # TypeScript tipleri
│   │   └── App.tsx     # Ana uygulama komponenti
│   └── package.json
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

## Lisans

MIT

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'e push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın
