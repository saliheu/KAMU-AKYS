# Elektronik Belge Yönetim Sistemi

Bu modül **belge yonetim** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **elektronik belge yönetim sistemi** projesidir.

## Proje Hakkında

Bu proje, kamu kurumlarının dijital dönüşüm sürecinde ihtiyaç duyulan elektronik belge yönetim sistemi çözümünü açık kaynak olarak sunmaktadır. Belge yükleme, kategorilendirme, versiyon kontrolü, iş akışı yönetimi ve güvenli paylaşım özelliklerini içerir.

## Özellikler

- [x] Temel sistem mimarisi
- [x] Kullanıcı yönetimi ve yetkilendirme (JWT tabanlı)
- [x] RESTful API geliştirme
- [x] Güvenlik katmanları
- [x] Belge yükleme ve indirme
- [x] Versiyon kontrolü
- [x] Kategorilendirme ve etiketleme
- [x] İş akışı yönetimi
- [x] Erişim kontrolü ve paylaşım
- [x] Belge geçmişi ve loglama
- [ ] Gelişmiş raporlama ve analitik
- [ ] Mobil uygulama desteği
- [ ] Harici sistem entegrasyonları

## Teknoloji Yığını

- **Backend:** Python 3.11 / Django 4.2.7 / Django REST Framework
- **Frontend:** React 18 / TypeScript / Material-UI
- **Veritabanı:** PostgreSQL 15
- **Cache:** Redis
- **Mesaj Kuyruğu:** Celery + Redis
- **Container:** Docker
- **Belge Depolama:** Yerel dosya sistemi / AWS S3 (opsiyonel)

## Kurulum

### Docker ile Kurulum (Önerilen)

```bash
# Repository'yi klonlayın
git clone https://github.com/yourusername/elektronik-belge-yonetim-sistemi.git
cd elektronik-belge-yonetim-sistemi

# Docker container'ları başlatın
docker-compose up -d

# Varsayılan admin kullanıcısı oluşturun
docker-compose exec backend python manage.py createsuperuser
```

### Manuel Kurulum

#### Backend

```bash
cd backend

# Virtual environment oluşturun
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Veritabanı migration'larını çalıştırın
python manage.py migrate

# Statik dosyaları toplayın
python manage.py collectstatic

# Süper kullanıcı oluşturun
python manage.py createsuperuser

# Sunucuyu başlatın
python manage.py runserver
```

#### Frontend

```bash
cd frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
```

## Kullanım

### Varsayılan Erişim Bilgileri

- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- API Dokümantasyonu: http://localhost:8000/swagger/

### Test Kullanıcıları

Sistem başlatıldığında aşağıdaki test kullanıcılarını oluşturabilirsiniz:

- Admin: admin / admin123
- Yönetici: yonetici / yonetici123
- Kullanıcı: kullanici / kullanici123

### Temel Özellikler

1. **Belge Yönetimi**
   - Çoklu dosya formatı desteği (PDF, Word, Excel, resimler vb.)
   - Otomatik virus taraması
   - Versiyon kontrolü
   - Metadata yönetimi

2. **Kategorilendirme**
   - Hiyerarşik kategori yapısı
   - Etiketleme sistemi
   - Gelişmiş arama ve filtreleme

3. **İş Akışı**
   - Özelleştirilebilir onay süreçleri
   - Otomatik bildirimler
   - Görev atama ve takibi

4. **Güvenlik**
   - Rol tabanlı erişim kontrolü
   - Belge düzeyinde yetkilendirme
   - Tüm işlemlerin loglanması
   - SSL/TLS desteği

## API Dokümantasyonu

API dokümantasyonu için [/docs](./docs) klasörüne bakınız.

## Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## Lisans

Bu proje açık kaynak lisansı altında yayınlanacaktır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## İletişim

Proje hakkında sorularınız için issue açabilir veya proje ekibiyle iletişime geçebilirsiniz.
