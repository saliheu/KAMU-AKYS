# Mahkeme Randevu Sistemi

Bu modül **hukuk ve adalet** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **mahkeme randevu** projesidir. Sistem, mahkemelerde randevu alım süreçlerini dijitalleştirerek vatandaşların adalet hizmetlerine erişimini kolaylaştırır.

## 🚀 Proje Hakkında

Mahkeme Randevu Sistemi, vatandaşların mahkeme işlemleri için online randevu alabilmelerini, hakım ve avukatların takvimlerini yönetebilmelerini sağlayan kapsamlı bir platformdur. UYAP ile entegre çalışarak adalet sisteminin dijital dönüşümüne katkıda bulunur.

## ✨ Özellikler

### Temel Özellikler
- [x] UYAP entegrasyonu
- [x] E-Devlet giriş sistemi
- [x] Online randevu alma
- [x] Takvim yönetimi
- [x] Otomatik bildirimler
- [x] QR kod ile kontrol
- [x] Video konferans desteği
- [x] E-imza entegrasyonu

### Randevu Yönetimi
- Gerçek zamanlı müsaitlik sorgulama
- Çoklu randevu tipi desteği
- Otomatik randevu onayları
- Randevu değiştirme ve iptal
- Bekletme listesi yönetimi
- Acil durum randevuları
- Toplu randevu işlemleri
- Randevu geçmişi takibi

### Mahkeme Yönetimi
- Mahkeme takvimi yönetimi
- Hakim müsaitlik takibi
- Salon kapasitesi kontrolü
- Tatil günü yönetimi
- Mesai saati ayarları
- Özel gün tanımları
- Duruşma programı
- Mahkeme istatistikleri

### Kullanıcı Yönetimi
- Vatandaş kaydı ve girişi
- Avukat kimlik doğrulama
- Hakim ve personel yönetimi
- Rol tabanlı yetkilendirme
- LDAP/Active Directory entegrasyonu
- Çok faktörlü kimlik doğrulama
- Kullanıcı profil yönetimi

### Bildirim Sistemi
- SMS bildirimleri
- E-posta bildirimleri
- Push bildirimler
- Takvim entegrasyonu (iCal)
- Otomatik hatırlatmalar
- Acil durum bildirimleri
- Çok dilli bildirim desteği

### Belge Yönetimi
- Randevu dokunumu
- QR kodlu randevu fifi
- Dijital imzalı belgeler
- Dosya yükleme ve saklama
- Belge şablonları
- Otomatik belge oluşturma
- PDF raporlama

## 🛠 Teknoloji Yığını

### Backend
- **Framework:** Node.js + Express.js
- **Veritabanı:** PostgreSQL
- **Cache:** Redis
- **Queue:** Bull + Redis
- **Real-time:** Socket.io
- **Authentication:** Passport.js + JWT

### Frontend
- **Framework:** React 18 + TypeScript
- **UI Library:** Material-UI
- **State Management:** Redux Toolkit
- **Calendar:** FullCalendar
- **PDF Viewer:** React-PDF
- **Forms:** Formik + Yup

### Entegrasyonlar
- **UYAP:** SOAP/REST API
- **E-Devlet:** OAuth2 entegrasyonu
- **MERNİS:** Kimlik doğrulama
- **Baro:** Avukat lisans sorgulama
- **E-İmza:** AKSIS entegrasyonu
- **Video Konferans:** Zoom/Teams API

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
- UYAP API erişimi

### Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/kamu-kurum/mahkeme-randevu.git
cd mahkeme-randevu

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

# Veritabanı migration
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

## 📡 API Endpoints

### Kimlik Doğrulama
- `POST /api/v1/auth/login` - Kullanıcı girişi
- `POST /api/v1/auth/edevlet` - E-Devlet girişi
- `POST /api/v1/auth/refresh` - Token yenileme
- `POST /api/v1/auth/logout` - Çıkış

### Randevu İşlemleri
- `GET /api/v1/appointments/available` - Müsait randevu saatleri
- `POST /api/v1/appointments/book` - Randevu rezervasyonu
- `PUT /api/v1/appointments/:id` - Randevu güncelleme
- `DELETE /api/v1/appointments/:id` - Randevu iptali
- `GET /api/v1/appointments/my` - Kullanıcı randevuları

### Mahkeme Yönetimi
- `GET /api/v1/courts` - Mahkeme listesi
- `GET /api/v1/courts/:id/calendar` - Mahkeme takvimi
- `GET /api/v1/courts/:id/availability` - Müsaitlik durumu
- `PUT /api/v1/courts/:id/settings` - Mahkeme ayarları

### Hakim Yönetimi
- `GET /api/v1/judges` - Hakim listesi
- `GET /api/v1/judges/:id/calendar` - Hakim takvimi
- `PUT /api/v1/judges/:id/availability` - Müsaitlik güncelleme
- `GET /api/v1/judges/:id/appointments` - Hakim randevuları

### Avukat İşlemleri
- `GET /api/v1/lawyers/verify/:license` - Avukat lisans doğrulama
- `POST /api/v1/lawyers/register` - Avukat kaydı
- `GET /api/v1/lawyers/my-clients` - Müvekkil listesi
- `POST /api/v1/lawyers/client-appointment` - Müvekkil adına randevu

### Dava Yönetimi
- `GET /api/v1/cases` - Dava listesi
- `GET /api/v1/cases/:id` - Dava detayı
- `GET /api/v1/cases/:id/appointments` - Dava randevuları
- `POST /api/v1/cases/:id/hearing` - Duruşma randevusu

### Takvim Entegrasyonu
- `GET /api/v1/calendar/ical/:userId` - iCal takvim
- `POST /api/v1/calendar/sync` - Takvim senkronizasyonu
- `GET /api/v1/calendar/holidays` - Resmi tatiller
- `PUT /api/v1/calendar/working-hours` - Mesai saatleri

### Bildirimler
- `GET /api/v1/notifications` - Bildirim listesi
- `PUT /api/v1/notifications/:id/read` - Okundu işaretle
- `POST /api/v1/notifications/settings` - Bildirim ayarları
- `POST /api/v1/notifications/test` - Test bildirimi

### Belgeler
- `POST /api/v1/documents/upload` - Belge yükleme
- `GET /api/v1/documents/:id` - Belge indirme
- `POST /api/v1/documents/sign` - Belge imzalama
- `GET /api/v1/documents/appointment/:id` - Randevu belgesi

### Raporlar
- `GET /api/v1/reports/daily` - Günlük rapor
- `GET /api/v1/reports/appointments` - Randevu istatistikleri
- `GET /api/v1/reports/court-utilization` - Mahkeme kullanım oranı
- `GET /api/v1/reports/user-activity` - Kullanıcı aktivitesi

### Video Konferans
- `POST /api/v1/video-conference/create` - Toplantı oluştur
- `GET /api/v1/video-conference/:id/join` - Toplantıya katıl
- `PUT /api/v1/video-conference/:id/end` - Toplantıyı bitir
- `GET /api/v1/video-conference/:id/recording` - Kayıt link

## 🔒 Güvenlik

- End-to-end şifreleme
- Multi-factor authentication
- Role-based access control
- API rate limiting
- Audit logging
- KVKK uyumluluğu
- Pen test sertifikası

## 📱 Mobil Özellikler

- Responsive web tasarım
- PWA desteği
- Offline çalışma
- Push bildirimler
- QR kod okuyucu
- Takvim entegrasyonu

## 👥 Kullanıcı Rolleri

### Vatandaş
- Randevu alma ve iptal etme
- Randevu geçmişi görüntüleme
- Belge yükleme
- Bildirim alma

### Avukat
- Müvekkil adına randevu alma
- Toplu randevu işlemleri
- Dava takibi
- Profesyonel raporlar

### Mahkeme Personeli
- Randevu onaylama/reddetme
- Takvim yönetimi
- Kapasite planlama
- Günlük raporlar

### Hakim
- Kişisel takvim yönetimi
- Müsaitlik ayarlama
- Duruşma programı
- Video konferans yönetimi

### Sistem Yöneticisi
- Sistem konfigurasyonu
- Kullanıcı yönetimi
- Entegrasyon ayarları
- Sistem raporları

## 🔧 Varsayılan Kullanıcılar

```
Sistem Yöneticisi:
Kullanıcı Adı: admin
Şifre: Admin123!

Mahkeme Personeli:
Kullanıcı Adı: personel
Şifre: Personel123!

Hakim:
Kullanıcı Adı: hakim
Şifre: Hakim123!

Avukat:
Kullanıcı Adı: avukat
Şifre: Avukat123!
```

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmaktadır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## 📞 İletişim

Proje hakkında sorularınız için:
- Issue açabilirsiniz
- E-posta: mahkeme-randevu@adalet.gov.tr
- Dokümantasyon: [Wiki](https://github.com/kamu-kurum/mahkeme-randevu/wiki)
- UYAP Destek: uyap-destek@adalet.gov.tr
