# Personel Bilgi Yönetim Sistemi

Bu modül **insan kaynakları** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **personel bilgi yönetim sistemi** projesidir.

## Proje Hakkında

Bu proje, kamu kurumlarının dijital dönüşüm sürecinde ihtiyaç duyulan personel bilgi yönetim sistemi çözümünü açık kaynak olarak sunmaktadır.

## Özellikler

- ✅ Personel bilgi yönetimi
- ✅ Kullanıcı yönetimi ve rol bazlı yetkilendirme
- ✅ Departman ve pozisyon yönetimi
- ✅ İzin takip sistemi
- ✅ Belge yönetimi
- ✅ Eğitim ve deneyim bilgileri
- ✅ Acil durum iletişim bilgileri
- ✅ RESTful API
- ✅ Modern ve responsive arayüz
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Docker desteği

## Teknoloji Yığını

- **Backend:** Node.js, Express.js
- **Frontend:** React, TypeScript, Tailwind CSS
- **Veritabanı:** PostgreSQL
- **Cache:** Redis
- **ORM:** Sequelize
- **Kimlik Doğrulama:** JWT
- **Container:** Docker
- **API Dokümantasyonu:** Swagger (eklenecek)

## Kurulum

### Ön Gereksinimler
- Docker ve Docker Compose
- Node.js 18+ (lokal geliştirme için)
- PostgreSQL (lokal geliştirme için)

### Docker ile Kurulum

```bash
# Repository'yi klonlayın
git clone <repository-url>
cd personel-bilgi-yonetim-sistemi

# Environment dosyasını oluşturun
cp backend/.env.example backend/.env

# Docker container'ları başlatın
docker-compose up -d

# Uygulama http://localhost:3000 adresinde çalışacaktır
```

### Lokal Kurulum

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm start
```

## Varsayılan Kullanıcılar

Sistem ilk kurulumda aşağıdaki kullanıcıları oluşturur:

- **Admin:** admin@example.com / Admin123!
- **HR Manager:** hr@example.com / Hr123!
- **Employee:** employee@example.com / Employee123!

## API Endpoints

Başlıca API endpoint'leri:

- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri
- `GET /api/personnel` - Personel listesi
- `POST /api/personnel` - Yeni personel oluştur
- `GET /api/personnel/:id` - Personel detayı
- `PUT /api/personnel/:id` - Personel güncelle
- `GET /api/departments` - Departman listesi
- `GET /api/positions` - Pozisyon listesi

## Proje Yapısı

```
personel-bilgi-yonetim-sistemi/
├── backend/
│   ├── config/         # Yapılandırma dosyaları
│   ├── middleware/     # Express middleware'leri
│   ├── models/         # Sequelize modelleri
│   ├── routes/         # API route'ları
│   ├── utils/          # Yardımcı fonksiyonlar
│   └── server.js       # Ana sunucu dosyası
├── frontend/
│   ├── public/         # Statik dosyalar
│   ├── src/
│   │   ├── components/ # React bileşenleri
│   │   ├── contexts/   # Context API
│   │   ├── pages/      # Sayfa bileşenleri
│   │   ├── routes/     # React Router yapılandırması
│   │   └── services/   # API servisleri
│   └── package.json
└── docker-compose.yml

## Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## Lisans

Bu proje açık kaynak lisansı altında yayınlanacaktır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## İletişim

Proje hakkında sorularınız için issue açabilir veya proje ekibiyle iletişime geçebilirsiniz.
