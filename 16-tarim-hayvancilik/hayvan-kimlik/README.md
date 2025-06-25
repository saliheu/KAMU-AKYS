# Hayvan Kimlik ve İzlenebilirlik Sistemi

Türkiye'deki tüm hayvanların kimliklendirilmesi, takibi ve izlenebilirliğini sağlayan kapsamlı bir tarım ve hayvancılık platformu.

## Özellikler

### Üretici/Çiftçi Özellikleri
- **Hayvan Kaydı**: Yeni doğan hayvanların sisteme kaydı
- **Küpe Takibi**: RFID küpe numarası ile hayvan takibi
- **Soy Ağacı**: Hayvanların soy ağacı ve genetik bilgileri
- **Sağlık Takibi**: Aşı, tedavi ve veteriner kontrol kayıtları
- **Hareket Bildirimi**: Hayvan nakil ve satış bildirimleri

### Veteriner Özellikleri
- **Sağlık Kayıtları**: Muayene, aşı ve tedavi kayıtları
- **Hastalık Bildirimi**: Bulaşıcı hastalık bildirimleri
- **İlaç Reçetesi**: Elektronik reçete düzenleme
- **Suni Tohumlama**: Tohumlama kayıtları ve takibi
- **Raporlama**: Sağlık raporları düzenleme

### Mezbaha/Kesimhane Özellikleri
- **Kesim Kaydı**: Hayvan kesim kayıtları
- **Et Takibi**: Karkas numaralandırma ve takip
- **Kalite Kontrol**: Et kalite kontrol kayıtları
- **İzlenebilirlik**: Çiftlikten sofraya izlenebilirlik

### Yönetici Özellikleri
- **Harita Görünümü**: Hayvan dağılımı ve yoğunluk haritaları
- **Hastalık Takibi**: Hastalık yayılım haritaları ve analizleri
- **İstatistikler**: Detaylı hayvan istatistikleri
- **Denetim**: Çiftlik ve işletme denetimleri

## Teknolojiler

### Backend
- Node.js & Express.js
- PostgreSQL + PostGIS
- Redis önbellekleme
- JWT kimlik doğrulama
- RFID entegrasyonu
- QR kod ve barkod sistemi

### Frontend
- React.js
- Material-UI
- Redux state yönetimi
- Leaflet harita
- Chart.js
- React Query

### DevOps
- Docker & Kubernetes
- GitHub Actions CI/CD
- Prometheus & Grafana
- ELK Stack

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Üretici/Veteriner kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### Hayvan Yönetimi
- `GET /api/animals` - Hayvan listesi
- `POST /api/animals` - Yeni hayvan kaydı
- `GET /api/animals/:earTagNo` - Hayvan detayı
- `PUT /api/animals/:earTagNo` - Hayvan güncelleme
- `DELETE /api/animals/:earTagNo` - Hayvan silme

### Küpe Yönetimi
- `POST /api/ear-tags/assign` - Küpe atama
- `GET /api/ear-tags/verify/:tagNo` - Küpe doğrulama
- `POST /api/ear-tags/replace` - Küpe değiştirme
- `GET /api/ear-tags/history/:animalId` - Küpe geçmişi

### Sağlık Kayıtları
- `GET /api/health-records/:animalId` - Sağlık kayıtları
- `POST /api/health-records/vaccination` - Aşı kaydı
- `POST /api/health-records/treatment` - Tedavi kaydı
- `POST /api/health-records/examination` - Muayene kaydı

### Hareket Bildirimleri
- `POST /api/movements` - Yeni hareket bildirimi
- `GET /api/movements/:animalId` - Hayvan hareketleri
- `PUT /api/movements/:id/approve` - Hareket onayı
- `GET /api/movements/pending` - Bekleyen hareketler

### Soy Ağacı
- `GET /api/genealogy/:animalId` - Soy ağacı
- `POST /api/genealogy/breeding` - Çiftleşme kaydı
- `POST /api/genealogy/birth` - Doğum kaydı
- `GET /api/genealogy/offspring/:animalId` - Yavrular

### Kesim ve İzlenebilirlik
- `POST /api/slaughter/register` - Kesim kaydı
- `GET /api/slaughter/trace/:carcassNo` - Karkas takibi
- `POST /api/slaughter/quality-check` - Kalite kontrol
- `GET /api/trace/:qrCode` - QR kod ile izleme

### Raporlama
- `GET /api/reports/farm-summary/:farmId` - Çiftlik özeti
- `GET /api/reports/health-statistics` - Sağlık istatistikleri
- `GET /api/reports/movement-analysis` - Hareket analizleri
- `GET /api/reports/disease-map` - Hastalık haritası

### Harita Servisleri
- `GET /api/map/animal-density` - Hayvan yoğunluk haritası
- `GET /api/map/disease-spread` - Hastalık yayılım haritası
- `GET /api/map/farms` - Çiftlik konumları
- `POST /api/map/geofence` - Coğrafi alan tanımlama

## Kurulum

```bash
# Backend kurulumu
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev

# Frontend kurulumu
cd frontend
npm install
npm start
```

## Çevre Değişkenleri

```env
# Veritabanı
DATABASE_URL=postgresql://user:password@localhost:5432/hayvan_kimlik

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# RFID Okuyucu
RFID_READER_PORT=/dev/ttyUSB0
RFID_BAUD_RATE=9600

# Harita Servisi
MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Tarım Bakanlığı API
MOA_API_URL=https://api.tarim.gov.tr
MOA_API_KEY=your-api-key

# Dosya Yükleme
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## Güvenlik Özellikleri

- HTTPS zorunluluğu
- Rate limiting
- SQL injection koruması
- XSS koruması
- CORS politikaları
- Veri şifreleme
- Blockchain tabanlı izlenebilirlik
- Dijital imza doğrulama

## Test

```bash
# Unit testler
npm test

# Integration testler
npm run test:integration

# E2E testler
npm run test:e2e

# Coverage raporu
npm run test:coverage
```

## Entegrasyonlar

- Tarım ve Orman Bakanlığı sistemleri
- Et ve Süt Kurumu
- Veteriner Bilgi Sistemi (VETBİS)
- Gümrük sistemleri
- E-devlet kapısı

## Lisans

MIT