import httpx
from typing import Dict, Any, Optional
from pydantic import BaseModel

class IAMUserCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    role: str = "employee"

class IAMUserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool

class IAMRegistrationRequest(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: str

class IAMClient:
    def __init__(self, iam_service_url: str = "http://iam_service:8001"):
        self.iam_service_url = iam_service_url
        self.timeout = 30.0
    
    async def create_user(self, user_data: IAMUserCreate) -> IAMUserResponse:
        """
        IAM servisinde yeni kullanıcı oluştur
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.iam_service_url}/internal/users",
                    json=user_data.model_dump(),
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    return IAMUserResponse(**response.json())
                else:
                    # IAM servisinden gelen hata mesajını al
                    error_detail = response.json().get("detail", "Bilinmeyen hata")
                    raise Exception(f"IAM Service Error: {error_detail}")
                    
            except httpx.ConnectError:
                raise Exception("IAM servisi ile bağlantı kurulamadı")
            except httpx.TimeoutException:
                raise Exception("IAM servisi zaman aşımı")
            except httpx.HTTPError as e:
                raise Exception(f"IAM servis isteği hatası: {str(e)}")

    async def get_registration_request(self, request_id: int, auth_token: str) -> Optional[IAMRegistrationRequest]:
        """
        Belirli bir registration request'i getir
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.iam_service_url}/admin/registrations",
                    headers={
                        "Authorization": f"Bearer {auth_token}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    requests = response.json()
                    # Liste içinden belirli ID'ye sahip request'i bul
                    for req in requests:
                        if req["id"] == request_id:
                            return IAMRegistrationRequest(**req)
                    return None
                else:
                    error_detail = response.json().get("detail", "Bilinmeyen hata")
                    raise Exception(f"IAM Service Error: {error_detail}")
                    
            except httpx.ConnectError:
                raise Exception("IAM servisi ile bağlantı kurulamadı")
            except httpx.TimeoutException:
                raise Exception("IAM servisi zaman aşımı")
            except httpx.HTTPError as e:
                raise Exception(f"IAM servis isteği hatası: {str(e)}")

    async def approve_registration_request(self, request_id: int, auth_token: str) -> IAMUserResponse:
        """
        Registration request'i onayla ve kullanıcı oluştur
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.iam_service_url}/admin/registrations/approve/{request_id}",
                    headers={
                        "Authorization": f"Bearer {auth_token}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    return IAMUserResponse(**response.json())
                else:
                    error_detail = response.json().get("detail", "Bilinmeyen hata")
                    raise Exception(f"IAM Service Error: {error_detail}")
                    
            except httpx.ConnectError:
                raise Exception("IAM servisi ile bağlantı kurulamadı")
            except httpx.TimeoutException:
                raise Exception("IAM servisi zaman aşımı")
            except httpx.HTTPError as e:
                raise Exception(f"IAM servis isteği hatası: {str(e)}")

    async def deactivate_user(self, user_id: int, auth_token: str) -> bool:
        """
        IAM servisinde kullanıcıyı pasifleştir
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.iam_service_url}/admin/users/{user_id}/deactivate",
                    headers={
                        "Authorization": f"Bearer {auth_token}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    return True
                else:
                    error_detail = response.json().get("detail", "Bilinmeyen hata")
                    raise Exception(f"IAM Service Error: {error_detail}")
                    
            except httpx.ConnectError:
                raise Exception("IAM servisi ile bağlantı kurulamadı")
            except httpx.TimeoutException:
                raise Exception("IAM servisi zaman aşımı")
            except httpx.HTTPError as e:
                raise Exception(f"IAM servis isteği hatası: {str(e)}")
    
    async def health_check(self) -> bool:
        """
        IAM servisinin çalışıp çalışmadığını kontrol et
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.iam_service_url}/")
                return response.status_code == 200
        except:
            return False 