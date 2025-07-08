from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import require_admin, TokenData
from services.settings_service import SettingsService
from schemas import (
    SystemSettingsResponse, CompanyInfoUpdate, FinancialSettingsUpdate,
    SecuritySettingsUpdate, SMTPSettingsUpdate, FinancialSettingsCreate, FinancialSettingsResponse,
    TaxBracket
)

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("/", response_model=SystemSettingsResponse)
async def get_system_settings(
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Sistem ayarlarını getir (sadece admin)"""
    service = SettingsService(db)
    settings = service.get_or_create_settings()
    
    return SystemSettingsResponse(
        id=settings.id,
        company_name=settings.company_name,
        company_tax_number=settings.company_tax_number,
        company_address=settings.company_address,
        company_phone=settings.company_phone,
        company_logo_url=settings.company_logo_url,
        system_currency=settings.system_currency,
        date_format=settings.date_format,
        min_password_length=settings.min_password_length,
        require_uppercase=settings.require_uppercase,
        require_lowercase=settings.require_lowercase,
        require_numbers=settings.require_numbers,
        require_special_chars=settings.require_special_chars,
        smtp_server=settings.smtp_server,
        smtp_port=settings.smtp_port,
        smtp_username=settings.smtp_username,
        smtp_use_tls=settings.smtp_use_tls,
        smtp_from_email=settings.smtp_from_email,
        smtp_from_name=settings.smtp_from_name,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
        updated_by=settings.updated_by
    )

@router.put("/company", response_model=SystemSettingsResponse)
async def update_company_info(
    data: CompanyInfoUpdate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Kurum bilgilerini güncelle (sadece admin)"""
    service = SettingsService(db)
    
    try:
        settings = service.update_company_info(data, current_user.email)
        
        return SystemSettingsResponse(
            id=settings.id,
            company_name=settings.company_name,
            company_tax_number=settings.company_tax_number,
            company_address=settings.company_address,
            company_phone=settings.company_phone,
            company_logo_url=settings.company_logo_url,
            minimum_wage=settings.minimum_wage,
            sgk_employee_rate=settings.sgk_employee_rate,
            sgk_employer_rate=settings.sgk_employer_rate,
            unemployment_insurance_rate=settings.unemployment_insurance_rate,
            income_tax_brackets=service.get_current_tax_brackets(),
            system_currency=settings.system_currency,
            date_format=settings.date_format,
            created_at=settings.created_at,
            updated_at=settings.updated_at,
            updated_by=settings.updated_by
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Kurum bilgileri güncellenirken hata oluştu: {str(e)}"
        )

@router.put("/financial", response_model=SystemSettingsResponse)
async def update_financial_settings(
    data: FinancialSettingsUpdate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Finansal ayarları güncelle (sadece admin)"""
    service = SettingsService(db)
    
    try:
        settings = service.update_financial_settings(data, current_user.email)
        
        return SystemSettingsResponse(
            id=settings.id,
            company_name=settings.company_name,
            company_tax_number=settings.company_tax_number,
            company_address=settings.company_address,
            company_phone=settings.company_phone,
            company_logo_url=settings.company_logo_url,
            minimum_wage=settings.minimum_wage,
            sgk_employee_rate=settings.sgk_employee_rate,
            sgk_employer_rate=settings.sgk_employer_rate,
            unemployment_insurance_rate=settings.unemployment_insurance_rate,
            income_tax_brackets=service.get_current_tax_brackets(),
            system_currency=settings.system_currency,
            date_format=settings.date_format,
            created_at=settings.created_at,
            updated_at=settings.updated_at,
            updated_by=settings.updated_by
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Finansal ayarlar güncellenirken hata oluştu: {str(e)}"
        )

@router.get("/minimum-wage")
async def get_current_minimum_wage(
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Mevcut asgari ücreti getir"""
    service = SettingsService(db)
    return {"minimum_wage": service.get_current_minimum_wage()}

@router.get("/sgk-rates")
async def get_current_sgk_rates(
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Mevcut SGK oranlarını getir"""
    service = SettingsService(db)
    return service.get_current_sgk_rates()

@router.put("/security", response_model=SystemSettingsResponse)
async def update_security_settings(
    data: SecuritySettingsUpdate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Güvenlik ayarlarını güncelle"""
    service = SettingsService(db)
    
    try:
        settings = service.update_security_settings(data, current_user.email)
        
        return SystemSettingsResponse(
            id=settings.id,
            company_name=settings.company_name,
            company_tax_number=settings.company_tax_number,
            company_address=settings.company_address,
            company_phone=settings.company_phone,
            company_logo_url=settings.company_logo_url,
            system_currency=settings.system_currency,
            date_format=settings.date_format,
            min_password_length=settings.min_password_length,
            require_uppercase=settings.require_uppercase,
            require_lowercase=settings.require_lowercase,
            require_numbers=settings.require_numbers,
            require_special_chars=settings.require_special_chars,
            smtp_server=settings.smtp_server,
            smtp_port=settings.smtp_port,
            smtp_username=settings.smtp_username,
            smtp_use_tls=settings.smtp_use_tls,
            smtp_from_email=settings.smtp_from_email,
            smtp_from_name=settings.smtp_from_name,
            created_at=settings.created_at,
            updated_at=settings.updated_at,
            updated_by=settings.updated_by
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Güvenlik ayarları güncellenirken hata oluştu: {str(e)}"
        )

@router.put("/smtp", response_model=SystemSettingsResponse)
async def update_smtp_settings(
    data: SMTPSettingsUpdate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """SMTP ayarlarını güncelle"""
    service = SettingsService(db)
    
    try:
        settings = service.update_smtp_settings(data, current_user.email)
        
        return SystemSettingsResponse(
            id=settings.id,
            company_name=settings.company_name,
            company_tax_number=settings.company_tax_number,
            company_address=settings.company_address,
            company_phone=settings.company_phone,
            company_logo_url=settings.company_logo_url,
            system_currency=settings.system_currency,
            date_format=settings.date_format,
            min_password_length=settings.min_password_length,
            require_uppercase=settings.require_uppercase,
            require_lowercase=settings.require_lowercase,
            require_numbers=settings.require_numbers,
            require_special_chars=settings.require_special_chars,
            smtp_server=settings.smtp_server,
            smtp_port=settings.smtp_port,
            smtp_username=settings.smtp_username,
            smtp_use_tls=settings.smtp_use_tls,
            smtp_from_email=settings.smtp_from_email,
            smtp_from_name=settings.smtp_from_name,
            created_at=settings.created_at,
            updated_at=settings.updated_at,
            updated_by=settings.updated_by
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SMTP ayarları güncellenirken hata oluştu: {str(e)}"
        )

# Finansal Ayarlar (Tarihsel)
@router.get("/financial", response_model=List[FinancialSettingsResponse])
async def get_financial_settings(
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Tüm finansal ayarları getir (tarihsel)"""
    service = SettingsService(db)
    settings_list = service.get_all_financial_settings()
    
    return [
        FinancialSettingsResponse(
            id=fs.id,
            effective_year=fs.effective_year,
            effective_date=fs.effective_date,
            minimum_wage=fs.minimum_wage,
            sgk_employee_rate=fs.sgk_employee_rate,
            sgk_employer_rate=fs.sgk_employer_rate,
            unemployment_insurance_rate=fs.unemployment_insurance_rate,
            income_tax_brackets=service.get_current_tax_brackets() if fs.income_tax_brackets else [],
            created_at=fs.created_at,
            created_by=fs.created_by,
            description=fs.description,
            is_active=fs.is_active
        ) for fs in settings_list
    ]

@router.post("/financial", response_model=FinancialSettingsResponse)
async def create_financial_settings(
    data: FinancialSettingsCreate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Yeni finansal ayarlar oluştur"""
    service = SettingsService(db)
    
    try:
        financial_settings = service.create_financial_settings(data, current_user.email)
        
        return FinancialSettingsResponse(
            id=financial_settings.id,
            effective_year=financial_settings.effective_year,
            effective_date=financial_settings.effective_date,
            minimum_wage=financial_settings.minimum_wage,
            sgk_employee_rate=financial_settings.sgk_employee_rate,
            sgk_employer_rate=financial_settings.sgk_employer_rate,
            unemployment_insurance_rate=financial_settings.unemployment_insurance_rate,
            income_tax_brackets=[TaxBracket(**bracket) for bracket in (financial_settings.income_tax_brackets or [])],
            created_at=financial_settings.created_at,
            created_by=financial_settings.created_by,
            description=financial_settings.description,
            is_active=financial_settings.is_active
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Finansal ayarlar oluşturulurken hata oluştu: {str(e)}"
        )

@router.get("/financial/current", response_model=FinancialSettingsResponse)
async def get_current_financial_settings(
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Mevcut finansal ayarları getir"""
    service = SettingsService(db)
    financial_settings = service.get_current_financial_settings()
    
    if not financial_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aktif finansal ayarlar bulunamadı"
        )
    
    return FinancialSettingsResponse(
        id=financial_settings.id,
        effective_year=financial_settings.effective_year,
        effective_date=financial_settings.effective_date,
        minimum_wage=financial_settings.minimum_wage,
        sgk_employee_rate=financial_settings.sgk_employee_rate,
        sgk_employer_rate=financial_settings.sgk_employer_rate,
        unemployment_insurance_rate=financial_settings.unemployment_insurance_rate,
        income_tax_brackets=[TaxBracket(**bracket) for bracket in (financial_settings.income_tax_brackets or [])],
        created_at=financial_settings.created_at,
        created_by=financial_settings.created_by,
        description=financial_settings.description,
        is_active=financial_settings.is_active
    ) 