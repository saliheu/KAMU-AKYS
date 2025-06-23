# İzin Yönetim Sistemi

Bu modül **insan kaynaklari** kategorisi altında kamu kurumları için geliştirilmiş açık kaynak **izin yönetim sistemi** projesidir.

## Proje Hakkında

Bu proje, kamu kurumlarının dijital dönüşüm sürecinde ihtiyaç duyulan izin yönetim sistemi çözümünü açık kaynak olarak sunmaktadır. Çalışanların izin taleplerini oluşturabileceği, yöneticilerin onaylayabileceği ve izin bakiyelerinin takip edilebildiği kapsamlı bir sistemdir.

## Özellikler

- [x] Temel sistem mimarisi
- [x] Kullanıcı yönetimi ve yetkilendirme (JWT tabanlı)
- [x] RESTful API geliştirme
- [x] Güvenlik katmanları (Spring Security)
- [x] Veri yönetimi ve saklama
- [x] İzin talep ve onay süreçleri
- [x] İzin bakiye yönetimi
- [x] Departman bazlı organizasyon yapısı
- [ ] Raporlama ve analitik (kısmen tamamlandı)
- [ ] Mobil uygulama desteği
- [ ] Entegrasyon API'leri

## Teknoloji Yığını

- **Backend:** Java 17 / Spring Boot 3.1.5
- **Frontend:** Angular 17 / TypeScript
- **Veritabanı:** PostgreSQL
- **UI Framework:** Angular Material
- **Authentication:** JWT (JSON Web Token)
- **Build Tools:** Maven (Backend), npm (Frontend)
- **Container:** Docker
- **API Documentation:** Swagger/OpenAPI (planlanıyor)

## Kurulum

### Gereksinimler
- Java 17
- Node.js 18+
- PostgreSQL 13+
- Maven 3.8+

### Backend Kurulumu

1. PostgreSQL veritabanı oluşturun:
```sql
CREATE DATABASE izin_yonetim_db;
```

2. Backend klasörüne gidin ve bağımlılıkları yükleyin:
```bash
cd backend
mvn clean install
```

3. application.properties dosyasını düzenleyin (gerekirse):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/izin_yonetim_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

4. Uygulamayı başlatın:
```bash
mvn spring-boot:run
```

Backend http://localhost:8080 adresinde çalışacaktır.

### Frontend Kurulumu

1. Frontend klasörüne gidin ve bağımlılıkları yükleyin:
```bash
cd frontend
npm install
```

2. Uygulamayı başlatın:
```bash
ng serve
```

Frontend http://localhost:4200 adresinde çalışacaktır.

## Docker ile Çalıştırma

Proje kök dizininde:

```bash
docker-compose up -d
```

## Kullanım

### Varsayılan Kullanıcılar

Sistem başlatıldığında otomatik olarak test kullanıcıları oluşturulur:

- **Admin:** admin@example.com / admin123
- **Yönetici:** yonetici@example.com / yonetici123
- **Çalışan:** calisan@example.com / calisan123

### İzin Türleri

- Yıllık İzin (ANNUAL)
- Hastalık İzni (SICK)
- Evlilik İzni (MARRIAGE)
- Vefat İzni (BEREAVEMENT)
- Doğum İzni (MATERNITY)
- Babalık İzni (PATERNITY)
- Diğer (OTHER)

### İzin Talep Durumları

- Beklemede (PENDING)
- Onaylandı (APPROVED)
- Reddedildi (REJECTED)
- İptal Edildi (CANCELLED)

## API Dokümantasyonu

API dokümantasyonu için [/docs](./docs) klasörüne bakınız.

## Katkıda Bulunma

Projeye katkıda bulunmak için lütfen [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasını inceleyin.

## Lisans

Bu proje açık kaynak lisansı altında yayınlanacaktır. Detaylar için [LICENSE](../LICENSE) dosyasına bakınız.

## İletişim

Proje hakkında sorularınız için issue açabilir veya proje ekibiyle iletişime geçebilirsiniz.
