# Sanal Müze Platformu

Müze ve kültürel mirasın dijital ortamda sergilenmesi, 3D modelleme, sanal turlar ve artırılmış gerçeklik deneyimleri sunan interaktif platform.

## Özellikler

### 3D Sergi Yönetimi
- ✅ 3D model yükleme ve işleme
- ✅ Çoklu format desteği (GLB, GLTF, OBJ, FBX)
- ✅ Otomatik model optimizasyonu
- ✅ Texture ve material düzenleme
- ✅ LOD (Level of Detail) oluşturma
- ✅ 360° görüntüleme

### Sanal Tur Deneyimi
- ✅ İnteraktif sanal turlar
- ✅ Panoramik görüntüler
- ✅ Hotspot ve bilgi noktaları
- ✅ Rehberli tur modu
- ✅ Çoklu dil desteği
- ✅ Sesli anlatım sistemi

### AR/VR Desteği
- ✅ Artırılmış gerçeklik görüntüleme
- ✅ Marker tabanlı AR
- ✅ WebXR desteği
- ✅ VR gözlük uyumluluğu
- ✅ El hareketi takibi
- ✅ Sanal müze gezintisi

### Koleksiyon Yönetimi
- ✅ Kategorik sergi düzenleme
- ✅ Eser detay sayfaları
- ✅ Yüksek çözünürlüklü görüntüler
- ✅ Metadata yönetimi
- ✅ Koruma durumu takibi
- ✅ QR kod entegrasyonu

### Eğitim ve Etkinlikler
- ✅ İnteraktif eğitim modülleri
- ✅ Quiz ve yarışmalar
- ✅ Sanal atölyeler
- ✅ Canlı etkinlik yayınları
- ✅ Sertifika sistemi
- ✅ Gamification özellikleri

### Sosyal Özellikler
- ✅ Yorum ve değerlendirme
- ✅ Favori eser listeleri
- ✅ Sosyal medya paylaşımı
- ✅ Sanal rehber sistemi
- ✅ Grup turları
- ✅ Müze dostları ağı

### Multimedya İçerik
- ✅ Video ve ses dosyaları
- ✅ Belgesel entegrasyonu
- ✅ Tarihi canlandırmalar
- ✅ İnteraktif zaman çizelgesi
- ✅ Karşılaştırmalı görüntüleme
- ✅ Restorasyon süreç görüntüleri

### Analitik ve Raporlama
- ✅ Ziyaretçi istatistikleri
- ✅ Eser popülerlik analizi
- ✅ Isı haritaları
- ✅ Kullanıcı davranış analizi
- ✅ Dönüşüm oranları
- ✅ A/B test desteği

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis (önbellekleme)
- Socket.io (gerçek zamanlı)
- Three.js (3D işleme)
- Sharp (görüntü işleme)
- FFmpeg (video işleme)
- Bull Queue (iş kuyruğu)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Three.js / React Three Fiber
- A-Frame (WebXR)
- Model-viewer (3D görüntüleme)
- TensorFlow.js (AI özellikleri)
- Socket.io Client

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/guest` - Misafir girişi
- `POST /api/auth/refresh` - Token yenileme

### Sergiler
- `GET /api/exhibits` - Sergi listesi
- `POST /api/exhibits` - Yeni sergi oluşturma
- `GET /api/exhibits/:id` - Sergi detayı
- `PUT /api/exhibits/:id` - Sergi güncelleme
- `GET /api/exhibits/:id/3d` - 3D model
- `GET /api/exhibits/featured` - Öne çıkan eserler

### Koleksiyonlar
- `GET /api/collections` - Koleksiyon listesi
- `POST /api/collections` - Koleksiyon oluşturma
- `GET /api/collections/:id` - Koleksiyon detayı
- `GET /api/collections/:id/exhibits` - Koleksiyon eserleri

### Galeriler
- `GET /api/galleries` - Galeri listesi
- `GET /api/galleries/:id` - Galeri detayı
- `GET /api/galleries/:id/layout` - Galeri düzeni
- `POST /api/galleries/:id/visit` - Sanal ziyaret

### Turlar
- `GET /api/tours` - Tur listesi
- `POST /api/tours/create` - Tur oluşturma
- `GET /api/tours/:id` - Tur detayı
- `POST /api/tours/:id/join` - Tura katılma
- `GET /api/tours/:id/progress` - Tur ilerlemesi

### 3D Modeller
- `POST /api/models/upload` - Model yükleme
- `GET /api/models/:id` - Model detayı
- `POST /api/models/:id/process` - Model işleme
- `GET /api/models/:id/download` - Model indirme

### Medya
- `POST /api/media/upload` - Medya yükleme
- `GET /api/media/:id` - Medya detayı
- `GET /api/media/:id/stream` - Video akışı
- `POST /api/media/:id/transcode` - Format dönüştürme

### Ziyaretçiler
- `GET /api/visitors/profile` - Profil bilgisi
- `PUT /api/visitors/profile` - Profil güncelleme
- `GET /api/visitors/history` - Ziyaret geçmişi
- `GET /api/visitors/favorites` - Favori eserler
- `POST /api/visitors/preferences` - Tercih kaydetme

### Etkinlikler
- `GET /api/events` - Etkinlik listesi
- `POST /api/events/register` - Etkinlik kaydı
- `GET /api/events/:id` - Etkinlik detayı
- `GET /api/events/live` - Canlı etkinlikler
- `POST /api/events/:id/join` - Etkinliğe katılma

### Eğitim
- `GET /api/education/courses` - Kurs listesi
- `POST /api/education/enroll` - Kursa kayıt
- `GET /api/education/quizzes` - Quiz listesi
- `POST /api/education/quiz/:id/submit` - Quiz gönderimi
- `GET /api/education/certificates` - Sertifikalar

### Analitik
- `GET /api/analytics/dashboard` - Gösterge tablosu
- `GET /api/analytics/exhibits` - Eser analitiği
- `GET /api/analytics/visitors` - Ziyaretçi analitiği
- `GET /api/analytics/heatmaps` - Isı haritaları
- `POST /api/analytics/export` - Rapor dışa aktarma

### AR/VR
- `GET /api/arvr/markers` - AR marker listesi
- `GET /api/arvr/content/:markerId` - AR içeriği
- `POST /api/arvr/session/start` - VR oturum başlatma
- `GET /api/arvr/spaces` - VR alanları
- `POST /api/arvr/interaction` - Etkileşim kaydı

### Sosyal
- `GET /api/social/comments/:exhibitId` - Yorumlar
- `POST /api/social/comments` - Yorum ekleme
- `POST /api/social/ratings` - Değerlendirme
- `POST /api/social/share` - Paylaşım
- `GET /api/social/trending` - Trend olan eserler

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
- Email: admin@sanalmuze.gov.tr
- Şifre: Admin123!

### Müze Müdürü
- Email: mudur@sanalmuze.gov.tr
- Şifre: Mudur123!

### Küratör
- Email: kurator@sanalmuze.gov.tr
- Şifre: Kurator123!

### Ziyaretçi
- Email: ziyaretci@sanalmuze.gov.tr
- Şifre: Ziyaretci123!

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (RBAC)
- DDoS koruması
- İçerik güvenliği politikaları
- Telif hakkı koruması
- Dijital filigran
- SSL/TLS şifreleme
- CORS politikaları

## Desteklenen Formatlar

### 3D Modeller
- GLB, GLTF, OBJ, FBX, DAE, STL, PLY

### Görüntüler
- JPG, PNG, WebP, TIFF, HDR

### Videolar
- MP4, WebM, MOV, AVI

### Ses
- MP3, WAV, OGG, AAC

## Lisans

MIT