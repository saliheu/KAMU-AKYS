"""
Test Script: Yeni First Name + Last Name yapısıyla kayıt talebi oluştur
"""

import requests
import json

def create_test_registration():
    """
    Yeni ad/soyad yapısıyla test kayıt talebi oluştur
    """
    print("🚀 Yeni yapıyla test kayıt talebi oluşturuluyor...")
    
    # Test verisi
    test_data = {
        "email": "mehmet.demir@test.com",
        "password": "test123",
        "first_name": "Mehmet",
        "last_name": "Demir",
        "role": "employee"
    }
    
    try:
        # IAM servisine kayıt talebi gönder
        response = requests.post(
            "http://localhost:8001/register",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            print("✅ Kayıt talebi başarıyla oluşturuldu!")
            print(f"📝 Email: {test_data['email']}")
            print(f"👤 Ad: {test_data['first_name']}")
            print(f"👤 Soyad: {test_data['last_name']}")
            print(f"🔐 Rol: {test_data['role']}")
            
            # Response içeriğini yazdır
            try:
                result = response.json()
                print(f"📄 Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
            except:
                print(f"📄 Response Text: {response.text}")
                
        else:
            print(f"❌ Hata oluştu: {response.status_code}")
            print(f"📄 Hata detayı: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ IAM servisine bağlanılamadı. Servis çalışıyor mu?")
    except Exception as e:
        print(f"❌ Beklenmeyen hata: {str(e)}")

def check_registration_requests():
    """
    Kayıt taleplerini listele (admin token gerekiyor)
    """
    print("\n🔍 Kayıt talepleri kontrol ediliyor...")
    
    # Önce admin login yap
    login_data = {
        "email": "admin@test.com",
        "password": "admin123"
    }
    
    try:
        # Admin login
        login_response = requests.post(
            "http://localhost:8001/login",
            json=login_data
        )
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            auth_token = token_data.get("access_token")
            print("✅ Admin login başarılı")
            
            # Kayıt taleplerini getir
            requests_response = requests.get(
                "http://localhost:8001/admin/registrations",
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            
            if requests_response.status_code == 200:
                requests_data = requests_response.json()
                print(f"📋 {len(requests_data)} kayıt talebi bulundu:")
                
                for req in requests_data[-3:]:  # Son 3 talebi göster
                    print(f"  • ID: {req['id']}")
                    print(f"    📧 Email: {req['email']}")
                    print(f"    👤 Ad: {req.get('first_name', 'N/A')}")
                    print(f"    👤 Soyad: {req.get('last_name', 'N/A')}")
                    print(f"    🔐 Rol: {req['role']}")
                    print(f"    📅 Tarih: {req['requested_at']}")
                    print()
                    
            else:
                print(f"❌ Kayıt talepleri alınamadı: {requests_response.status_code}")
                print(f"📄 Hata: {requests_response.text}")
                
        else:
            print(f"❌ Admin login başarısız: {login_response.status_code}")
            print(f"📄 Hata: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Hata: {str(e)}")

if __name__ == "__main__":
    print("=" * 50)
    print("🧪 FIRST_NAME + LAST_NAME TEST")
    print("=" * 50)
    
    create_test_registration()
    check_registration_requests()
    
    print("\n" + "=" * 50)
    print("✅ Test tamamlandı!")
    print("📱 Frontend'e gidip 'Kayıt Talepleri' sayfasını kontrol edin")
    print("🌐 http://localhost:3000/registration-requests")
    print("=" * 50) 