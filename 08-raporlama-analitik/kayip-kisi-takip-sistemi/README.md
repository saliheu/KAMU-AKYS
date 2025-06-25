# Kayıp Kişi Takip Sistemi

Kayıp kişilerin bulunması için kapsamlı arama, takip ve koordinasyon platformu. Yüz tanıma teknolojisi ve gerçek zamanlı bildirimlerle desteklenen modern bir çözüm.

## Özellikler

### Kayıp Kişi Yönetimi
- ✅ Detaylı kayıp kişi profili oluşturma
- ✅ Fotoğraf ve video yükleme
- ✅ Fiziksel özellikler ve ayırt edici işaretler
- ✅ Son görülme yeri ve koşulları
- ✅ Kıyafet ve eşya bilgileri
- ✅ Tıbbi durum ve ilaç bilgileri

### Yüz Tanıma ve Eşleştirme
- ✅ AI destekli yüz tanıma sistemi
- ✅ Otomatik fotoğraf eşleştirme
- ✅ Yaş progresyon simülasyonu
- ✅ Benzerlik skoru hesaplama
- ✅ Çoklu fotoğraf karşılaştırma
- ✅ Video analizi

### Arama ve Takip
- ✅ Harita tabanlı arama
- ✅ Bölgesel uyarı sistemi
- ✅ Gerçek zamanlı ihbar takibi
- ✅ Arama ekibi koordinasyonu
- ✅ GPS tabanlı konum paylaşımı
- ✅ Drone ve kamera entegrasyonu

### İhbar ve Görüntüleme
- ✅ Vatandaş ihbar sistemi
- ✅ Anonim ihbar seçeneği
- ✅ Fotoğraflı ihbar gönderimi
- ✅ Konum bazlı ihbar
- ✅ İhbar doğrulama sistemi
- ✅ Ödül sistemi entegrasyonu

### Bildirim ve Uyarılar
- ✅ SMS ve e-posta bildirimleri
- ✅ Push notification desteği
- ✅ Sosyal medya paylaşımı
- ✅ Amber Alert entegrasyonu
- ✅ Medya kuruluşlarına otomatik bildirim
- ✅ QR kod ile bilgi paylaşımı

### Raporlama ve İstatistik
- ✅ Arama süreç raporları
- ✅ Başarı oranı analizleri
- ✅ Bölgesel istatistikler
- ✅ Zaman serisi analizleri
- ✅ Isı haritaları
- ✅ Tahmine dayalı analizler

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis (önbellekleme ve gerçek zamanlı)
- Socket.io (canlı güncellemeler)
- TensorFlow.js (yüz tanıma)
- Face-api.js
- Bull Queue (iş kuyruğu)
- Twilio (SMS)
- Sharp (görüntü işleme)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- React Leaflet (haritalar)
- Socket.io Client
- Face-api.js
- React Webcam
- React Query

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/verify` - Doğrulama
- `POST /api/auth/refresh` - Token yenileme

### Kayıp Kişiler
- `GET /api/missing-persons` - Kayıp kişi listesi
- `POST /api/missing-persons` - Yeni kayıt
- `GET /api/missing-persons/:id` - Detay görüntüleme
- `PUT /api/missing-persons/:id` - Güncelleme
- `DELETE /api/missing-persons/:id` - Silme
- `POST /api/missing-persons/:id/found` - Bulundu işaretle

### Aramalar
- `GET /api/search` - Arama yap
- `POST /api/search/face` - Yüz ile arama
- `GET /api/search/nearby` - Yakındaki kayıplar
- `POST /api/search/advanced` - Gelişmiş arama
- `GET /api/search/similar` - Benzer vakalar

### İhbarlar
- `GET /api/sightings` - İhbar listesi
- `POST /api/sightings` - Yeni ihbar
- `GET /api/sightings/:id` - İhbar detayı
- `PUT /api/sightings/:id/verify` - İhbar doğrulama
- `POST /api/sightings/:id/investigate` - İncelemeye al

### Uyarılar
- `GET /api/alerts` - Aktif uyarılar
- `POST /api/alerts` - Yeni uyarı
- `PUT /api/alerts/:id` - Uyarı güncelle
- `DELETE /api/alerts/:id` - Uyarı kaldır
- `POST /api/alerts/:id/broadcast` - Toplu yayınla

### Konumlar
- `GET /api/locations` - Konum geçmişi
- `POST /api/locations/track` - Konum takibi
- `GET /api/locations/heatmap` - Isı haritası
- `POST /api/locations/geofence` - Bölge tanımla

### Eşleştirme
- `POST /api/matching/face` - Yüz eşleştirme
- `GET /api/matching/results/:id` - Eşleşme sonuçları
- `POST /api/matching/confirm` - Eşleşme onayı
- `GET /api/matching/history` - Eşleşme geçmişi

### İstatistikler
- `GET /api/statistics/overview` - Genel bakış
- `GET /api/statistics/success-rate` - Başarı oranı
- `GET /api/statistics/regional` - Bölgesel analiz
- `GET /api/statistics/trends` - Trendler
- `GET /api/statistics/predictions` - Tahminler

### Organizasyonlar
- `GET /api/organizations` - Kurum listesi
- `POST /api/organizations/collaborate` - İşbirliği talebi
- `GET /api/organizations/:id/teams` - Arama ekipleri
- `POST /api/organizations/:id/resources` - Kaynak paylaşımı

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
- Email: admin@kayipkisi.gov.tr
- Şifre: Admin123!

### Polis/Jandarma
- Email: polis@kayipkisi.gov.tr
- Şifre: Polis123!

### STK Görevlisi
- Email: stk@kayipkisi.gov.tr
- Şifre: STK123!

### Vatandaş
- Email: vatandas@kayipkisi.gov.tr
- Şifre: Vatandas123!

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (RBAC)
- Veri şifreleme
- GDPR uyumlu veri koruma
- Anonim ihbar sistemi
- IP kısıtlaması
- Rate limiting
- Güvenli dosya yükleme
- XSS ve CSRF koruması

## Entegrasyonlar

- Emniyet Genel Müdürlüğü sistemleri
- Jandarma Genel Komutanlığı
- Sağlık Bakanlığı hastane kayıtları
- Nüfus ve Vatandaşlık İşleri
- Sosyal medya platformları
- Haber ajansları
- Ulaştırma sistemleri (havalimanı, otobüs, tren)
- Güvenlik kamera ağları

## Lisans

MIT