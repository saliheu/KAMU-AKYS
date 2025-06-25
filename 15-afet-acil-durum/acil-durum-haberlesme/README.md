# Acil Durum Haberleşme Sistemi

Afet ve acil durumlarda koordinasyon, haberleşme ve kaynak yönetimi için geliştirilmiş kapsamlı iletişim platformu.

## Özellikler

### Acil Durum Yönetimi
- ✅ Acil durum bildirimi ve alarm sistemi
- ✅ Çok kanallı haberleşme (SMS, E-posta, Push, Ses)
- ✅ Gerçek zamanlı mesajlaşma ve koordinasyon
- ✅ Öncelik bazlı mesaj yönetimi
- ✅ Otomatik eskalasyon sistemi

### Ekip ve Kaynak Yönetimi
- ✅ Ekip oluşturma ve yönetimi
- ✅ Gerçek zamanlı konum takibi
- ✅ Kaynak envanteri ve tahsisi
- ✅ Görev atama ve takibi
- ✅ Vardiya yönetimi

### İletişim Özellikleri
- ✅ Toplu mesaj gönderimi
- ✅ Sesli arama entegrasyonu
- ✅ Video konferans desteği
- ✅ Telsiz entegrasyonu
- ✅ Offline mesajlaşma

### Coğrafi Özellikler
- ✅ Harita üzerinde olay takibi
- ✅ Tehlike bölgesi belirleme
- ✅ Güvenli alan yönetimi
- ✅ Rota optimizasyonu
- ✅ Coğrafi bildirimler

### Raporlama ve Analiz
- ✅ Gerçek zamanlı dashboard
- ✅ Olay raporları
- ✅ Performans metrikleri
- ✅ Kaynak kullanım analizi
- ✅ After-action raporları

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL (ana veritabanı)
- Redis (önbellekleme ve konum)
- Socket.io (gerçek zamanlı)
- RabbitMQ (mesaj kuyruğu)
- Twilio (SMS/Ses)
- Web Push (bildirimler)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Leaflet (haritalar)
- Socket.io Client
- PWA desteği

## Kurulum

### Backend
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanını oluşturun
createdb emergency_communication_db

# Sunucuyu başlatın
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Acil Durumlar
- `GET /api/alerts` - Aktif acil durumlar
- `POST /api/alerts` - Yeni acil durum
- `PUT /api/alerts/:id` - Acil durum güncelleme
- `POST /api/alerts/:id/escalate` - Eskalasyon
- `POST /api/alerts/:id/close` - Acil durum kapatma

### İletişim
- `POST /api/communications/broadcast` - Toplu mesaj
- `POST /api/communications/sms` - SMS gönderimi
- `POST /api/communications/voice` - Sesli arama
- `GET /api/communications/history` - İletişim geçmişi

### Ekipler
- `GET /api/teams` - Ekip listesi
- `POST /api/teams` - Yeni ekip
- `POST /api/teams/:id/members` - Üye ekleme
- `GET /api/teams/:id/location` - Ekip konumları

### Kaynaklar
- `GET /api/resources` - Kaynak listesi
- `POST /api/resources/allocate` - Kaynak tahsisi
- `GET /api/resources/availability` - Müsait kaynaklar

## Acil Durum Seviyeleri

### Seviye 1 - Düşük
- Yerel müdahale
- Standart bildirimler
- Normal kaynak kullanımı

### Seviye 2 - Orta
- Bölgesel koordinasyon
- Genişletilmiş bildirimler
- Ek kaynak tahsisi

### Seviye 3 - Yüksek
- İl geneli koordinasyon
- Tüm kanallardan bildirim
- Maksimum kaynak mobilizasyonu

### Seviye 4 - Kritik
- Ulusal koordinasyon
- Acil durum protokolleri
- Tüm kaynaklar aktif

## Güvenlik Özellikleri

- End-to-end şifreleme
- Çok faktörlü kimlik doğrulama
- Rol bazlı erişim kontrolü
- Audit log sistemi
- Veri yedekleme
- Failover desteği

## Entegrasyonlar

- 112 Acil Çağrı Sistemi
- AFAD sistemleri
- Meteoroloji Genel Müdürlüğü
- Sağlık Bakanlığı sistemleri
- Emniyet sistemleri
- Yerel yönetim sistemleri

## Varsayılan Kullanıcılar

### Sistem Yöneticisi
- Email: admin@acildurum.gov.tr
- Şifre: Admin123!

### Koordinatör
- Email: koordinator@acildurum.gov.tr
- Şifre: Koordinator123!

### Saha Görevlisi
- Email: saha@acildurum.gov.tr
- Şifre: Saha123!

## Lisans

MIT