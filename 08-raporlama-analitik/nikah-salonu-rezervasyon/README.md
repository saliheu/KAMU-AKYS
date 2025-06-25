# Nikah Salonu Rezervasyon Sistemi

Belediye nikah salonları için online rezervasyon, belge yönetimi ve tören planlama platformu.

## Özellikler

### Rezervasyon Yönetimi
- ✅ Online rezervasyon sistemi
- ✅ Gerçek zamanlı müsaitlik kontrolü
- ✅ Çoklu salon yönetimi
- ✅ Takvim görünümü
- ✅ Otomatik onay sistemi
- ✅ Rezervasyon iptali ve değişikliği

### Belge Yönetimi
- ✅ Evlenme müracaat belgesi
- ✅ Kimlik belgeleri yükleme
- ✅ Sağlık raporu takibi
- ✅ Bekar belgesi kontrolü
- ✅ Otomatik belge doğrulama
- ✅ Eksik belge bildirimi

### Salon ve Tören Yönetimi
- ✅ Salon kapasitesi kontrolü
- ✅ Tören süresi planlaması
- ✅ Nikah memuru ataması
- ✅ Müzik ve sunum sistemi
- ✅ Engelli erişimi bilgisi
- ✅ Otopark yönetimi

### Davetli Yönetimi
- ✅ Davetli listesi oluşturma
- ✅ QR kodlu davetiye
- ✅ Oturma düzeni planlama
- ✅ Misafir onay sistemi
- ✅ Kapasite kontrolü
- ✅ VIP misafir yönetimi

### Ödeme ve Finans
- ✅ Online ödeme sistemi
- ✅ Rezervasyon ücreti
- ✅ İptal iade yönetimi
- ✅ Fatura oluşturma
- ✅ Taksit seçenekleri
- ✅ Ödeme takibi

### Bildirim Sistemi
- ✅ SMS hatırlatma
- ✅ E-posta bildirimleri
- ✅ WhatsApp entegrasyonu
- ✅ Takvim entegrasyonu
- ✅ Push notification
- ✅ Otomatik hatırlatıcılar

### Raporlama ve İstatistik
- ✅ Doluluk oranları
- ✅ Aylık/yıllık istatistikler
- ✅ Gelir raporları
- ✅ İptal analizleri
- ✅ Müşteri memnuniyeti
- ✅ Performans göstergeleri

### Entegrasyonlar
- ✅ E-devlet entegrasyonu
- ✅ MERNİS doğrulama
- ✅ Evlendirme dairesi sistemi
- ✅ Google/Outlook takvim
- ✅ Sosyal medya paylaşımı
- ✅ Harita servisleri

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis (önbellekleme)
- Socket.io (gerçek zamanlı)
- Bull Queue (iş kuyruğu)
- JWT (kimlik doğrulama)
- Twilio (SMS)
- iCal (takvim)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- React Big Calendar
- Socket.io Client
- React Query
- React Hook Form
- Recharts

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/verify` - Doğrulama
- `POST /api/auth/refresh` - Token yenileme

### Rezervasyonlar
- `GET /api/reservations` - Rezervasyon listesi
- `POST /api/reservations` - Yeni rezervasyon
- `GET /api/reservations/:id` - Rezervasyon detayı
- `PUT /api/reservations/:id` - Rezervasyon güncelleme
- `DELETE /api/reservations/:id` - Rezervasyon iptali
- `POST /api/reservations/:id/confirm` - Rezervasyon onayı

### Salonlar
- `GET /api/venues` - Salon listesi
- `GET /api/venues/:id` - Salon detayı
- `GET /api/venues/:id/availability` - Müsaitlik durumu
- `PUT /api/venues/:id` - Salon güncelleme
- `GET /api/venues/:id/calendar` - Salon takvimi

### Törenler
- `GET /api/ceremonies` - Tören listesi
- `POST /api/ceremonies` - Tören oluşturma
- `GET /api/ceremonies/:id` - Tören detayı
- `PUT /api/ceremonies/:id/status` - Durum güncelleme
- `POST /api/ceremonies/:id/complete` - Tören tamamlama

### Belgeler
- `GET /api/documents` - Belge listesi
- `POST /api/documents/upload` - Belge yükleme
- `GET /api/documents/:id` - Belge detayı
- `POST /api/documents/verify` - Belge doğrulama
- `DELETE /api/documents/:id` - Belge silme

### Ödemeler
- `POST /api/payments/process` - Ödeme işleme
- `GET /api/payments/:id` - Ödeme detayı
- `POST /api/payments/refund` - İade işlemi
- `GET /api/payments/invoice/:id` - Fatura

### Müsaitlik
- `GET /api/availability/:venueId` - Salon müsaitliği
- `GET /api/availability/slots` - Zaman dilimleri
- `POST /api/availability/check` - Müsaitlik kontrolü
- `GET /api/availability/calendar` - Takvim görünümü

### Bildirimler
- `GET /api/notifications` - Bildirim listesi
- `POST /api/notifications/send` - Bildirim gönderme
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `POST /api/notifications/bulk` - Toplu bildirim

### Raporlar
- `GET /api/reports/dashboard` - Özet gösterge tablosu
- `GET /api/reports/occupancy` - Doluluk raporu
- `GET /api/reports/revenue` - Gelir raporu
- `GET /api/reports/ceremonies` - Tören istatistikleri
- `POST /api/reports/export` - Rapor dışa aktarma

### Takvim
- `GET /api/calendar/events` - Etkinlik listesi
- `POST /api/calendar/sync` - Takvim senkronizasyonu
- `GET /api/calendar/export` - iCal dışa aktarma
- `POST /api/calendar/import` - Takvim içe aktarma

### Davetliler
- `GET /api/guests/:reservationId` - Davetli listesi
- `POST /api/guests` - Davetli ekleme
- `PUT /api/guests/:id` - Davetli güncelleme
- `DELETE /api/guests/:id` - Davetli silme
- `POST /api/guests/import` - Toplu davetli ekleme

### Ayarlar
- `GET /api/settings` - Sistem ayarları
- `PUT /api/settings` - Ayar güncelleme
- `GET /api/settings/working-hours` - Çalışma saatleri
- `PUT /api/settings/working-hours` - Saat güncelleme
- `GET /api/settings/holidays` - Tatil günleri

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
- Email: admin@nikahsalonu.gov.tr
- Şifre: Admin123!

### Salon Görevlisi
- Email: gorevli@nikahsalonu.gov.tr
- Şifre: Gorevli123!

### Nikah Memuru
- Email: memur@nikahsalonu.gov.tr
- Şifre: Memur123!

### Vatandaş
- Email: vatandas@nikahsalonu.gov.tr
- Şifre: Vatandas123!

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (RBAC)
- KVKK uyumlu veri koruma
- SSL/TLS şifreleme
- Rate limiting
- CAPTCHA koruması
- İki faktörlü doğrulama
- Güvenli dosya yükleme

## Özelleştirme

- Çoklu dil desteği (TR, EN, AR)
- Tema özelleştirme
- Logo ve kurumsal kimlik
- Özel alan ekleme
- Workflow özelleştirme
- E-posta şablonları
- SMS şablonları
- Raporlama formatları

## Lisans

MIT