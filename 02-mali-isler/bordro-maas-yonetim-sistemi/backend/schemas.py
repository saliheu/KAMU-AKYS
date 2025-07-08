from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Dict, Any, List, Optional
from enum import Enum

# Bordro Durumu Enum'u
class PayrollStatus(str, Enum):
    DRAFT = "DRAFT"
    APPROVED = "APPROVED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"

# Employee Schemas
class EmployeeBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    national_id: str = Field(..., min_length=11, max_length=11)
    title: str = Field(..., min_length=1, max_length=200)
    hire_date: date
    gross_salary: float = Field(..., gt=0)

class EmployeeCreate(EmployeeBase):
    user_id: Optional[int] = Field(None, description="IAM User ID ilişkisi")

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    gross_salary: Optional[float] = Field(None, gt=0)

class Employee(EmployeeBase):
    id: int
    user_id: Optional[int] = None
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

# Payroll Schemas
class PayrollBase(BaseModel):
    employee_id: int
    pay_period_start: date
    pay_period_end: date

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    status: Optional[PayrollStatus] = None

class PayrollCalculated(BaseModel):
    gross_salary: float
    deductions: Dict[str, Any]
    net_salary: float

class Payroll(PayrollBase):
    id: int
    gross_salary: float
    deductions: Dict[str, Any]
    net_salary: float
    status: PayrollStatus = PayrollStatus.DRAFT
    created_at: datetime
    employee: Employee

    class Config:
        from_attributes = True

class PayrollSummary(BaseModel):
    id: int
    employee_full_name: str
    employee_is_active: bool  # Çalışanın aktif durumu
    pay_period_start: date
    pay_period_end: date
    gross_salary: float
    net_salary: float
    status: PayrollStatus
    created_at: datetime

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_employees: int
    total_payrolls: int
    current_month_payrolls: int
    total_gross_salary: float
    total_net_salary: float
    current_month_net_salary: float  # Bu ay ödenen net maaş toplamı
    estimated_monthly_budget: float  # Aktif çalışanların maaşları toplamı
    budget_usage_percent: float  # Ödenen maaşların bütçe oranı

class RecentActivity(BaseModel):
    key: str
    action: str
    details: str
    time: str
    type: str  # 'employee' | 'payroll' | 'system'

# Doğrudan Personel Oluşturma Schema (IAM + Employee birlikte)
class DirectEmployeeCreate(BaseModel):
    # Employee bilgileri
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    national_id: str = Field(..., min_length=11, max_length=11)
    title: str = Field(..., min_length=1, max_length=200)
    hire_date: date
    gross_salary: float = Field(..., gt=0)
    
    # IAM User bilgileri
    email: str = Field(..., description="Kullanıcı email adresi")
    password: str = Field(..., min_length=6, description="Kullanıcı parolası")

class DirectEmployeeResponse(BaseModel):
    # Oluşturulan employee bilgisi
    employee: Employee
    # Oluşturulan user ID'si
    user_id: int
    # İşlem durumu
    message: str

# Kayıt Talebi Onaylama ve Personel Oluşturma Schema'ları
class ApproveRegistrationRequest(BaseModel):
    # Personel bilgileri
    title: str = Field(..., min_length=1, max_length=200, description="Personelin unvanı")
    hire_date: date = Field(..., description="İşe başlama tarihi")
    gross_salary: float = Field(..., gt=0, description="Brüt maaş")
    national_id: str = Field(..., min_length=11, max_length=11, description="TC Kimlik No")

class ApproveRegistrationResponse(BaseModel):
    # Oluşturulan employee bilgisi
    employee: Employee
    # Oluşturulan user ID'si
    user_id: int
    # İşlem durumu
    message: str

# IAM Registration Request Modeli (IAM servisinden gelen veri için)
class RegistrationRequestInfo(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    requested_at: datetime 

# System Settings Schemas
class TaxBracket(BaseModel):
    min_amount: float
    max_amount: Optional[float]  # None = sınırsız
    rate: float  # Yüzde cinsinden
    description: str

class CompanyInfoUpdate(BaseModel):
    company_name: Optional[str] = None
    company_tax_number: Optional[str] = None
    company_address: Optional[str] = None
    company_phone: Optional[str] = None
    company_logo_url: Optional[str] = None

class FinancialSettingsUpdate(BaseModel):
    minimum_wage: Optional[float] = None
    sgk_employee_rate: Optional[float] = None
    sgk_employer_rate: Optional[float] = None
    unemployment_insurance_rate: Optional[float] = None
    income_tax_brackets: Optional[List[TaxBracket]] = None

class SecuritySettingsUpdate(BaseModel):
    min_password_length: Optional[int] = None
    require_uppercase: Optional[bool] = None
    require_lowercase: Optional[bool] = None
    require_numbers: Optional[bool] = None
    require_special_chars: Optional[bool] = None

class SMTPSettingsUpdate(BaseModel):
    smtp_server: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: Optional[bool] = None
    smtp_from_email: Optional[str] = None
    smtp_from_name: Optional[str] = None

class FinancialSettingsCreate(BaseModel):
    effective_year: int
    effective_date: datetime
    minimum_wage: Optional[float] = None
    sgk_employee_rate: Optional[float] = None
    sgk_employer_rate: Optional[float] = None
    unemployment_insurance_rate: Optional[float] = None
    income_tax_brackets: Optional[List[TaxBracket]] = None
    description: Optional[str] = None

class FinancialSettingsResponse(BaseModel):
    id: int
    effective_year: int
    effective_date: datetime
    minimum_wage: Optional[float]
    sgk_employee_rate: Optional[float]
    sgk_employer_rate: Optional[float]
    unemployment_insurance_rate: Optional[float]
    income_tax_brackets: Optional[List[TaxBracket]]
    created_at: datetime
    created_by: Optional[str]
    description: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

class SystemSettingsResponse(BaseModel):
    id: int
    # Kurum Bilgileri
    company_name: Optional[str]
    company_tax_number: Optional[str]
    company_address: Optional[str]
    company_phone: Optional[str]
    company_logo_url: Optional[str]
    
    # Sistem Ayarları
    system_currency: str
    date_format: str
    
    # Güvenlik Ayarları
    min_password_length: int
    require_uppercase: bool
    require_lowercase: bool
    require_numbers: bool
    require_special_chars: bool
    
    # SMTP Ayarları
    smtp_server: Optional[str]
    smtp_port: Optional[int]
    smtp_username: Optional[str]
    smtp_use_tls: bool
    smtp_from_email: Optional[str]
    smtp_from_name: Optional[str]
    # Not: smtp_password güvenlik amacıyla response'da yer almaz
    
    # Metadata
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[str]

    class Config:
        from_attributes = True