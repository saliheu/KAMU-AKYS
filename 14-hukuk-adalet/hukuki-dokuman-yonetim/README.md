# Hukuki Doküman Yönetim Sistemi

Kamu kurumları için geliştirilmiş kapsamlı hukuki doküman yönetim sistemi.

## Özellikler

### Doküman Yönetimi
- ✅ Gelişmiş doküman yükleme ve düzenleme
- ✅ Versiyon kontrolü ve karşılaştırma
- ✅ Doküman kilitleme sistemi
- ✅ Otomatik metin çıkarma (OCR)
- ✅ Tam metin arama (Elasticsearch)
- ✅ Kategori ve etiket bazlı organizasyon

### Dijital İmza
- ✅ Elektronik imza desteği
- ✅ Çoklu imza toplama
- ✅ İmza doğrulama
- ✅ Sertifika yönetimi

### İş Akışı Yönetimi
- ✅ Özelleştirilebilir onay süreçleri
- ✅ Adım bazlı iş akışları
- ✅ Otomatik bildirimler
- ✅ Deadline takibi

### Şablon Sistemi
- ✅ Doküman şablonları
- ✅ Değişken yerleştirme
- ✅ Otomatik doküman oluşturma

### Paylaşım ve Erişim
- ✅ Kullanıcı ve departman bazlı paylaşım
- ✅ Güvenli link paylaşımı
- ✅ İndirme limiti ve süre kontrolü
- ✅ Şifre korumalı paylaşım

## Teknolojiler

### Backend
- Node.js + Express.js
- PostgreSQL (ana veritabanı)
- Redis (önbellekleme)
- Elasticsearch (arama)
- Socket.io (gerçek zamanlı)
- JWT Authentication
- Multer (dosya yükleme)
- Bull Queue (arka plan işleri)
- Nodemailer (e-posta)

### Frontend
- React 18 + TypeScript
- Redux Toolkit
- Material-UI
- React Router v6
- React Hook Form
- Chart.js
- Socket.io Client

## Kurulum

### Gereksinimler
- Node.js 16+
- PostgreSQL 13+
- Redis 6+
- Elasticsearch 7+

### Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin

# Veritabanını oluşturun
createdb legal_documents_db

# Sunucuyu başlatın
npm run dev
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/refresh` - Token yenileme
- `GET /api/auth/me` - Kullanıcı bilgileri

### Documents
- `GET /api/documents` - Doküman listesi
- `GET /api/documents/:id` - Doküman detayı
- `POST /api/documents` - Doküman oluşturma
- `PUT /api/documents/:id` - Doküman güncelleme
- `DELETE /api/documents/:id` - Doküman silme
- `POST /api/documents/:id/lock` - Doküman kilitleme
- `POST /api/documents/:id/unlock` - Kilit açma

### Versions
- `GET /api/versions/document/:documentId` - Versiyon listesi
- `POST /api/versions/:id/restore` - Versiyon geri yükleme
- `GET /api/versions/:id/compare/:compareId` - Versiyon karşılaştırma

### Workflows
- `GET /api/workflows` - İş akışı listesi
- `POST /api/workflows` - İş akışı oluşturma
- `POST /api/workflows/:id/advance` - İş akışı ilerletme
- `POST /api/workflows/:id/cancel` - İş akışı iptali

### Templates
- `GET /api/templates` - Şablon listesi
- `POST /api/templates` - Şablon oluşturma
- `POST /api/templates/:id/generate` - Doküman oluşturma

### Shares
- `GET /api/shares/my-shares` - Paylaşımlarım
- `POST /api/shares` - Paylaşım oluşturma
- `PUT /api/shares/:id` - Paylaşım güncelleme
- `DELETE /api/shares/:id` - Paylaşım iptali

### Signatures
- `POST /api/signatures/sign/:documentId` - Doküman imzalama
- `GET /api/signatures/verify/:documentId` - İmza doğrulama
- `POST /api/signatures/request/:documentId` - İmza talebi

### Search
- `GET /api/search` - Genel arama
- `GET /api/search/suggestions` - Arama önerileri
- `POST /api/search/advanced` - Gelişmiş arama

### Reports
- `GET /api/reports/dashboard` - Dashboard verileri
- `GET /api/reports/activity` - Aktivite raporu
- `POST /api/reports/export` - Rapor dışa aktarma

### Admin
- `GET /api/admin/users` - Kullanıcı yönetimi
- `GET /api/admin/settings` - Sistem ayarları
- `GET /api/admin/stats` - Sistem istatistikleri
- `POST /api/admin/maintenance/cleanup` - Temizlik işlemleri

## Güvenlik Özellikleri

- JWT tabanlı kimlik doğrulama
- Rol bazlı erişim kontrolü (RBAC)
- Doküman seviyesinde erişim kontrolü
- Şifreleme ve dijital imza
- Rate limiting
- XSS ve CSRF koruması
- Güvenli dosya yükleme

## Varsayılan Kullanıcı

- Email: admin@legal.gov.tr
- Şifre: Admin123!

## Lisans

MIT