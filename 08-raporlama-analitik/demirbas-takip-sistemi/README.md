# Demirbaş Takip Sistemi

Kamu kurumları için demirbaş envanter yönetimi, takibi, bakım-onarım ve raporlama platformu.

## Özellikler

### Demirbaş Yönetimi
- ✅ Detaylı demirbaş kayıtları
- ✅ Kategorik sınıflandırma
- ✅ Seri no ve model bilgileri
- ✅ Satın alma ve garanti takibi
- ✅ Teknik özellik yönetimi
- ✅ Fotoğraf ve belge ekleme

### Barkod/QR Kod Sistemi
- ✅ Otomatik barkod oluşturma
- ✅ QR kod desteği
- ✅ Etiket yazdırma
- ✅ Mobil barkod okuma
- ✅ Toplu etiketleme
- ✅ RFID entegrasyonu (opsiyonel)

### Konum ve Takip
- ✅ Bina/kat/oda bazlı konum
- ✅ Zimmet takibi
- ✅ Transfer işlemleri
- ✅ Hareket geçmişi
- ✅ GPS takibi (mobil demirbaşlar)
- ✅ Geofence uyarıları

### Bakım ve Onarım
- ✅ Periyodik bakım planlaması
- ✅ Arıza bildirimi
- ✅ Onarım takibi
- ✅ Yedek parça yönetimi
- ✅ Servis sözleşmeleri
- ✅ Maliyet takibi

### Amortisman Hesaplama
- ✅ Otomatik amortisman
- ✅ Farklı yöntem desteği
- ✅ Kıdem tazminatı hesabı
- ✅ Değer takibi
- ✅ Yeniden değerleme
- ✅ Muhasebe entegrasyonu

### Envanter Sayımı
- ✅ Periyodik sayım planları
- ✅ Mobil sayım uygulaması
- ✅ Barkod ile hızlı sayım
- ✅ Fazla/eksik raporları
- ✅ Lokasyon bazlı sayım
- ✅ Kısmi sayım desteği

### Raporlama ve Analitik
- ✅ Envanter raporları
- ✅ Maliyet analizleri
- ✅ Kullanım istatistikleri
- ✅ Amortisman raporları
- ✅ Bakım maliyetleri
- ✅ Özelleştirilebilir raporlar

### Entegrasyonlar
- ✅ Muhasebe sistemleri
- ✅ Satın alma yönetimi
- ✅ İnsan kaynakları
- ✅ Bütçe yönetimi
- ✅ E-devlet sistemleri
- ✅ Taşınır Mal Yönetmeliği uyumu

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis (önbellekleme)
- Socket.io (gerçek zamanlı)
- Bull Queue (iş kuyruğu)
- Sharp (görüntü işleme)
- Bwip-js (barkod oluşturma)
- PDFKit (rapor oluşturma)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- React QR Scanner
- React Barcode
- Leaflet (harita)
- Chart.js & Recharts
- Socket.io Client

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### Demirbaşlar
- `GET /api/assets` - Demirbaş listesi
- `POST /api/assets` - Yeni demirbaş
- `GET /api/assets/:id` - Demirbaş detayı
- `PUT /api/assets/:id` - Güncelleme
- `DELETE /api/assets/:id` - Silme
- `GET /api/assets/:id/history` - Hareket geçmişi
- `POST /api/assets/import` - Toplu içe aktarma

### Kategoriler
- `GET /api/categories` - Kategori listesi
- `POST /api/categories` - Kategori oluşturma
- `PUT /api/categories/:id` - Kategori güncelleme
- `DELETE /api/categories/:id` - Kategori silme
- `GET /api/categories/:id/assets` - Kategori demirbaşları

### Lokasyonlar
- `GET /api/locations` - Lokasyon listesi
- `POST /api/locations` - Lokasyon oluşturma
- `GET /api/locations/:id` - Lokasyon detayı
- `PUT /api/locations/:id` - Lokasyon güncelleme
- `GET /api/locations/:id/assets` - Lokasyon demirbaşları
- `GET /api/locations/tree` - Lokasyon ağacı

### Zimmet İşlemleri
- `GET /api/assignments` - Zimmet listesi
- `POST /api/assignments` - Zimmet oluşturma
- `PUT /api/assignments/:id/return` - Zimmet iadesi
- `GET /api/assignments/user/:userId` - Kullanıcı zimmetleri
- `POST /api/assignments/transfer` - Zimmet transferi

### Bakım İşlemleri
- `GET /api/maintenance` - Bakım listesi
- `POST /api/maintenance` - Bakım kaydı
- `GET /api/maintenance/:id` - Bakım detayı
- `PUT /api/maintenance/:id` - Bakım güncelleme
- `GET /api/maintenance/schedule` - Bakım takvimi
- `POST /api/maintenance/preventive` - Önleyici bakım

### Envanter
- `GET /api/inventory` - Envanter özeti
- `POST /api/inventory/count` - Sayım başlatma
- `GET /api/inventory/count/:id` - Sayım detayı
- `POST /api/inventory/count/:id/items` - Sayım girişi
- `POST /api/inventory/reconcile` - Mutabakat

### Raporlar
- `GET /api/reports/summary` - Özet rapor
- `GET /api/reports/assets` - Demirbaş raporu
- `GET /api/reports/depreciation` - Amortisman raporu
- `GET /api/reports/maintenance` - Bakım raporu
- `GET /api/reports/location` - Lokasyon raporu
- `POST /api/reports/custom` - Özel rapor

### Barkod/QR
- `POST /api/barcodes/generate` - Barkod oluştur
- `GET /api/barcodes/:code` - Barkod sorgula
- `POST /api/barcodes/print` - Etiket yazdır
- `POST /api/barcodes/bulk` - Toplu barkod
- `POST /api/barcodes/scan` - Barkod okuma

### Amortisman
- `GET /api/depreciation/:assetId` - Amortisman detayı
- `POST /api/depreciation/calculate` - Hesaplama
- `GET /api/depreciation/methods` - Yöntemler
- `PUT /api/depreciation/:id` - Güncelleme
- `GET /api/depreciation/report` - Amortisman raporu

### İmha İşlemleri
- `GET /api/disposal` - İmha listesi
- `POST /api/disposal` - İmha talebi
- `GET /api/disposal/:id` - İmha detayı
- `PUT /api/disposal/:id/approve` - İmha onayı
- `POST /api/disposal/:id/complete` - İmha tamamlama

### Denetim
- `GET /api/audit` - Denetim kayıtları
- `GET /api/audit/asset/:assetId` - Demirbaş denetimi
- `GET /api/audit/user/:userId` - Kullanıcı işlemleri
- `POST /api/audit/export` - Denetim raporu

### Bildirimler
- `GET /api/notifications` - Bildirim listesi
- `POST /api/notifications/settings` - Bildirim ayarları
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `POST /api/notifications/subscribe` - Bildirim aboneliği

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
- Email: admin@demirbas.gov.tr
- Şifre: Admin123!

### Taşınır Kayıt Kontrol Yetkilisi
- Email: tkky@demirbas.gov.tr
- Şifre: TKKY123!

### Departman Yöneticisi
- Email: yonetici@demirbas.gov.tr
- Şifre: Yonetici123!

### Kullanıcı
- Email: kullanici@demirbas.gov.tr
- Şifre: Kullanici123!

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (RBAC)
- Denetim kaydı (audit trail)
- Veri şifreleme
- IP kısıtlaması
- Rate limiting
- Güvenli dosya yükleme
- İki faktörlü doğrulama

## Yasal Uyumluluk

- Taşınır Mal Yönetmeliği
- Kamu Mali Yönetimi ve Kontrol Kanunu
- Devlet Muhasebesi Standartları
- Sayıştay denetim kriterleri
- KVKK uyumluluğu
- E-devlet standartları

## Özelleştirme

- Kuruma özel kategoriler
- Özel alan tanımlama
- Rapor şablonları
- Onay akışları
- Etiket tasarımları
- Bildirim kuralları
- Amortisman yöntemleri
- Entegrasyon ayarları

## Lisans

MIT