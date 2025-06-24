# Dilekçe Şikayet Yönetim Sistemi

Bu proje, kamu kurumları için kapsamlı bir dilekçe ve şikayet yönetim sistemi sunar. Vatandaşların dilekçe ve şikayetlerini dijital ortamda iletmelerini, takip etmelerini ve kurumların bu başvuruları etkin bir şekilde yönetmelerini sağlar.

## Özellikler

### Vatandaş Portalı
- [x] Online dilekçe/şikayet oluşturma
- [x] TC kimlik no ile giriş
- [x] Dosya ekleme (PDF, resim vb.)
- [x] Başvuru durumu takibi
- [x] Başvuru geçmişi görüntüleme
- [x] E-posta bildirimleri
- [x] Memnuniyet değerlendirmesi

### Kurum Portalı
- [x] Gelişmiş filtreleme ve arama
- [x] Otomatik departman yönlendirme
- [x] Görevli atama
- [x] Öncelik ve SLA yönetimi
- [x] Yanıt oluşturma (dahili/harici)
- [x] İş akışı yönetimi
- [x] Detaylı raporlama

### Sistem Özellikleri
- [x] JWT tabanlı kimlik doğrulama
- [x] Rol bazlı yetkilendirme
- [x] Dosya yönetimi
- [x] Audit trail (işlem geçmişi)
- [x] Dashboard ve istatistikler
- [x] RESTful API
- [x] Swagger/OpenAPI dokümantasyonu

## Teknoloji Yığını

### Backend
- **Java 17** ve **Spring Boot 3.1.0**
- **Spring Security** - Güvenlik
- **Spring Data JPA** - ORM
- **PostgreSQL** - Veritabanı
- **JWT** - Token bazlı kimlik doğrulama
- **Lombok** - Boilerplate kod azaltma
- **SpringDoc OpenAPI** - API dokümantasyonu

### Frontend
- **React 18** (TypeScript)
- **Material-UI** - UI bileşenleri
- **React Router** - Yönlendirme
- **Axios** - HTTP istekleri
- **Recharts** - Grafikler
- **Day.js** - Tarih işlemleri

## Kurulum

### Gereksinimler
- Java 17+
- Node.js 16+
- PostgreSQL 13+
- Maven 3.8+

### Backend Kurulumu

1. PostgreSQL veritabanı oluşturun:
```sql
CREATE DATABASE complaint_management_db;
```

2. `application.properties` dosyasını düzenleyin:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/complaint_management_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Backend'i başlatın:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Kurulumu

1. Bağımlılıkları yükleyin:
```bash
cd frontend
npm install
```

2. `.env` dosyası oluşturun:
```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

3. Frontend'i başlatın:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Giriş yap
- `POST /api/v1/auth/register` - Kayıt ol
- `POST /api/v1/auth/refresh` - Token yenile

### Complaints
- `GET /api/v1/complaints` - Şikayet listesi
- `POST /api/v1/complaints` - Yeni şikayet oluştur
- `GET /api/v1/complaints/{id}` - Şikayet detayı
- `PUT /api/v1/complaints/{id}` - Şikayet güncelle
- `POST /api/v1/complaints/{id}/assign` - Görevli ata
- `POST /api/v1/complaints/{id}/respond` - Yanıt ekle
- `POST /api/v1/complaints/{id}/rate` - Memnuniyet değerlendir

### Dashboard
- `GET /api/v1/dashboard/statistics` - İstatistikler
- `GET /api/v1/dashboard/department-stats` - Departman istatistikleri

## Kullanım

### Vatandaş Girişi
1. TC kimlik numaranız ile sisteme giriş yapın
2. "Yeni Dilekçe/Şikayet" butonuna tıklayın
3. Formu doldurun ve gerekli belgeleri ekleyin
4. Başvurunuzu gönderin
5. Başvuru numaranız ile takip edin

### Kurum Personeli Girişi
1. Kullanıcı adı ve şifre ile giriş yapın
2. Dashboard'da güncel durumu görüntüleyin
3. Size atanan şikayetleri yönetin
4. Vatandaşlara yanıt verin
5. Şikayetleri sonuçlandırın

## Şikayet Durumları

- **SUBMITTED** - Gönderildi
- **ASSIGNED** - Görevli Atandı
- **IN_PROGRESS** - İşlemde
- **PENDING_INFO** - Bilgi Bekleniyor
- **RESOLVED** - Çözümlendi
- **REJECTED** - Reddedildi
- **CLOSED** - Kapatıldı

## Öncelik Seviyeleri

- **LOW** - Düşük (15 gün)
- **MEDIUM** - Orta (10 gün)
- **HIGH** - Yüksek (5 gün)
- **URGENT** - Acil (2 gün)

## Güvenlik

- JWT token tabanlı kimlik doğrulama
- Rol bazlı yetkilendirme (ADMIN, OFFICER, CITIZEN)
- CORS koruması
- SQL injection koruması
- XSS koruması
- Dosya yükleme güvenliği

## Docker Desteği

```bash
# Docker ile çalıştırma
docker-compose up -d
```

## Lisans

Bu proje kamu kurumları için geliştirilmiştir.