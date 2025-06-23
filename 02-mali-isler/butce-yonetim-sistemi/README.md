# Bütçe Yönetim Sistemi

Bu modül **mali isler** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **bütçe yönetim sistemi** projesidir.

## Proje Hakkında

Bu proje, kamu kurumlarının dijital dönüşüm sürecinde ihtiyaç duyulan bütçe yönetim sistemi çözümünü açık kaynak olarak sunmaktadır. Bütçe planlama, gider/gelir takibi, onay süreçleri ve kapsamlı raporlama özellikleri içerir.

## Özellikler

- [x] Temel sistem mimarisi
- [x] Kullanıcı yönetimi ve rol tabanlı yetkilendirme (JWT)
- [x] RESTful API geliştirme
- [x] Güvenlik katmanları (Helmet, CORS, Rate Limiting)
- [x] Bütçe oluşturma ve yönetimi (Yıllık, Çeyreklik, Aylık)
- [x] Gider ve gelir takibi
- [x] Onay iş akışları
- [x] Departman bazlı organizasyon
- [x] Gerçek zamanlı bildirimler (Socket.io)
- [ ] Gelişmiş raporlama ve analitik
- [ ] Excel/PDF dışa aktarma
- [ ] Mobil uygulama desteği
- [ ] Harici sistem entegrasyonları

## Teknoloji Yığını

- **Backend:** Node.js / Express.js
- **Frontend:** Vue.js 3 / Vuetify 3
- **Veritabanı:** MongoDB
- **Authentication:** JWT (JSON Web Token)
- **Real-time:** Socket.io
- **Container:** Docker
- **Build Tool:** Vite

## Kurulum

### Docker ile Kurulum (Önerilen)

```bash
# Repository'yi klonlayın
git clone https://github.com/yourusername/butce-yonetim-sistemi.git
cd butce-yonetim-sistemi

# Docker container'ları başlatın
docker-compose up -d
```

Uygulama http://localhost adresinde çalışacaktır.

### Manuel Kurulum

#### Backend

```bash
cd backend

# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun
cp .env.example .env

# MongoDB'nin çalıştığından emin olun
# Uygulamayı başlatın
npm run dev
```

#### Frontend

```bash
cd frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

## Kullanım

### Varsayılan Erişim Bilgileri

- Backend API: http://localhost:5000
- Frontend: http://localhost:8080
- MongoDB: mongodb://localhost:27017/budget_management

### Kullanıcı Rolleri ve Yetkileri

1. **Admin**
   - Tüm yetkiler
   - Kullanıcı yönetimi
   - Sistem ayarları

2. **Manager (Yönetici)**
   - Bütçe oluşturma ve onaylama
   - Gider/gelir onaylama
   - Raporları görüntüleme ve dışa aktarma

3. **Analyst (Analist)**
   - Bütçe oluşturma ve düzenleme
   - Gider/gelir kayıt oluşturma
   - Raporları görüntüleme

4. **Viewer (Görüntüleyici)**
   - Sadece raporları görüntüleme

### Temel Özellikler

1. **Bütçe Yönetimi**
   - Yıllık, çeyreklik ve aylık bütçe planlaması
   - Kategori bazlı bütçe kalemleri
   - Onay iş akışları
   - Bütçe kullanım takibi

2. **Gider/Gelir Takibi**
   - Detaylı gider ve gelir kayıtları
   - Fatura ve belge yükleme
   - Tekrarlayan işlemler
   - Onay süreçleri

3. **Raporlama**
   - Dashboard ile özet görünüm
   - Departman bazlı raporlar
   - Kategori bazlı analizler
   - Trend analizleri

4. **Bildirimler**
   - Gerçek zamanlı bildirimler
   - Email bildirimleri (opsiyonel)
   - Onay bekleyen işlem uyarıları

## API Dokümantasyonu

API dokümantasyonu için [/docs](./docs) klasörüne bakınız.

## Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## Lisans

Bu proje açık kaynak lisansı altında yayınlanacaktır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## İletişim

Proje hakkında sorularınız için issue açabilir veya proje ekibiyle iletişime geçebilirsiniz.
