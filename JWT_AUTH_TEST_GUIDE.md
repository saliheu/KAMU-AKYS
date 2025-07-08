# JWT Authentication & RBAC Test Rehberi

Bu dokümanda, Bordro Yönetim Sistemi'nin IAM servisi ile entegre edilmiş JWT Authentication ve Role-Based Access Control (RBAC) sisteminin nasıl test edileceği anlatılmaktadır.

## 🚀 Sistem Başlatma

```bash
cd 02-mali-isler/bordro-maas-yonetim-sistemi
docker-compose up --build
```

**Servisler:**
- IAM Servisi: http://localhost:8001
- Bordro Servisi: http://localhost:8000  
- Frontend: http://localhost:3000

## 🧪 Adım Adım Test Senaryosu

### 1. Admin Kullanıcısı Oluştur

```bash
curl -X POST "http://localhost:8001/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "full_name": "Test Admin",
    "role": "admin"
  }'
```

### 2. Employee Kullanıcısı Oluştur

```bash
curl -X POST "http://localhost:8001/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@test.com",
    "password": "employee123", 
    "full_name": "Test Employee",
    "role": "employee"
  }'
```

### 3. Admin Token Al

```bash
curl -X POST "http://localhost:8001/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

**Response örneği:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 4. Employee Token Al

```bash
curl -X POST "http://localhost:8001/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@test.com",
    "password": "employee123"
  }'
```

## 🔒 Yetkilendirme Testleri

### Admin Yetkisi Testi

**1. Çalışan Oluştur (Admin olarak):**
```bash
curl -X POST "http://localhost:8000/api/employees/" \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ahmet",
    "last_name": "Yılmaz",
    "national_id": "12345678901",
    "title": "Yazılım Geliştirici",
    "hire_date": "2023-01-15",
    "gross_salary": 50000.0
  }'
```

**2. Tüm Çalışanları Listele (Admin olarak):**
```bash
curl -X GET "http://localhost:8000/api/employees/" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

**3. Bordro Oluştur (Admin olarak):**
```bash
curl -X POST "http://localhost:8000/api/payrolls/" \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": 1,
    "pay_period_start": "2024-01-01",
    "pay_period_end": "2024-01-31"
  }'
```

### Employee Yetkisi Testi

**1. Çalışan Oluşturmaya Çalış (Employee olarak - BAŞARISIZ OLMALI):**
```bash
curl -X POST "http://localhost:8000/api/employees/" \
  -H "Authorization: Bearer {EMPLOYEE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "national_id": "98765432109",
    "title": "Test",
    "hire_date": "2023-01-15",
    "gross_salary": 30000.0
  }'
```

**Beklenen Response: 403 Forbidden**

**2. Kendi Bilgilerini Görüntüle (Employee olarak):**
```bash
curl -X GET "http://localhost:8000/api/employees/" \
  -H "Authorization: Bearer {EMPLOYEE_TOKEN}"
```

**3. Başkasının Bilgilerine Erişmeye Çalış (Employee olarak - BAŞARISIZ OLMALI):**
```bash
curl -X GET "http://localhost:8000/api/employees/1" \
  -H "Authorization: Bearer {EMPLOYEE_TOKEN}"
```

**Not:** Employee kullanıcısının employee.id = user_id olması gerekir.

## 🛡️ Güvenlik Testleri

### 1. Token Olmadan Erişim Testi
```bash
curl -X GET "http://localhost:8000/api/employees/"
```
**Beklenen: 401 Unauthorized**

### 2. Geçersiz Token Testi
```bash
curl -X GET "http://localhost:8000/api/employees/" \
  -H "Authorization: Bearer invalid_token_here"
```
**Beklenen: 401 Unauthorized**

### 3. Token Süresi Dolma Testi
- 30 dakika bekleyin
- Herhangi bir API çağrısı yapın
**Beklenen: 401 Unauthorized**

## 📊 Dashboard Erişim Testleri

### Admin Dashboard (Başarılı)
```bash
curl -X GET "http://localhost:8000/api/payrolls/dashboard/stats" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

### Employee Dashboard (Başarısız)
```bash
curl -X GET "http://localhost:8000/api/payrolls/dashboard/stats" \
  -H "Authorization: Bearer {EMPLOYEE_TOKEN}"
```
**Beklenen: 403 Forbidden**

## 🔍 Beklenen Sonuçlar

### ✅ Admin Kullanıcısı İçin
- Tüm API endpoint'lerine erişim
- CRUD işlemleri yapabilir
- Dashboard'a erişim
- Diğer kullanıcıların verilerini görebilir

### ✅ Employee Kullanıcısı İçin
- Sadece kendi bilgilerine erişim
- Okuma yetkisi (sadece kendi verileri)
- Dashboard'a erişim yok
- CRUD işlemleri yapamaz (admin yetkisi gerekli)

### ❌ Yetkisiz Erişim
- Token olmadan API kullanımı
- Geçersiz token ile erişim
- Rol dışı işlemler (employee'nin admin işlemi yapması)

## 🐛 Sorun Giderme

### JWT Token Decode Etme
```python
import jwt
token = "your_jwt_token_here"
decoded = jwt.decode(token, options={"verify_signature": False})
print(decoded)
```

### Secret Key Kontrolü
Her iki serviste de aynı SECRET_KEY kullanıldığından emin olun:
- `iam_service/auth.py`
- `backend/auth.py`

### Veritabanı Bağlantı Kontrolü
```bash
docker-compose logs iam_service
docker-compose logs backend
```

Bu rehber sayesinde sisteminizin JWT Authentication ve RBAC entegrasyonunun doğru çalıştığını doğrulayabilirsiniz. 