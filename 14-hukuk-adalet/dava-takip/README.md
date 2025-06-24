# Dava Takip Sistemi

Hukuk büroları ve hukuk departmanları için geliştirilmiş kapsamlı dava takip ve yönetim sistemi.

## Özellikler

### Dava Yönetimi
- ✅ Dava kaydı ve takibi
- ✅ Dava türlerine göre sınıflandırma
- ✅ Durum takibi (beklemede, aktif, kapalı, kazanıldı, kaybedildi vb.)
- ✅ Öncelik belirleme
- ✅ Karşı taraf bilgileri
- ✅ Dava masrafları takibi

### Duruşma Yönetimi
- ✅ Duruşma takvimi
- ✅ Otomatik hatırlatmalar
- ✅ Duruşma notları ve tutanakları
- ✅ Katılımcı takibi
- ✅ Duruşma erteleme yönetimi

### Belge Yönetimi
- ✅ Belge yükleme ve saklama
- ✅ Versiyon kontrolü
- ✅ Belge kategorilendirme
- ✅ OCR ile metin çıkarma
- ✅ Güvenli belge erişimi
- ✅ Dijital imza desteği

### Müvekkil Yönetimi
- ✅ Bireysel ve kurumsal müvekkil kayıtları
- ✅ İletişim bilgileri
- ✅ Müvekkil belgeleri
- ✅ Banka hesap bilgileri
- ✅ İletişim geçmişi

### Görev ve Hatırlatmalar
- ✅ Görev oluşturma ve atama
- ✅ Süre takibi
- ✅ Öncelik belirleme
- ✅ Otomatik e-posta bildirimleri
- ✅ Uygulama içi bildirimler

### Raporlama
- ✅ Dava istatistikleri
- ✅ Performans raporları
- ✅ Maliyet analizleri
- ✅ PDF ve Excel çıktıları
- ✅ Özelleştirilebilir raporlar

### Güvenlik
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Rol bazlı yetkilendirme
- ✅ Gizli dava erişim kontrolü
- ✅ İki faktörlü doğrulama (planlanıyor)

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL (Sequelize ORM)
- Redis (önbellekleme)
- Socket.io (gerçek zamanlı bildirimler)
- Bull Queue (arka plan görevleri)
- JWT (kimlik doğrulama)
- Multer (dosya yükleme)
- Nodemailer (e-posta)
- Puppeteer (PDF oluşturma)

### Frontend
- React 18 + TypeScript
- Redux Toolkit (state yönetimi)
- Material-UI (UI komponenleri)
- React Router v6
- React Hook Form + Yup
- FullCalendar (takvim)
- React PDF (PDF görüntüleme)
- Recharts (grafikler)
- Socket.io Client

## Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (opsiyonel)

### Docker ile Kurulum (Önerilen)

1. Repoyu klonlayın:
```bash
git clone https://github.com/yourusername/dava-takip.git
cd dava-takip
```

2. Docker Compose ile servisleri başlatın:
```bash
docker-compose up -d
```

3. Tarayıcınızda http://localhost:3000 adresine gidin

### Manuel Kurulum

#### Backend

1. Veritabanı oluşturun:
```sql
CREATE DATABASE dava_takip_db;
```

2. Backend kurulumu:
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Ortam Değişkenleri

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dava_takip_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@dava-takip.gov.tr

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=/api
```

## Kullanım

### Varsayılan Admin Hesabı
- Email: admin@dava-takip.gov.tr
- Şifre: Admin123!

### Kullanıcı Rolleri
- **Admin**: Tüm yetkiler
- **Avukat**: Dava yönetimi, müvekkil yönetimi
- **Sekreter**: Belge yönetimi, takvim yönetimi
- **Katip**: Görüntüleme ve raporlama
- **Müvekkil**: Kendi davalarını görüntüleme

### API Endpoints

#### Auth
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/refresh` - Token yenileme
- `GET /api/auth/profile` - Profil bilgileri

#### Cases
- `GET /api/cases` - Dava listesi
- `GET /api/cases/:id` - Dava detayı
- `POST /api/cases` - Yeni dava
- `PUT /api/cases/:id` - Dava güncelleme
- `DELETE /api/cases/:id` - Dava silme

#### Hearings
- `GET /api/hearings` - Duruşma listesi
- `POST /api/hearings` - Yeni duruşma
- `PUT /api/hearings/:id` - Duruşma güncelleme

#### Documents
- `GET /api/documents` - Belge listesi
- `POST /api/documents` - Belge yükleme
- `GET /api/documents/:id/download` - Belge indirme

## Proje Yapısı

```
dava-takip/
├── backend/
│   ├── config/         # Konfigürasyon dosyaları
│   ├── controllers/    # Route kontrolörleri
│   ├── middleware/     # Express middleware'leri
│   ├── models/         # Sequelize modelleri
│   ├── routes/         # API rotaları
│   ├── services/       # İş mantığı servisleri
│   ├── utils/          # Yardımcı fonksiyonlar
│   ├── jobs/           # Cron görevleri
│   └── server.js       # Ana sunucu dosyası
├── frontend/
│   ├── src/
│   │   ├── components/ # React komponenleri
│   │   ├── pages/      # Sayfa komponenleri
│   │   ├── services/   # API servisleri
│   │   ├── store/      # Redux store
│   │   ├── types/      # TypeScript tipleri
│   │   └── App.tsx     # Ana uygulama
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Güvenlik Notları

- Üretim ortamında güçlü JWT secret'ları kullanın
- HTTPS kullanın
- Rate limiting aktif
- SQL injection koruması (Sequelize ORM)
- XSS koruması (React)
- CORS yapılandırması
- Dosya yükleme güvenliği

## Lisans

MIT

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'e push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın