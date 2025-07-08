from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, JSON, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base
from enum import Enum as PyEnum

class PayrollStatus(PyEnum):
    DRAFT = "DRAFT"      # Taslak
    APPROVED = "APPROVED"  # Onaylandı
    PAID = "PAID"        # Ödendi
    CANCELLED = "CANCELLED"  # İptal Edildi

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True, nullable=True)  # IAM User ID ilişkisi
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    national_id = Column(String(11), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    hire_date = Column(DateTime, nullable=False)
    gross_salary = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)  # Aktif durum kontrolü
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # İlişkiler
    payrolls = relationship("Payroll", back_populates="employee")

class Payroll(Base):
    __tablename__ = "payrolls"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    pay_period_start = Column(DateTime, nullable=False)
    pay_period_end = Column(DateTime, nullable=False)
    gross_salary = Column(Float, nullable=False)
    deductions = Column(JSON, nullable=False)  # Kesintiler JSON formatında
    net_salary = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default=PayrollStatus.DRAFT.value)  # Bordro durumu
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    # İlişkiler
    employee = relationship("Employee", back_populates="payrolls") 

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Kurum Bilgileri
    company_name = Column(String(500), nullable=True)
    company_tax_number = Column(String(20), nullable=True)
    company_address = Column(Text, nullable=True)
    company_phone = Column(String(20), nullable=True)
    company_logo_url = Column(String(500), nullable=True)
    
    # Sistem Ayarları
    system_currency = Column(String(5), default="TRY", nullable=False)
    date_format = Column(String(20), default="DD.MM.YYYY", nullable=False)
    
    # Güvenlik Ayarları (yeni eklenenler)
    min_password_length = Column(Integer, default=8, nullable=False)
    require_uppercase = Column(Boolean, default=True, nullable=False)
    require_lowercase = Column(Boolean, default=True, nullable=False)
    require_numbers = Column(Boolean, default=True, nullable=False)
    require_special_chars = Column(Boolean, default=True, nullable=False)
    
    # SMTP Ayarları (yeni eklenenler)
    smtp_server = Column(String(255), nullable=True)
    smtp_port = Column(Integer, nullable=True)
    smtp_username = Column(String(255), nullable=True)
    smtp_password = Column(String(255), nullable=True)  # Şifrelenmiş olarak saklanmalı
    smtp_use_tls = Column(Boolean, default=True, nullable=False)
    smtp_from_email = Column(String(255), nullable=True)
    smtp_from_name = Column(String(255), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    updated_by = Column(String(100), nullable=True)  # Güncelleyen admin email

class FinancialSettings(Base):
    __tablename__ = "financial_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Tarihsel Bilgi
    effective_year = Column(Integer, nullable=False, index=True)  # Geçerlilik yılı
    effective_date = Column(DateTime, nullable=False, index=True)  # Geçerlilik tarihi
    
    # Finansal Parametreler
    minimum_wage = Column(Float, nullable=True)  # Asgari ücret
    sgk_employee_rate = Column(Float, nullable=True)  # SGK çalışan prim oranı
    sgk_employer_rate = Column(Float, nullable=True)  # SGK işveren prim oranı
    unemployment_insurance_rate = Column(Float, nullable=True)  # İşsizlik sigortası oranı
    
    # Gelir Vergisi Dilimleri (JSON formatında)
    income_tax_brackets = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=func.now(), nullable=False)
    created_by = Column(String(100), nullable=True)  # Oluşturan admin email
    description = Column(Text, nullable=True)  # Açıklama (ör: "2024 Yılı Finansal Parametreleri")
    is_active = Column(Boolean, default=True, nullable=False)  # Aktif durumu 