from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from services.employee_service import EmployeeService
from services.orchestration_service import OrchestrationService
from schemas import Employee, EmployeeCreate, EmployeeUpdate, DirectEmployeeCreate, DirectEmployeeResponse, ApproveRegistrationRequest, ApproveRegistrationResponse
from auth import get_current_user, require_admin, require_employee_or_admin, TokenData

router = APIRouter()

@router.post("/", response_model=Employee, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_data: EmployeeCreate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Yeni çalışan oluştur (sadece admin)"""
    service = EmployeeService(db)
    
    # TC Kimlik No kontrolü
    existing_employee = service.get_employee_by_national_id(employee_data.national_id)
    if existing_employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu TC Kimlik No ile kayıtlı çalışan zaten mevcut"
        )
    
    try:
        return service.create_employee(employee_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/", response_model=List[Employee])
async def get_employees(
    skip: int = 0,
    limit: int = 100,
    current_user: TokenData = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """Çalışanları listele (admin: tümü, employee: sadece kendisi)"""
    service = EmployeeService(db)
    
    if current_user.role == "admin":
        return service.get_employees(skip=skip, limit=limit)
    else:  # employee
        # Employee sadece kendi bilgisini görebilir
        employee = service.get_employee_by_user_id(current_user.user_id)
        return [employee] if employee else []

@router.get("/{employee_id}", response_model=Employee)
async def get_employee(
    employee_id: int,
    current_user: TokenData = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """ID'ye göre çalışan getir (admin: herkes, employee: sadece kendisi)"""
    service = EmployeeService(db)
    employee = service.get_employee_by_id_and_user(
        employee_id, current_user.user_id, current_user.role
    )
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Çalışan bulunamadı veya erişim yetkiniz yok"
        )
    
    return employee

@router.put("/{employee_id}", response_model=Employee)
async def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Çalışan bilgilerini güncelle (sadece admin)"""
    service = EmployeeService(db)
    employee = service.update_employee(employee_id, employee_data)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Çalışan bulunamadı"
        )
    
    return employee

@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
async def delete_employee(
    employee_id: int,
    request: Request,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Çalışanı ve kullanıcı hesabını pasifleştir (sadece admin)"""
    try:
        # Authorization header'ından token'ı al
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization token gerekli"
            )
        
        auth_token = auth_header.replace("Bearer ", "")
        
        orchestration_service = OrchestrationService(db)
        result = await orchestration_service.deactivate_employee_and_user(employee_id, auth_token)
        return result
    except ValueError as e:
        # Validation hataları
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Sistem hataları
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/create-with-account", response_model=DirectEmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee_with_account(
    employee_data: DirectEmployeeCreate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Doğrudan personel ve kullanıcı hesabı oluştur (sadece admin)
    Bu endpoint IAM servisi ile koordineli çalışır ve tek adımda:
    1. IAM servisinde kullanıcı hesabı oluşturur
    2. Bordro servisinde employee profili oluşturur
    3. İkisini birbiriyle bağlar
    """
    try:
        orchestration_service = OrchestrationService(db)
        result = await orchestration_service.create_employee_with_account(employee_data)
        return result
    except ValueError as e:
        # Validation hataları
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Sistem hataları
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/approve-registration/{request_id}", response_model=ApproveRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def approve_registration_and_create_employee(
    request_id: int,
    approval_data: ApproveRegistrationRequest,
    request: Request,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Kayıt talebini onayla ve personel profili oluştur (sadece admin)
    Bu endpoint IAM servisi ile koordineli çalışır ve tek adımda:
    1. IAM servisinden registration request bilgilerini alır
    2. IAM servisinde kayıt talebini onaylar (kullanıcı hesabı oluşturur)
    3. Bordro servisinde employee profili oluşturur
    4. İkisini birbiriyle bağlar
    """
    try:
        # Authorization header'ından token'ı al
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization token gerekli"
            )
        
        auth_token = auth_header.replace("Bearer ", "")
        
        orchestration_service = OrchestrationService(db)
        result = await orchestration_service.approve_registration_and_create_employee(
            request_id=request_id,
            approval_data=approval_data,
            auth_token=auth_token
        )
        return result
    except ValueError as e:
        # Validation hataları
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Sistem hataları
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 