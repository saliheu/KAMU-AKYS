# Toplu Taşıma Yönetim Sistemi

Şehir içi toplu taşıma araçlarının takibi, yönetimi ve yolcu bilgilendirme platformu. Gerçek zamanlı araç takibi, güzergah optimizasyonu ve akıllı biletleme sistemleri.

## Özellikler

### Araç Yönetimi
- ✅ Araç filosu yönetimi
- ✅ Gerçek zamanlı GPS takibi
- ✅ Araç durumu izleme
- ✅ Yakıt tüketimi takibi
- ✅ Bakım ve onarım planlaması
- ✅ Sürücü atama sistemi

### Güzergah ve Durak Yönetimi
- ✅ Dinamik güzergah planlama
- ✅ Durak bilgi sistemi
- ✅ Trafik bazlı rota optimizasyonu
- ✅ Alternatif güzergah önerileri
- ✅ Durak yoğunluk analizi
- ✅ GTFS veri desteği

### Gerçek Zamanlı Takip
- ✅ Canlı araç konumu
- ✅ Tahmini varış süreleri
- ✅ Yolcu yoğunluğu gösterimi
- ✅ Sefer durumu bildirimi
- ✅ Gecikme uyarıları
- ✅ Acil durum takibi

### Akıllı Biletleme
- ✅ QR kod ile biletleme
- ✅ NFC kart desteği
- ✅ Mobil ödeme entegrasyonu
- ✅ Transfer sistemi
- ✅ Abonman yönetimi
- ✅ İndirimli tarife hesaplama

### Yolcu Bilgilendirme
- ✅ Mobil uygulama desteği
- ✅ Durak ekranları
- ✅ SMS bilgilendirme
- ✅ Sesli anons sistemi
- ✅ Engelli yolcu desteği
- ✅ Çoklu dil desteği

### Analitik ve Raporlama
- ✅ Yolcu akış analizi
- ✅ Doluluk oranları
- ✅ Sefer performansı
- ✅ Gelir raporları
- ✅ Hat verimliliği
- ✅ Tahmine dayalı planlama

### IoT ve Sensör Entegrasyonu
- ✅ Yolcu sayma sensörleri
- ✅ Çevre sensörleri (hava kalitesi, sıcaklık)
- ✅ Motor durumu izleme
- ✅ Kamera sistemleri
- ✅ Panik butonu
- ✅ WiFi erişim noktaları

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL + PostGIS
- Redis (önbellekleme ve gerçek zamanlı)
- Socket.io (canlı takip)
- MQTT (IoT sensörler)
- Bull Queue (iş kuyruğu)
- GTFS-realtime
- JWT (kimlik doğrulama)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Mapbox GL JS
- Deck.gl (veri görselleştirme)
- Socket.io Client
- React Query
- Chart.js & Recharts

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### Araçlar
- `GET /api/vehicles` - Araç listesi
- `POST /api/vehicles` - Araç ekleme
- `GET /api/vehicles/:id` - Araç detayı
- `PUT /api/vehicles/:id` - Araç güncelleme
- `GET /api/vehicles/:id/location` - Anlık konum
- `GET /api/vehicles/:id/history` - Konum geçmişi

### Güzergahlar
- `GET /api/routes` - Hat listesi
- `POST /api/routes` - Hat oluşturma
- `GET /api/routes/:id` - Hat detayı
- `PUT /api/routes/:id` - Hat güncelleme
- `GET /api/routes/:id/vehicles` - Hattaki araçlar
- `POST /api/routes/:id/optimize` - Rota optimizasyonu

### Duraklar
- `GET /api/stops` - Durak listesi
- `POST /api/stops` - Durak ekleme
- `GET /api/stops/:id` - Durak detayı
- `GET /api/stops/:id/arrivals` - Varış tahminleri
- `GET /api/stops/nearby` - Yakın duraklar

### Seferler
- `GET /api/schedules` - Sefer tarifesi
- `POST /api/schedules` - Sefer oluşturma
- `GET /api/schedules/:id` - Sefer detayı
- `PUT /api/schedules/:id/status` - Durum güncelleme
- `GET /api/schedules/active` - Aktif seferler

### Biletler
- `POST /api/tickets/purchase` - Bilet satın alma
- `POST /api/tickets/validate` - Bilet doğrulama
- `GET /api/tickets/:id` - Bilet detayı
- `POST /api/tickets/transfer` - Transfer işlemi
- `GET /api/tickets/history` - Bilet geçmişi

### Yolcular
- `GET /api/passengers/profile` - Yolcu profili
- `PUT /api/passengers/profile` - Profil güncelleme
- `GET /api/passengers/cards` - Kartlarım
- `POST /api/passengers/cards` - Kart ekleme
- `GET /api/passengers/trips` - Yolculuk geçmişi

### Sürücüler
- `GET /api/drivers` - Sürücü listesi
- `POST /api/drivers` - Sürücü ekleme
- `GET /api/drivers/:id` - Sürücü detayı
- `PUT /api/drivers/:id/assign` - Araç atama
- `GET /api/drivers/:id/performance` - Performans raporu

### Takip
- `GET /api/tracking/live` - Canlı takip
- `POST /api/tracking/update` - Konum güncelleme
- `GET /api/tracking/replay` - Geçmiş oynatma
- `GET /api/tracking/analytics` - Takip analitiği

### Raporlar
- `GET /api/reports/daily` - Günlük rapor
- `GET /api/reports/revenue` - Gelir raporu
- `GET /api/reports/passenger-flow` - Yolcu akışı
- `GET /api/reports/performance` - Performans raporu
- `POST /api/reports/export` - Rapor dışa aktarma

### Bakım
- `GET /api/maintenance/schedule` - Bakım takvimi
- `POST /api/maintenance/request` - Bakım talebi
- `GET /api/maintenance/:id` - Bakım detayı
- `PUT /api/maintenance/:id/complete` - Bakım tamamlama

### Acil Durumlar
- `POST /api/emergency/alert` - Acil durum bildirimi
- `GET /api/emergency/active` - Aktif acil durumlar
- `PUT /api/emergency/:id/resolve` - Acil durum çözümü
- `GET /api/emergency/contacts` - Acil durum kontakları

### Ödemeler
- `POST /api/payments/process` - Ödeme işleme
- `GET /api/payments/methods` - Ödeme yöntemleri
- `POST /api/payments/topup` - Bakiye yükleme
- `GET /api/payments/balance` - Bakiye sorgulama

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
- Email: admin@toplutasima.gov.tr
- Şifre: Admin123!

### Operasyon Müdürü
- Email: operasyon@toplutasima.gov.tr
- Şifre: Operasyon123!

### Sürücü
- Email: surucu@toplutasima.gov.tr
- Şifre: Surucu123!

### Yolcu
- Email: yolcu@toplutasima.gov.tr
- Şifre: Yolcu123!

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (RBAC)
- API rate limiting
- Veri şifreleme
- Güvenli ödeme işlemleri
- GDPR uyumlu veri koruma
- Penetrasyon test uyumluluğu
- SSL/TLS şifreleme

## Entegrasyonlar

- Google Maps / Mapbox
- Trafik yoğunluk servisleri
- Ödeme sistemleri (banka, kredi kartı)
- SMS gateway servisleri
- GTFS veri kaynakları
- Belediye sistemleri
- Acil durum servisleri (112, polis, itfaiye)
- Hava durumu servisleri
- Sosyal medya platformları

## Lisans

MIT