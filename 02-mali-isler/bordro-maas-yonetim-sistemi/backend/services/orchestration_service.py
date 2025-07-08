from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from schemas import DirectEmployeeCreate, DirectEmployeeResponse, EmployeeCreate, ApproveRegistrationRequest, ApproveRegistrationResponse
from services.iam_client import IAMClient, IAMUserCreate
from services.employee_service import EmployeeService
from models import Employee

class OrchestrationService:
    def __init__(self, db: Session):
        self.db = db
        self.iam_client = IAMClient()
        self.employee_service = EmployeeService(db)
    
    async def create_employee_with_account(self, employee_data: DirectEmployeeCreate) -> DirectEmployeeResponse:
        """
        Doğrudan personel oluşturma orkestrasyon fonksiyonu
        1. IAM servisinde kullanıcı hesabı oluştur
        2. Bordro servisinde employee profili oluştur
        3. İkisini bağla
        """
        
        # Adım 1: IAM servisinin çalışıp çalışmadığını kontrol et
        if not await self.iam_client.health_check():
            raise Exception("IAM servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.")
        
        # Adım 2: National ID kontrolü (employee servisinde)
        existing_employee = self.employee_service.get_employee_by_national_id(employee_data.national_id)
        if existing_employee:
            raise ValueError(f"Bu TC Kimlik No ({employee_data.national_id}) ile kayıtlı çalışan zaten mevcut")
        
        # Adım 3: IAM servisinde kullanıcı oluştur
        try:
            iam_user_data = IAMUserCreate(
                email=employee_data.email,
                password=employee_data.password,
                first_name=employee_data.first_name,
                last_name=employee_data.last_name,
                role="employee"
            )
            
            # IAM servisi ile kullanıcı oluştur
            iam_user_response = await self.iam_client.create_user(iam_user_data)
            
        except Exception as e:
            # IAM servisi hatası
            raise Exception(f"Kullanıcı hesabı oluşturulamadı: {str(e)}")
        
        # Adım 4: Employee profili oluştur (IAM user_id ile birlikte)
        try:
            employee_create_data = EmployeeCreate(
                first_name=employee_data.first_name,
                last_name=employee_data.last_name,
                national_id=employee_data.national_id,
                title=employee_data.title,
                hire_date=employee_data.hire_date,
                gross_salary=employee_data.gross_salary,
                user_id=iam_user_response.id  # IAM'dan dönen user ID'yi bağla
            )
            
            created_employee = self.employee_service.create_employee(employee_create_data)
            
            # Başarılı response
            return DirectEmployeeResponse(
                employee=created_employee,
                user_id=iam_user_response.id,
                message=f"Personel ve kullanıcı hesabı başarıyla oluşturuldu. Email: {employee_data.email}"
            )
            
        except Exception as e:
            # Employee oluşturma hatası
            # Bu durumda IAM'da oluşturulan kullanıcıyı geri almaya çalışabiliriz
            # Ancak şu an için basit bir rollback stratejisi kullanıyoruz
            raise Exception(f"Personel profili oluşturulamadı: {str(e)}. Kullanıcı hesabı oluşturuldu ancak personel profili oluşturulamadı.")

    async def approve_registration_and_create_employee(
        self, 
        request_id: int, 
        approval_data: ApproveRegistrationRequest, 
        auth_token: str
    ) -> ApproveRegistrationResponse:
        """
        Kayıt talebini onayla ve aynı anda personel profili oluştur
        1. IAM servisinden registration request bilgilerini al
        2. IAM servisinde approve et (kullanıcı oluştur)
        3. Bordro servisinde employee profili oluştur
        """
        
        # Adım 1: IAM servisinin çalışıp çalışmadığını kontrol et
        if not await self.iam_client.health_check():
            raise Exception("IAM servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.")
        
        # Adım 2: Registration request bilgilerini al
        try:
            registration_request = await self.iam_client.get_registration_request(request_id, auth_token)
            if not registration_request:
                raise ValueError(f"ID {request_id} ile kayıt talebi bulunamadı")
        except Exception as e:
            raise Exception(f"Kayıt talebi bilgileri alınamadı: {str(e)}")
        
        # Adım 3: National ID kontrolü (employee servisinde)
        existing_employee = self.employee_service.get_employee_by_national_id(approval_data.national_id)
        if existing_employee:
            raise ValueError(f"Bu TC Kimlik No ({approval_data.national_id}) ile kayıtlı çalışan zaten mevcut")
        
        # Adım 4: IAM servisinde kayıt talebini onayla (kullanıcı oluştur)
        try:
            iam_user_response = await self.iam_client.approve_registration_request(request_id, auth_token)
        except Exception as e:
            raise Exception(f"Kayıt talebi onaylanamadı: {str(e)}")
        
        # Adım 5: Employee profili oluştur
        try:
            employee_create_data = EmployeeCreate(
                first_name=registration_request.first_name,
                last_name=registration_request.last_name,
                national_id=approval_data.national_id,
                title=approval_data.title,
                hire_date=approval_data.hire_date,
                gross_salary=approval_data.gross_salary,
                user_id=iam_user_response.id  # IAM'dan dönen user ID'yi bağla
            )
            
            created_employee = self.employee_service.create_employee(employee_create_data)
            
            # Başarılı response
            return ApproveRegistrationResponse(
                employee=created_employee,
                user_id=iam_user_response.id,
                message=f"Kayıt talebi onaylandı ve personel profili oluşturuldu. Kullanıcı: {registration_request.email}"
            )
            
        except Exception as e:
            # Employee oluşturma hatası - Bu durumda kullanıcı zaten oluşturulmuş oldu
            # Idealinde burada rollback yapılabilir ama şu an basit hata mesajı veriyoruz
            raise Exception(f"Personel profili oluşturulamadı: {str(e)}. Kullanıcı hesabı onaylandı ancak personel profili oluşturulamadı.")
        
    async def deactivate_employee_and_user(self, employee_id: int, auth_token: str) -> dict:
        """
        Çalışanı ve kullanıcı hesabını senkronize bir şekilde pasifleştir
        1. Employee bilgilerini getir
        2. Employee'yi pasifleştir (soft delete)
        3. IAM servisinde ilgili kullanıcı hesabını pasifleştir
        """
        
        # Adım 1: IAM servisinin çalışıp çalışmadığını kontrol et
        if not await self.iam_client.health_check():
            raise Exception("IAM servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.")
        
        # Adım 2: Employee bilgilerini getir
        employee = self.employee_service.get_employee(employee_id)
        if not employee:
            raise ValueError(f"ID {employee_id} ile çalışan bulunamadı")
        
        if not employee.is_active:
            raise ValueError("Bu çalışan zaten pasif durumda")
        
        # Adım 3: Employee'yi pasifleştir
        try:
            success = self.employee_service.delete_employee(employee_id)
            if not success:
                raise Exception("Employee pasifleştirilemedi")
        except Exception as e:
            raise Exception(f"Employee pasifleştirme hatası: {str(e)}")
        
        # Adım 4: IAM servisinde kullanıcı hesabını pasifleştir (eğer user_id varsa)
        iam_success = True
        iam_message = ""
        
        if employee.user_id:
            try:
                iam_success = await self.iam_client.deactivate_user(employee.user_id, auth_token)
                iam_message = "Kullanıcı hesabı da pasifleştirildi"
            except Exception as e:
                # IAM pasifleştirme hatası - Employee zaten pasifleştirildi, ama IAM başarısız
                # Bu durumu log'layalım ama işlemi başarısız saymaralım
                iam_message = f"Uyarı: Kullanıcı hesabı pasifleştirilemedi - {str(e)}"
                iam_success = False
        else:
            iam_message = "Bu employee'nin kullanıcı hesabı yok (pasifleştirme gerekmedi)"
        
        return {
            "employee_id": employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "employee_deactivated": True,
            "user_deactivated": iam_success,
            "message": f"Personel başarıyla pasifleştirildi. {iam_message}"
        }
        
    async def health_check(self) -> dict:
        """
        Sistem bileşenlerinin sağlık kontrolü
        """
        iam_status = await self.iam_client.health_check()
        
        # Database bağlantısı kontrolü
        try:
            self.db.execute("SELECT 1")
            db_status = True
        except:
            db_status = False
        
        return {
            "iam_service": iam_status,
            "database": db_status,
            "overall": iam_status and db_status
        } 