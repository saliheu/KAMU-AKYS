# Bordro ve Maaş Yönetim Sistemi (RBAC Entegreli)

**Kamu AKYS** açık kaynak yazılım seti kapsamında geliştirilen **Bordro ve Maaş Yönetim Sistemi** prototipidir. Bu sistem, **Rol Tabanlı Erişim Kontrolü (RBAC)** ve **JWT Authentication** ile güvenlik altına alınmıştır.

## 📋 Proje Hakkında

Bu prototip, Türkiye'deki kamu kurumları için güvenli, ölçeklenebilir ve modern bir bordro yönetim sistemi örneği sunar. **IAM (Identity and Access Management) Servisi** ile entegre edilmiş, role-based yetkilendirme sistemi içerir. Docker ile tek komutta çalıştırılabilir ve temel bordro işlemlerini güvenli şekilde gerçekleştirebilir.

## 🔐 Güvenlik ve Yetkilendirme

### Roller
- **Admin**: Tüm sisteme erişim, tüm CRUD işlemleri
- **Employee**: Sadece kendi bilgilerine ve bordrolarına erişim

### Authentication
- JWT (JSON Web Token) tabanlı kimlik doğrulama
- Token'lar kullanıcı bilgisi ve rol bilgisini içerir
- 30 dakika token geçerlilik süresi

## 🚀 Özellikler

### 👥 Personel Yönetimi
- Yeni personel ekleme
- Personel listeleme ve görüntüleme
- Personel bilgilerini güncelleme
- Personel silme

### 💰 Bordro İşlemleri
- Otomatik bordro hesaplama (Gelir Vergisi %15, SGK Primi %14, İşsizlik Sigortası %1)
- Dönemsel bordro oluşturma
- Bordro listesi ve detay görüntüleme
- Bordro yazdırma özelliği

### 📊 Dashboard
- Toplam çalışan sayısı
- Oluşturulan bordro sayısı
- Aylık bordro istatistikleri
- Toplam brüt/net maaş bilgileri

## 🛠 Teknoloji Yığını

### IAM Servisi (Kimlik Doğrulama)
- **Python 3.11+** - Programlama dili
- **FastAPI** - Web framework
- **JWT (python-jose)** - Token yönetimi
- **BCrypt (passlib)** - Parola hashleme
- **PostgreSQL** - Kullanıcı veritabanı

### Backend (Bordro Servisi)
- **Python 3.11+** - Programlama dili
- **FastAPI** - Web framework
- **PostgreSQL** - Veritabanı
- **SQLAlchemy** - ORM
- **JWT Authentication** - Güvenlik

### Frontend
- **React 18** - UI framework
- **TypeScript** - Tip güvenliği
- **Redux Toolkit** - State management
- **Ant Design** - UI kütüphanesi
- **Vite** - Build tool

### Geliştirme & Deployment
- **Docker & Docker Compose** - Konteynerizasyon
- **PostgreSQL 15** - Veritabanı servisi

## 📦 Kurulum

### Gereksinimler
- Docker
- Docker Compose

### Kurulum Adımları

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd bordro-maas-yonetim-sistemi
```

2. **Docker Compose ile servisleri başlatın**
```bash
docker-compose up -d
```

3. **Servislerin başlamasını bekleyin**
- IAM Servisi: http://localhost:8001
- Backend (Bordro): http://localhost:8000
- Frontend: http://localhost:3000
- IAM API Docs: http://localhost:8001/docs
- Bordro API Docs: http://localhost:8000/docs

## 🎯 Kullanım

### 🔑 Kimlik Doğrulama Süreci

1. **Kullanıcı Oluşturma** (IAM Servisi - Port 8001)
```bash
curl -X POST "http://localhost:8001/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securePassword123",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

2. **Login ve Token Alma**
```bash
curl -X POST "http://localhost:8001/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

3. **API Çağrılarında Token Kullanımı**
```bash
curl -X GET "http://localhost:8000/api/employees/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### API Endpoints

#### IAM Servisi (Port 8001)
- `POST /users/` - Yeni kullanıcı oluştur
- `POST /token` - Giriş yap ve token al
- `GET /users/me` - Mevcut kullanıcı bilgisi
- `GET /users/` - Tüm kullanıcıları listele (admin only)
- `PUT /users/{user_id}/role` - Kullanıcı rolünü güncelle (admin only)

#### Çalışan İşlemleri (Port 8000) 🔒
- `POST /api/employees/` - Yeni çalışan ekleme (admin only)
- `GET /api/employees/` - Çalışanları listele (admin: tümü, employee: kendisi)
- `GET /api/employees/{id}` - Tek çalışan getir (role-based access)
- `PUT /api/employees/{id}` - Çalışan güncelle (admin only)
- `DELETE /api/employees/{id}` - Çalışan sil (admin only)

#### Bordro İşlemleri (Port 8000) 🔒
- `POST /api/payrolls/` - Yeni bordro oluştur (admin only)
- `GET /api/payrolls/` - Bordroları listele (admin: tümü, employee: kendisininki)
- `GET /api/payrolls/{id}` - Tek bordro detayı (role-based access)
- `POST /api/payrolls/calculate` - Bordro hesaplama (admin only)
- `GET /api/payrolls/dashboard/stats` - Dashboard istatistikleri (admin only)

### Frontend Sayfaları

1. **Ana Panel (/)**: Sistem geneli istatistikler
2. **Çalışanlar (/employees)**: Personel yönetimi
3. **Bordrolar (/payrolls)**: Bordro listesi ve yönetimi
4. **Bordro Detayı (/payrolls/:id)**: Tek bordro detay sayfası

## 🗄 Veritabanı Modeli

### Employee (Çalışanlar)
```sql
- id: INTEGER (Primary Key)
- first_name: VARCHAR(100)
- last_name: VARCHAR(100)  
- national_id: VARCHAR(11) (Unique)
- title: VARCHAR(200)
- hire_date: DATE
- gross_salary: FLOAT
- created_at: TIMESTAMP
```

### Payroll (Bordrolar)
```sql
- id: INTEGER (Primary Key)
- employee_id: INTEGER (Foreign Key)
- pay_period_start: DATE
- pay_period_end: DATE
- gross_salary: FLOAT
- deductions: JSON
- net_salary: FLOAT
- created_at: TIMESTAMP
```

## 🧮 Bordro Hesaplama Mantığı

Sistem, basit bir bordro hesaplama algoritması kullanır:

```
Brüt Maaş: Çalışanın kayıtlı brüt maaşı
- Gelir Vergisi: Brüt Maaş × %15
- SGK Primi: Brüt Maaş × %14  
- İşsizlik Sigortası: Brüt Maaş × %1
= Net Maaş: Brüt Maaş - Toplam Kesintiler
```

**Not**: Bu hesaplamalar temsilidir ve gerçek vergi/SGK mevzuatını yansıtmaz.

## 🐳 Docker Servisleri

```yaml
# PostgreSQL (IAM)
postgres_iam:
  - Port: 5433
  - Database: iam_db
  - User: admin / admin123

# PostgreSQL (Bordro)
postgres:
  - Port: 5432
  - Database: bordro_db
  - User: admin / admin123

# IAM Servisi
iam_service:
  - Port: 8001
  - FastAPI + JWT
  - Kullanıcı yönetimi

# Bordro Servisi  
backend:
  - Port: 8000
  - FastAPI + Auth
  - Bordro işlemleri

# Frontend React App
frontend:
  - Port: 3000
  - React + TypeScript
  - Hot reload desteği
```

## 🧪 Test Kullanıcıları

Sistemi test etmek için aşağıdaki kullanıcıları oluşturabilirsiniz:

### Admin Kullanıcısı
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "full_name": "Sistem Yöneticisi",
  "role": "admin"
}
```

### Employee Kullanıcısı
```json
{
  "email": "employee@example.com", 
  "password": "employee123",
  "full_name": "Çalışan Kullanıcı",
  "role": "employee"
}
```

**Not**: Employee kullanıcısının bordro işlemlerini görebilmesi için, employee.id ile user_id'nin eşleşmesi gerekir.

## 🔧 Geliştirme

### Backend Geliştirme
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Geliştirme  
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

### Veritabanı Migration
```bash
cd backend
alembic upgrade head
```

## 📝 API Dokümantasyonu

Backend başlatıldıktan sonra aşağıdaki URL'lerden API dokümantasyonuna erişebilirsiniz:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Test Verisi

Sistem ilk çalıştığında boş gelir. Test için örnek veriler ekleyebilirsiniz:

### Örnek Çalışan
```json
{
  "first_name": "Ahmet",
  "last_name": "Yılmaz", 
  "national_id": "12345678901",
  "title": "Yazılım Geliştirici",
  "hire_date": "2023-01-15",
  "gross_salary": 15000.00
}
```

## 🔐 Güvenlik Notları

Bu prototip aşağıdaki güvenlik özelliklerini **içermez**:
- Kullanıcı kimlik doğrulama
- Yetkilendirme sistemı
- E-Devlet entegrasyonu
- Veri şifreleme
- Audit log

Gerçek kullanım için bu özellikler eklenmeli ve güvenlik testleri yapılmalıdır.

## 🚧 Bilinen Limitasyonlar

- Gerçek vergi/SGK mevzuatı uygulanmaz
- E-Devlet entegrasyonu yoktur
- Kullanıcı yönetimi yoktur
- Raporlama özellikleri kısıtlıdır
- Backup/restore mekanizması yoktur

## 📞 Destek

Bu prototip, öğrenme ve geliştirme amaçlı oluşturulmuştur. Sorular için GitHub Issues kullanabilirsiniz.

## 📄 Lisans

Bu proje açık kaynak lisansı altında yayınlanmıştır. Detaylar için LICENSE dosyasına bakınız.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

---

**Kamu AKYS Projesi** - Açık kaynak kamu yazılımları için geliştirilen örnek uygulamalardan biridir.

## 🔗 User-Employee İlişkisi

### Sistem Mantığı
IAM servisindeki User (giriş hesabı) ile Bordro servisindeki Employee (personel profili) arasında `user_id` ilişkisi kurulmuştur.

```sql
-- Employee tablosundaki user_id kolonu
ALTER TABLE employees ADD COLUMN user_id INTEGER UNIQUE;
```

### Admin İş Akışı

1. **Yeni Çalışan Ekleme:**
   - Admin, Dashboard'da "Çalışan Ekle" butonuna tıklar
   - Form açılır ve sistemdeki mevcut kullanıcı hesapları listelenir
   - Admin, yeni çalışan profilini bir kullanıcı hesabıyla eşleştirir
   - Bu eşleştirme sayesinde employee rolündeki kullanıcı, sisteme giriş yaptığında sadece kendi verilerini görür

2. **Kullanıcı Seçimi:**
   - Dropdown menüde sadece "employee" rolündeki kullanıcılar görünür
   - Her kullanıcı için: "İsim Soyisim (email@domain.com)" formatında görüntü
   - Benzersizlik: Her employee profili sadece bir user hesabına bağlanabilir

3. **Veri Filtreleme:**
   - Employee giriş yaptığında sistem otomatik olarak `current_user.id` alır
   - Bu ID ile `Employee.user_id` eşleştirmesi yapılır
   - Bulunan `employee.id` üzerinden bordrolar filtrelenir

### Teknik Detaylar

```typescript
// Frontend - User listesi çekme
const fetchUsers = async () => {
  const response = await iamApi.getUsers()
  const employeeUsers = response.data.filter(user => user.role === 'employee')
  setUsers(employeeUsers)
}

// Backend - Employee ile User eşleştirme
def get_employee_by_user_id(self, user_id: int):
    return self.db.query(Employee).filter(Employee.user_id == user_id).first()
```

## 📋 Kullanım Senaryoları

### Senaryo 1: Yeni Çalışan Ekleme
1. Admin olarak sisteme giriş yapın
2. Dashboard'da "Çalışan Ekle" butonuna tıklayın
3. "Bağlı Kullanıcı Hesabı" dropdown'ından bir employee user seçin
4. Çalışan bilgilerini doldurun ve kaydedin
5. Artık seçilen kullanıcı kendi verilerini görebilir

### Senaryo 2: Employee Veri Erişimi
1. Employee hesabıyla sisteme giriş yapın
2. Sistem otomatik olarak user_id ilişkisini kontrol eder
3. Sadece o kullanıcıya ait employee profili ve bordroları görünür
4. Diğer çalışanların verilerine erişim engellenir

### Senaryo 3: Bordro Filtreleme
1. Employee "Bordrolarım" sayfasını ziyaret eder
2. Sistem arka planda şu işlemleri yapar:
   ```
   current_user.id → Employee.user_id → employee.id → Payroll.employee_id
   ```
3. Sadece o çalışana ait bordrolar listelenir

## 🔒 Güvenlik Özellikleri

- JWT token tabanlı kimlik doğrulama
- Rol bazlı erişim kontrolü (RBAC)
- Otomatik veri filtreleme
- Cross-service güvenli iletişim
- Token süresi dolumu kontrolü

## 🗃️ Veritabanı Şeması

```sql
-- IAM Database
Users:
- id (Primary Key)
- email (Unique)
- hashed_password
- full_name
- role (admin/employee)

-- Bordro Database  
Employees:
- id (Primary Key)
- user_id (Foreign Key → Users.id, Unique)
- first_name, last_name
- national_id (Unique)
- title, hire_date
- gross_salary

Payrolls:
- id (Primary Key)  
- employee_id (Foreign Key → Employees.id)
- pay_period_start, pay_period_end
- gross_salary, deductions, net_salary
```

## 🛠️ Geliştirme Notları

- Frontend: React 18 + TypeScript + Ant Design
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Authentication: JWT + bcrypt
- Container: Docker + Docker Compose
- API Documentation: Swagger UI (localhost:8000/docs, localhost:8001/docs)

## 📞 Destek

Bu sistem, Türk kamu kurumlarının ihtiyaçlarına göre özelleştirilmiştir. Entegrasyon ve özelleştirme konularında destek için geliştirici ekibiyle iletişime geçin.
