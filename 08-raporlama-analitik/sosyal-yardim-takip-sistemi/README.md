# Sosyal Yardım Takip Sistemi

İhtiyaç sahiplerine yönelik sosyal yardımların başvuru, değerlendirme, onay ve dağıtım süreçlerini dijitalleştiren kapsamlı platform.

## Özellikler

### Başvuru Yönetimi
- ✅ Online başvuru sistemi
- ✅ Belge yükleme ve doğrulama
- ✅ Hane halkı bilgi yönetimi
- ✅ Başvuru durumu takibi
- ✅ Otomatik değerlendirme
- ✅ Çoklu yardım programı desteği

### Gelir ve Durum Tespiti
- ✅ E-devlet entegrasyonu
- ✅ SGK gelir sorgulama
- ✅ Tapu kayıt kontrolü
- ✅ Araç kayıt sorgulama
- ✅ Banka hesap kontrolü
- ✅ Hane halkı gelir analizi

### Yardım Türleri
- ✅ Nakdi yardımlar
- ✅ Gıda yardımı
- ✅ Yakacak yardımı
- ✅ Eğitim yardımı
- ✅ Sağlık yardımı
- ✅ Barınma yardımı
- ✅ Engelli ve yaşlı yardımları

### Değerlendirme ve Onay
- ✅ Otomatik puanlama sistemi
- ✅ Öncelik sıralaması
- ✅ Saha incelemesi yönetimi
- ✅ Komite onay sistemi
- ✅ Red gerekçeleri
- ✅ İtiraz yönetimi

### Ödeme ve Dağıtım
- ✅ Banka entegrasyonu
- ✅ PTT ödeme sistemi
- ✅ Kart bazlı yardımlar
- ✅ Market alışveriş kartları
- ✅ QR kod ile teslim
- ✅ Ödeme takibi

### Saha Çalışması
- ✅ Mobil saha uygulaması
- ✅ Hane ziyaret formu
- ✅ Fotoğraflı raporlama
- ✅ GPS konum doğrulama
- ✅ Komşu görüşleri
- ✅ Offline çalışma modu

### Raporlama ve Analitik
- ✅ Yardım dağılım haritası
- ✅ İstatistiksel analizler
- ✅ Bütçe takibi
- ✅ Performans göstergeleri
- ✅ Tahmine dayalı planlama
- ✅ Şeffaflık raporları

### Kampanya Yönetimi
- ✅ Bağış kampanyaları
- ✅ Online bağış toplama
- ✅ Kurumsal destekler
- ✅ Kampanya takibi
- ✅ Bağışçı yönetimi
- ✅ Teşekkür sistemi

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis (önbellekleme)
- Socket.io (gerçek zamanlı)
- Bull Queue (iş kuyruğu)
- JWT (kimlik doğrulama)
- Crypto-js (veri şifreleme)
- PDFKit (rapor oluşturma)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Chart.js & Recharts
- React Query
- Socket.io Client
- React Hook Form
- Leaflet (haritalar)

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/verify` - Doğrulama
- `POST /api/auth/refresh` - Token yenileme

### Başvuru Sahipleri
- `GET /api/applicants` - Başvuru sahibi listesi
- `POST /api/applicants` - Yeni kayıt
- `GET /api/applicants/:id` - Detay görüntüleme
- `PUT /api/applicants/:id` - Güncelleme
- `GET /api/applicants/:id/history` - Yardım geçmişi

### Başvurular
- `GET /api/applications` - Başvuru listesi
- `POST /api/applications` - Yeni başvuru
- `GET /api/applications/:id` - Başvuru detayı
- `PUT /api/applications/:id/status` - Durum güncelleme
- `POST /api/applications/:id/documents` - Belge yükleme
- `POST /api/applications/:id/appeal` - İtiraz

### Yardımlar
- `GET /api/aids` - Yardım programları
- `POST /api/aids` - Yeni program oluşturma
- `GET /api/aids/:id` - Program detayı
- `GET /api/aids/:id/eligibility` - Uygunluk kriterleri
- `POST /api/aids/:id/apply` - Program başvurusu

### Hane Halkı
- `GET /api/households/:id` - Hane detayı
- `PUT /api/households/:id` - Hane güncelleme
- `POST /api/households/:id/members` - Üye ekleme
- `DELETE /api/households/:id/members/:memberId` - Üye çıkarma

### Ödemeler
- `GET /api/payments` - Ödeme listesi
- `POST /api/payments/process` - Ödeme işleme
- `GET /api/payments/:id` - Ödeme detayı
- `POST /api/payments/bulk` - Toplu ödeme
- `GET /api/payments/pending` - Bekleyen ödemeler

### Doğrulama
- `POST /api/verification/income` - Gelir doğrulama
- `POST /api/verification/identity` - Kimlik doğrulama
- `POST /api/verification/address` - Adres doğrulama
- `POST /api/verification/assets` - Mal varlığı kontrolü
- `GET /api/verification/:applicationId` - Doğrulama sonuçları

### Raporlar
- `GET /api/reports/dashboard` - Özet gösterge tablosu
- `GET /api/reports/distribution` - Dağıtım raporu
- `GET /api/reports/budget` - Bütçe raporu
- `GET /api/reports/performance` - Performans raporu
- `POST /api/reports/custom` - Özel rapor

### Bildirimler
- `GET /api/notifications` - Bildirim listesi
- `POST /api/notifications/send` - Bildirim gönderme
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `POST /api/notifications/bulk` - Toplu bildirim

### Denetim
- `GET /api/audit/logs` - Denetim kayıtları
- `GET /api/audit/access` - Erişim logları
- `GET /api/audit/changes` - Değişiklik geçmişi
- `POST /api/audit/report` - Denetim raporu

### İstatistikler
- `GET /api/statistics/overview` - Genel istatistikler
- `GET /api/statistics/trends` - Trend analizleri
- `GET /api/statistics/demographics` - Demografik analiz
- `GET /api/statistics/regional` - Bölgesel dağılım

### Kampanyalar
- `GET /api/campaigns` - Kampanya listesi
- `POST /api/campaigns` - Kampanya oluşturma
- `GET /api/campaigns/:id` - Kampanya detayı
- `POST /api/campaigns/:id/donate` - Bağış yapma
- `GET /api/campaigns/:id/donors` - Bağışçı listesi

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
- Email: admin@sosyalyardim.gov.tr
- Şifre: Admin123!

### Sosyal Yardım Uzmanı
- Email: uzman@sosyalyardim.gov.tr
- Şifre: Uzman123!

### Saha Görevlisi
- Email: saha@sosyalyardim.gov.tr
- Şifre: Saha123!

### Başvuru Sahibi
- Email: basvuru@sosyalyardim.gov.tr
- Şifre: Basvuru123!

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (RBAC)
- Kişisel veri şifreleme
- KVKK uyumlu veri koruma
- Denetim kaydı (audit log)
- IP kısıtlaması
- Rate limiting
- Güvenli belge saklama
- İki faktörlü doğrulama

## Entegrasyonlar

- E-devlet kapısı
- MERNİS (Nüfus ve Vatandaşlık)
- SGK (Sosyal Güvenlik Kurumu)
- İŞKUR
- Gelir İdaresi Başkanlığı
- Tapu ve Kadastro
- Bankalar (Ziraat, Vakıfbank, Halkbank)
- PTT
- Kızılay
- STK'lar

## Lisans

MIT