# Sınav Yönetim Sistemi

Eğitim kurumları ve kamu kuruluşları için kapsamlı online sınav hazırlama, uygulama ve değerlendirme platformu.

## Özellikler

### Sınav Yönetimi
- ✅ Online sınav oluşturma ve planlama
- ✅ Çoktan seçmeli, açık uçlu, eşleştirme soruları
- ✅ Soru bankası yönetimi
- ✅ Rastgele soru seçimi
- ✅ Adaptif sınav desteği
- ✅ Sınav takvimi ve programlama

### Soru Bankası
- ✅ Kategorize edilmiş soru havuzu
- ✅ Zorluk seviyesi belirleme
- ✅ Multimedya destekli sorular
- ✅ Soru içe/dışa aktarma
- ✅ Soru istatistikleri ve analizi
- ✅ Bloom taksonomisi desteği

### Öğrenci Yönetimi
- ✅ Öğrenci kayıt ve profil yönetimi
- ✅ Sınav erişim kontrolü
- ✅ Kimlik doğrulama (QR kod, yüz tanıma)
- ✅ Sınav geçmişi takibi
- ✅ Performans analizi
- ✅ Sertifika ve belge oluşturma

### Sınav Güvenliği
- ✅ Gerçek zamanlı gözetim (proctoring)
- ✅ Webcam ve ekran kaydı
- ✅ Kopya çekme tespiti
- ✅ Tarayıcı kilitleme modu
- ✅ IP kısıtlaması
- ✅ Zaman sınırı ve otomatik gönderim

### Değerlendirme ve Raporlama
- ✅ Otomatik puanlama
- ✅ Manuel değerlendirme arayüzü
- ✅ Detaylı sınav analitiği
- ✅ Başarı grafikleri ve istatistikler
- ✅ Karşılaştırmalı raporlar
- ✅ PDF rapor oluşturma

### Bildirimler
- ✅ Sınav hatırlatmaları
- ✅ Sonuç bildirimleri
- ✅ E-posta ve SMS entegrasyonu
- ✅ Anlık bildirimler
- ✅ Toplu mesajlaşma

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL
- Redis (önbellekleme ve oturum yönetimi)
- Socket.io (gerçek zamanlı iletişim)
- Bull Queue (iş kuyruğu)
- JWT (kimlik doğrulama)
- Multer (dosya yükleme)
- PDFKit (PDF oluşturma)
- Sharp (görüntü işleme)

### Frontend
- React + TypeScript
- Redux Toolkit
- Material-UI
- Socket.io Client
- React Query
- React Hook Form
- Recharts (grafikler)
- React Webcam
- React PDF

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/verify-qr` - QR kod doğrulama

### Sınavlar
- `GET /api/exams` - Sınav listesi
- `POST /api/exams` - Yeni sınav oluşturma
- `GET /api/exams/:id` - Sınav detayı
- `PUT /api/exams/:id` - Sınav güncelleme
- `DELETE /api/exams/:id` - Sınav silme
- `POST /api/exams/:id/publish` - Sınav yayınlama
- `POST /api/exams/:id/clone` - Sınav kopyalama

### Sorular
- `GET /api/questions` - Soru listesi
- `POST /api/questions` - Yeni soru ekleme
- `GET /api/questions/:id` - Soru detayı
- `PUT /api/questions/:id` - Soru güncelleme
- `DELETE /api/questions/:id` - Soru silme
- `POST /api/questions/import` - Toplu soru içe aktarma
- `GET /api/questions/export` - Soru dışa aktarma

### Öğrenciler
- `GET /api/students` - Öğrenci listesi
- `POST /api/students` - Öğrenci kaydı
- `GET /api/students/:id` - Öğrenci profili
- `PUT /api/students/:id` - Öğrenci güncelleme
- `GET /api/students/:id/exams` - Öğrenci sınavları
- `GET /api/students/:id/results` - Öğrenci sonuçları

### Sınav Oturumları
- `POST /api/sessions/start` - Sınav başlatma
- `GET /api/sessions/:id` - Oturum bilgisi
- `POST /api/sessions/:id/answer` - Cevap gönderme
- `POST /api/sessions/:id/submit` - Sınav teslimi
- `GET /api/sessions/:id/review` - Sınav inceleme
- `POST /api/sessions/:id/flag` - Soru işaretleme

### Sonuçlar
- `GET /api/results` - Sonuç listesi
- `GET /api/results/:id` - Sonuç detayı
- `POST /api/results/:id/evaluate` - Manuel değerlendirme
- `GET /api/results/:id/certificate` - Sertifika oluşturma
- `POST /api/results/:id/appeal` - İtiraz başvurusu

### Raporlar
- `GET /api/reports/exam/:id` - Sınav raporu
- `GET /api/reports/student/:id` - Öğrenci raporu
- `GET /api/reports/analytics` - Genel analitik
- `GET /api/reports/comparison` - Karşılaştırmalı rapor
- `POST /api/reports/export` - Rapor dışa aktarma

### Kategoriler
- `GET /api/categories` - Kategori listesi
- `POST /api/categories` - Kategori oluşturma
- `PUT /api/categories/:id` - Kategori güncelleme
- `DELETE /api/categories/:id` - Kategori silme

### Bildirimler
- `GET /api/notifications` - Bildirim listesi
- `POST /api/notifications/send` - Bildirim gönderme
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `POST /api/notifications/bulk` - Toplu bildirim

### Ayarlar
- `GET /api/settings` - Sistem ayarları
- `PUT /api/settings` - Ayarları güncelle
- `GET /api/settings/exam-rules` - Sınav kuralları
- `PUT /api/settings/exam-rules` - Kuralları güncelle

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
- Email: admin@sinav.gov.tr
- Şifre: Admin123!

### Öğretmen
- Email: ogretmen@sinav.gov.tr
- Şifre: Ogretmen123!

### Öğrenci
- Email: ogrenci@sinav.gov.tr
- Şifre: Ogrenci123!

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (RBAC)
- Rate limiting
- XSS ve CSRF koruması
- SQL injection koruması
- Şifreli veri iletimi (HTTPS)
- Güvenli dosya yükleme
- IP beyaz listesi
- Oturum yönetimi
- Kopya çekme engelleme

## Lisans

MIT