#!/usr/bin/env python3
import asyncio
import aiohttp
import json

async def create_admin_user():
    """IAM servisinde admin kullanıcısı oluştur"""
    
    # Admin kullanıcı bilgileri
    admin_data = {
        "email": "admin@bordro.gov.tr",
        "password": "Admin123!",
        "first_name": "System",
        "last_name": "Administrator",
        "role": "admin"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            # IAM servisine admin kullanıcısı oluşturma isteği
            async with session.post(
                "http://iam_service:8001/admin/create-admin", 
                json=admin_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 201:
                    result = await response.json()
                    print("✅ Admin kullanıcısı başarıyla oluşturuldu!")
                    print(f"📧 Email: {admin_data['email']}")
                    print(f"🔑 Şifre: {admin_data['password']}")
                    print(f"🆔 User ID: {result.get('id', 'N/A')}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Admin kullanıcısı oluşturulamadı: {response.status}")
                    print(f"Hata: {error_text}")
                    return False
                    
        except aiohttp.ClientError as e:
            print(f"❌ Bağlantı hatası: {e}")
            return False
        except Exception as e:
            print(f"❌ Beklenmeyen hata: {e}")
            return False

async def test_login():
    """Admin kullanıcısı ile giriş testi"""
    
    login_data = {
        "username": "admin@bordro.gov.tr",
        "password": "Admin123!"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            # Giriş testi
            async with session.post(
                "http://iam_service:8001/token",
                data=login_data,  # Form data olarak gönder
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            ) as response:
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Admin giriş testi başarılı!")
                    print(f"🎫 Token alındı: {result.get('access_token', '')[:50]}...")
                    return result.get('access_token')
                else:
                    error_text = await response.text()
                    print(f"❌ Giriş başarısız: {response.status}")
                    print(f"Hata: {error_text}")
                    return None
                    
        except Exception as e:
            print(f"❌ Giriş testi hatası: {e}")
            return None

async def main():
    print("🚀 Admin kullanıcısı oluşturma script'i başlatılıyor...")
    print()
    
    # Admin kullanıcısı oluştur
    success = await create_admin_user()
    
    if success:
        print()
        print("⏳ Giriş testi yapılıyor...")
        
        # Giriş testi
        token = await test_login()
        
        if token:
            print()
            print("🎉 Sistem hazır! Aşağıdaki bilgilerle giriş yapabilirsiniz:")
            print("📧 Email: admin@bordro.gov.tr")
            print("🔑 Şifre: Admin123!")
            print()
            print("🌐 Frontend: http://localhost:3000")
            print("🔧 Backend API: http://localhost:8000/docs")
            print("👤 IAM Service: http://localhost:8001/docs")
    else:
        print("❌ Admin kullanıcısı oluşturulamadı. Lütfen IAM servisini kontrol edin.")

if __name__ == "__main__":
    asyncio.run(main()) 