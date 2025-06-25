# Çiftçi Kayıt Sistemi

Tarım ve hayvancılık faaliyetlerinin dijital ortamda kayıt altına alınması, takibi ve destekleme ödemelerinin yönetimi için kapsamlı platform.

## Özellikler

### Çiftçi Kayıt ve Profil Yönetimi
- ✅ Detaylı çiftçi profili oluşturma
- ✅ TC kimlik doğrulama
- ✅ Arazi ve işletme bilgileri
- ✅ Aile işletmesi yönetimi
- ✅ Belgeler ve sertifikalar
- ✅ QR kodlu çiftçi kartı

### Arazi ve Parsel Yönetimi
- ✅ Harita üzerinde parsel çizimi
- ✅ Tapu ve kadastro entegrasyonu
- ✅ Arazi kullanım planlaması
- ✅ Toprak analizi kayıtları
- ✅ Sulama sistemi takibi
- ✅ Uydu görüntüleri ile izleme

### Tarımsal Üretim Takibi
- ✅ Ekim planlaması ve takvimi
- ✅ Ürün çeşitleri ve verimleri
- ✅ Gübre ve ilaç kullanımı
- ✅ Hasat takibi ve raporlama
- ✅ Maliyet hesaplamaları
- ✅ Verim tahminleri

### Hayvancılık Yönetimi
- ✅ Hayvan envanteri
- ✅ Küpe numarası takibi
- ✅ Sağlık ve aşı kayıtları
- ✅ Yem takibi
- ✅ Süt/et üretim kayıtları
- ✅ Soy kütüğü yönetimi

### Destekleme ve Teşvik Sistemi
- ✅ Otomatik hak ediş hesaplama
- ✅ Başvuru yönetimi
- ✅ Belge yükleme ve doğrulama
- ✅ Ödeme takibi
- ✅ Mazot ve gübre desteği
- ✅ Prim ödemeleri

### Pazar ve Fiyat Bilgisi
- ✅ Güncel hal fiyatları
- ✅ Borsa verileri
- ✅ Talep-arz eşleştirme
- ✅ Sözleşmeli üretim
- ✅ İhracat fırsatları
- ✅ Fiyat tahminleri

### Hava Durumu ve İklim
- ✅ Lokasyon bazlı hava durumu
- ✅ Tarımsal meteoroloji
- ✅ Don ve dolu uyarıları
- ✅ Sulama önerileri
- ✅ İklim değişikliği analizleri
- ✅ Erken uyarı sistemi

### Eğitim ve Danışmanlık
- ✅ Online eğitim modülleri
- ✅ Canlı seminerler
- ✅ Uzman danışmanlık
- ✅ İyi tarım uygulamaları
- ✅ Sertifika programları
- ✅ Bilgi bankası

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL + PostGIS
- Redis (önbellekleme)
- Socket.io (gerçek zamanlı)
- Bull Queue (iş kuyruğu)
- Sharp (görüntü işleme)
- Turf.js (coğrafi hesaplamalar)
- JWT (kimlik doğrulama)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Leaflet (haritalar)
- Chart.js & Recharts
- React Query
- Socket.io Client
- React Hook Form

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/verify-tc` - TC doğrulama
- `POST /api/auth/refresh` - Token yenileme

### Çiftçiler
- `GET /api/farmers` - Çiftçi listesi
- `POST /api/farmers` - Yeni çiftçi kaydı
- `GET /api/farmers/:id` - Çiftçi detayı
- `PUT /api/farmers/:id` - Çiftçi güncelleme
- `GET /api/farmers/:id/card` - Çiftçi kartı

### Araziler
- `GET /api/lands` - Arazi listesi
- `POST /api/lands` - Arazi ekleme
- `GET /api/lands/:id` - Arazi detayı
- `PUT /api/lands/:id` - Arazi güncelleme
- `POST /api/lands/:id/parcels` - Parsel ekleme
- `GET /api/lands/:id/satellite` - Uydu görüntüsü

### Ürünler
- `GET /api/crops` - Ürün listesi
- `POST /api/crops` - Ekim kaydı
- `GET /api/crops/:id` - Ürün detayı
- `POST /api/crops/:id/harvest` - Hasat kaydı
- `GET /api/crops/calendar` - Ekim takvimi

### Hayvancılık
- `GET /api/livestock` - Hayvan listesi
- `POST /api/livestock` - Hayvan kaydı
- `GET /api/livestock/:id` - Hayvan detayı
- `POST /api/livestock/:id/health` - Sağlık kaydı
- `GET /api/livestock/genealogy` - Soy kütüğü

### Destekler
- `GET /api/subsidies` - Destek listesi
- `POST /api/subsidies/apply` - Başvuru
- `GET /api/subsidies/:id` - Başvuru detayı
- `POST /api/subsidies/:id/documents` - Belge yükleme
- `GET /api/subsidies/eligibility` - Hak ediş sorgulama

### Pazar
- `GET /api/market/prices` - Güncel fiyatlar
- `GET /api/market/demands` - Talep listesi
- `POST /api/market/offers` - Teklif verme
- `GET /api/market/contracts` - Sözleşmeler
- `GET /api/market/forecast` - Fiyat tahmini

### Hava Durumu
- `GET /api/weather/current` - Anlık hava durumu
- `GET /api/weather/forecast` - Tahmin
- `GET /api/weather/alerts` - Uyarılar
- `GET /api/weather/agricultural` - Tarımsal meteoroloji

### Analizler
- `GET /api/analysis/yield` - Verim analizi
- `GET /api/analysis/soil` - Toprak analizi
- `GET /api/analysis/profitability` - Karlılık analizi
- `POST /api/analysis/recommendation` - Ürün önerisi

### Belgeler
- `GET /api/documents` - Belge listesi
- `POST /api/documents/upload` - Belge yükleme
- `GET /api/documents/:id` - Belge indirme
- `POST /api/documents/verify` - Belge doğrulama

### Kooperatifler
- `GET /api/cooperatives` - Kooperatif listesi
- `POST /api/cooperatives/join` - Üyelik başvurusu
- `GET /api/cooperatives/:id/members` - Üye listesi
- `POST /api/cooperatives/:id/activities` - Faaliyet ekleme

### Eğitimler
- `GET /api/training/courses` - Eğitim listesi
- `POST /api/training/enroll` - Kayıt
- `GET /api/training/:id/materials` - Eğitim materyalleri
- `POST /api/training/:id/certificate` - Sertifika talebi

## Kurulum

### Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run migrate
npm run seed
npm start
```

### Frontend Kurulumu
```bash
cd frontend
npm install
npm start
```

## Varsayılan Kullanıcılar

### Sistem Yöneticisi
- Email: admin@ciftci.gov.tr
- Şifre: Admin123!

### İl/İlçe Müdürlüğü
- Email: mudurluk@ciftci.gov.tr
- Şifre: Mudurluk123!

### Çiftçi
- Email: ciftci@ciftci.gov.tr
- Şifre: Ciftci123!

### Danışman
- Email: danisman@ciftci.gov.tr
- Şifre: Danisman123!

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- TC kimlik doğrulama servisi
- Rol bazlı yetkilendirme (RBAC)
- Veri şifreleme
- Rate limiting
- IP beyaz listesi
- Güvenli belge yükleme
- Blockchain tabanlı belge doğrulama

## Entegrasyonlar

- Tarım ve Orman Bakanlığı sistemleri
- TKDK (Tarım ve Kırsal Kalkınmayı Destekleme Kurumu)
- Tapu ve Kadastro Genel Müdürlüğü
- Meteoroloji Genel Müdürlüğü
- Ziraat Bankası ödeme sistemleri
- Hal ve borsa sistemleri
- E-devlet entegrasyonu
- Uydu görüntü servisleri

## Lisans

MIT