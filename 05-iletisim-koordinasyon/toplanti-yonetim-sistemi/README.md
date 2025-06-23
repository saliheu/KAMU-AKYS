# Toplantı Yönetim Sistemi

Kurumsal toplantıların planlanması, yönetimi ve takibi için geliştirilmiş kapsamlı bir web uygulaması.

## Özellikler

### Kullanıcı Yönetimi
- [x] JWT tabanlı kimlik doğrulama
- [x] Kullanıcı kayıt ve giriş
- [x] Rol tabanlı yetkilendirme (Admin, User)
- [x] Departman bazlı organizasyon

### Toplantı Yönetimi
- [x] Toplantı oluşturma ve düzenleme
- [x] Yüz yüze, çevrimiçi ve hibrit toplantı desteği
- [x] Toplantı odası rezervasyonu
- [x] Katılımcı yönetimi
- [x] Hatırlatma sistemi
- [x] Tekrarlayan toplantılar

### Toplantı Özellikleri
- [x] Gündem yönetimi
- [x] Dosya ekleme
- [x] Toplantı tutanakları
- [x] Aksiyon öğeleri takibi
- [x] Katılımcı yanıtları (kabul/ret/belirsiz)

### Arama ve Filtreleme
- [x] Toplantı arama
- [x] Tarih bazlı filtreleme
- [x] Durum bazlı filtreleme
- [x] Katılımcı bazlı listeleme

## Teknolojiler

### Backend
- **Java 17** ve **Spring Boot 3**
- **Spring Security** (JWT authentication)
- **Spring Data JPA** (Hibernate)
- **PostgreSQL** veritabanı
- **Maven** bağımlılık yönetimi
- **Lombok** 
- **Swagger/OpenAPI** dokümantasyon

### Frontend
- **React 18** (TypeScript)
- **Material-UI (MUI)** bileşen kütüphanesi
- **React Router** yönlendirme
- **Axios** HTTP istemcisi
- **Day.js** tarih işlemleri
- **Context API** durum yönetimi

## Kurulum

### Gereksinimler
- Java 17+
- Node.js 16+
- PostgreSQL 13+
- Maven 3.6+

### Backend Kurulumu

1. PostgreSQL veritabanı oluşturun:
```sql
CREATE DATABASE meeting_management_db;
```

2. `application.yml` dosyasını düzenleyin:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/meeting_management_db
    username: your_username
    password: your_password
```

3. Backend'i başlatın:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend http://localhost:8080 adresinde çalışacaktır.

### Frontend Kurulumu

1. Bağımlılıkları yükleyin:
```bash
cd frontend
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm start
```

Frontend http://localhost:3000 adresinde çalışacaktır.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Meetings
- `GET /api/meetings` - Tüm toplantıları listele
- `GET /api/meetings/{id}` - Toplantı detayı
- `POST /api/meetings` - Yeni toplantı oluştur
- `PUT /api/meetings/{id}` - Toplantı güncelle
- `POST /api/meetings/{id}/cancel` - Toplantı iptal et
- `POST /api/meetings/{id}/start` - Toplantı başlat
- `POST /api/meetings/{id}/complete` - Toplantı tamamla
- `GET /api/meetings/my-meetings` - Katıldığım toplantılar
- `GET /api/meetings/organized` - Düzenlediğim toplantılar
- `GET /api/meetings/upcoming` - Yaklaşan toplantılar
- `GET /api/meetings/search?q={query}` - Toplantı ara

## Proje Yapısı

```
toplanti-yonetim-sistemi/
├── backend/
│   ├── src/main/java/gov/communication/meetingmanagement/
│   │   ├── config/         # Güvenlik ve uygulama yapılandırmaları
│   │   ├── controller/     # REST API kontrolörleri
│   │   ├── dto/           # Veri transfer objeleri
│   │   ├── entity/        # JPA varlık sınıfları
│   │   ├── repository/    # Veritabanı erişim katmanı
│   │   ├── security/      # JWT ve güvenlik bileşenleri
│   │   └── service/       # İş mantığı servisleri
│   └── src/main/resources/
│       └── application.yml # Uygulama ayarları
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/    # Yeniden kullanılabilir bileşenler
│       ├── contexts/      # React Context API
│       ├── pages/         # Sayfa bileşenleri
│       ├── services/      # API servisleri
│       ├── types/         # TypeScript tip tanımlamaları
│       └── App.tsx        # Ana uygulama bileşeni
└── README.md
```

## Ekran Görüntüleri

- **Giriş Ekranı**: Kullanıcı kimlik doğrulama
- **Dashboard**: Özet bilgiler ve yaklaşan toplantılar
- **Toplantı Listesi**: Tüm toplantıların görüntülenmesi
- **Toplantı Oluşturma**: Yeni toplantı planlama formu
- **Toplantı Detayı**: Toplantı bilgileri ve katılımcılar

## Güvenlik

- JWT token tabanlı kimlik doğrulama
- Rol bazlı erişim kontrolü
- CORS yapılandırması
- Şifre hashleme (BCrypt)
- SQL injection koruması

## Geliştirme

### Docker Desteği
Proje Docker ile çalıştırılabilir. `docker-compose.yml` dosyası ile tüm servisleri başlatabilirsiniz.

### Test
- Backend: JUnit ve Mockito ile birim testler
- Frontend: Jest ve React Testing Library

## Lisans

Bu proje kamu kurumları için geliştirilmiştir.
