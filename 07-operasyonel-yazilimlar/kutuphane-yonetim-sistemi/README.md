# Kütüphane Yönetim Sistemi

Bu proje, kamu kurumları için kapsamlı bir kütüphane yönetim sistemi sunar. Kitap kataloglama, üye yönetimi, ödünç verme işlemleri ve raporlama özellikleri içerir.

## Özellikler

### Kitap Yönetimi
- [x] Kitap kataloglama (ISBN, başlık, yazar, yayınevi, kategori)
- [x] Çoklu kopya yönetimi
- [x] Barkod ve QR kod oluşturma
- [x] Kitap durumu takibi (mevcut, ödünç, kayıp, hasarlı)
- [x] Gelişmiş arama ve filtreleme
- [x] Kapak resmi yükleme

### Üye Yönetimi
- [x] Üye kaydı ve profil yönetimi
- [x] TC kimlik no ile kayıt
- [x] Üye kartı oluşturma (PDF)
- [x] Üye tipleri (öğrenci, öğretmen, personel, halk)
- [x] Üyelik durumu takibi
- [x] Üyelik geçmişi

### Ödünç Verme İşlemleri
- [x] Kitap ödünç verme ve iade
- [x] Otomatik gecikme hesaplama
- [x] Ceza yönetimi
- [x] Ödünç süresi uzatma
- [x] Rezervasyon sistemi
- [x] Ödünç limitleri

### Raporlama
- [x] Dashboard istatistikleri
- [x] Ödünç raporları
- [x] Envanter raporları
- [x] Üye raporları
- [x] Gecikme raporları
- [x] Popüler kitaplar raporu
- [x] Excel'e aktarma

### Güvenlik
- [x] JWT tabanlı kimlik doğrulama
- [x] Rol bazlı yetkilendirme (Admin, Kütüphaneci, Asistan)
- [x] API güvenliği

## Teknoloji Yığını

### Backend
- **Python 3.8+** ve **Django 4.2**
- **Django REST Framework** - RESTful API
- **PostgreSQL** - Veritabanı
- **Redis** - Cache ve Celery broker
- **Celery** - Asenkron görevler
- **JWT** - Kimlik doğrulama
- **Pillow** - Görsel işleme
- **ReportLab** - PDF oluşturma
- **python-barcode & qrcode** - Barkod/QR kod

### Frontend
- **React 18** (TypeScript)
- **Material-UI** - UI bileşenleri
- **React Router** - Yönlendirme
- **Axios** - HTTP istekleri
- **Recharts** - Grafikler
- **Day.js** - Tarih işlemleri

## Kurulum

### Gereksinimler
- Python 3.8+
- Node.js 16+
- PostgreSQL 13+
- Redis

### Backend Kurulumu

1. Sanal ortam oluşturun:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Bağımlılıkları yükleyin:
```bash
pip install -r requirements.txt
```

3. PostgreSQL veritabanı oluşturun:
```sql
CREATE DATABASE library_management_db;
```

4. `.env` dosyası oluşturun:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=library_management_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
```

5. Migrations çalıştırın:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Süper kullanıcı oluşturun:
```bash
python manage.py createsuperuser
```

7. Sunucuyu başlatın:
```bash
python manage.py runserver
```

### Frontend Kurulumu

1. Bağımlılıkları yükleyin:
```bash
cd frontend
npm install
```

2. `.env` dosyası oluşturun:
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

3. Geliştirme sunucusunu başlatın:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/members/users/login/` - Giriş yap
- `POST /api/v1/auth/refresh/` - Token yenile

### Books
- `GET /api/v1/books/` - Kitap listesi
- `POST /api/v1/books/` - Yeni kitap ekle
- `GET /api/v1/books/{id}/` - Kitap detayı
- `PUT /api/v1/books/{id}/` - Kitap güncelle
- `DELETE /api/v1/books/{id}/` - Kitap sil
- `GET /api/v1/books/search/` - Kitap ara
- `GET /api/v1/books/popular/` - Popüler kitaplar
- `POST /api/v1/books/{id}/add_copy/` - Kopya ekle

### Members
- `GET /api/v1/members/` - Üye listesi
- `POST /api/v1/members/` - Yeni üye ekle
- `GET /api/v1/members/{id}/` - Üye detayı
- `PUT /api/v1/members/{id}/` - Üye güncelle
- `POST /api/v1/members/{id}/suspend/` - Üye askıya al
- `GET /api/v1/members/{id}/loans/` - Üye ödünç geçmişi
- `GET /api/v1/members/{id}/card/` - Üye kartı oluştur

### Loans
- `GET /api/v1/loans/` - Ödünç listesi
- `POST /api/v1/loans/` - Yeni ödünç verme
- `POST /api/v1/loans/{id}/return_book/` - Kitap iade
- `POST /api/v1/loans/{id}/renew/` - Süre uzat
- `GET /api/v1/loans/overdue/` - Geciken ödünçler

### Reports
- `GET /api/v1/reports/dashboard/` - Dashboard istatistikleri
- `GET /api/v1/reports/loans/` - Ödünç raporu
- `GET /api/v1/reports/inventory/` - Envanter raporu
- `GET /api/v1/reports/export/{type}/` - Excel'e aktar

## Varsayılan Ayarlar

- Ödünç süresi: 14 gün
- Maksimum ödünç limiti: 5 kitap
- Günlük gecikme cezası: 1 TL
- Rezervasyon süresi: 3 gün

## Lisans

Bu proje kamu kurumları için geliştirilmiştir.
