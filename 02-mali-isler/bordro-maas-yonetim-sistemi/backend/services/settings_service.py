from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, date
from models import SystemSettings, FinancialSettings
from schemas import (
    CompanyInfoUpdate, FinancialSettingsUpdate, SystemSettingsResponse, TaxBracket,
    SecuritySettingsUpdate, SMTPSettingsUpdate, FinancialSettingsCreate, FinancialSettingsResponse
)

class SettingsService:
    def __init__(self, db: Session):
        self.db = db

    def get_settings(self) -> Optional[SystemSettings]:
        """Sistem ayarlarını getir (tek kayıt olmalı)"""
        return self.db.query(SystemSettings).first()

    def get_or_create_settings(self) -> SystemSettings:
        """Ayarları getir, yoksa varsayılan değerlerle oluştur"""
        settings = self.get_settings()
        if not settings:
            # Varsayılan değerlerle oluştur
            settings = SystemSettings(
                system_currency="TRY",
                date_format="DD.MM.YYYY",
                # Güvenlik ayarları varsayılanları
                min_password_length=8,
                require_uppercase=True,
                require_lowercase=True,
                require_numbers=True,
                require_special_chars=True,
                # SMTP ayarları varsayılanları
                smtp_use_tls=True
            )
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
            
            # İlk finansal ayarları da oluştur (2024 için)
            self._create_default_financial_settings()
        
        return settings
    
    def _create_default_financial_settings(self):
        """Varsayılan finansal ayarları oluştur"""
        current_year = datetime.now().year
        default_financial = FinancialSettings(
            effective_year=current_year,
            effective_date=datetime(current_year, 1, 1),
            minimum_wage=17002.12,  # 2024 asgari ücret
            sgk_employee_rate=14.0,  # %14
            sgk_employer_rate=15.5,  # %15.5
            unemployment_insurance_rate=1.0,  # %1
            income_tax_brackets=[
                {
                    "min_amount": 0,
                    "max_amount": 110000,
                    "rate": 15,
                    "description": "İlk dilim %15"
                },
                {
                    "min_amount": 110000,
                    "max_amount": 230000,
                    "rate": 20,
                    "description": "İkinci dilim %20"
                },
                {
                    "min_amount": 230000,
                    "max_amount": 580000,
                    "rate": 27,
                    "description": "Üçüncü dilim %27"
                },
                {
                    "min_amount": 580000,
                    "max_amount": None,
                    "rate": 35,
                    "description": "Dördüncü dilim %35"
                }
            ],
            description=f"{current_year} Yılı Varsayılan Finansal Ayarları",
            created_by="system"
        )
        self.db.add(default_financial)
        self.db.commit()

    def update_company_info(self, data: CompanyInfoUpdate, updated_by: str) -> SystemSettings:
        """Kurum bilgilerini güncelle"""
        settings = self.get_or_create_settings()
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        settings.updated_by = updated_by
        
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def update_financial_settings(self, data: FinancialSettingsUpdate, updated_by: str) -> SystemSettings:
        """Finansal ayarları güncelle"""
        settings = self.get_or_create_settings()
        
        update_data = data.model_dump(exclude_unset=True)
        
        # income_tax_brackets'ı özel işle
        if 'income_tax_brackets' in update_data:
            brackets = update_data['income_tax_brackets']
            if brackets:
                # TaxBracket modellerini dict'e çevir
                brackets_dict = []
                for bracket in brackets:
                    if isinstance(bracket, TaxBracket):
                        brackets_dict.append(bracket.model_dump())
                    else:
                        brackets_dict.append(bracket)
                settings.income_tax_brackets = brackets_dict
            del update_data['income_tax_brackets']
        
        # Diğer alanları güncelle
        for key, value in update_data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        settings.updated_by = updated_by
        
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def get_current_tax_brackets(self) -> List[TaxBracket]:
        """Mevcut gelir vergisi dilimlerini getir"""
        financial_settings = self.get_current_financial_settings()
        if financial_settings and financial_settings.income_tax_brackets:
            return [TaxBracket(**bracket) for bracket in financial_settings.income_tax_brackets]
        return []

    def get_current_minimum_wage(self) -> float:
        """Mevcut asgari ücreti getir"""
        financial_settings = self.get_current_financial_settings()
        if financial_settings:
            return financial_settings.minimum_wage or 0.0
        return 0.0

    def get_current_sgk_rates(self) -> dict:
        """Mevcut SGK oranlarını getir"""
        financial_settings = self.get_current_financial_settings()
        if financial_settings:
            return {
                "employee_rate": financial_settings.sgk_employee_rate or 14.0,
                "employer_rate": financial_settings.sgk_employer_rate or 15.5,
                "unemployment_rate": financial_settings.unemployment_insurance_rate or 1.0
            }
        # Fallback
        return {
            "employee_rate": 14.0,
            "employer_rate": 15.5,
            "unemployment_rate": 1.0
        }

    # Tarihsel Finansal Ayarlar Metodları
    def create_financial_settings(self, data: FinancialSettingsCreate, created_by: str) -> FinancialSettings:
        """Yeni finansal ayarlar oluştur"""
        # Aynı yıl için mevcut ayarları pasifleştir
        existing = self.db.query(FinancialSettings).filter(
            FinancialSettings.effective_year == data.effective_year,
            FinancialSettings.is_active == True
        ).all()
        
        for setting in existing:
            setting.is_active = False
        
        # Yeni ayarları oluştur
        financial_settings = FinancialSettings(
            effective_year=data.effective_year,
            effective_date=data.effective_date,
            minimum_wage=data.minimum_wage,
            sgk_employee_rate=data.sgk_employee_rate,
            sgk_employer_rate=data.sgk_employer_rate,
            unemployment_insurance_rate=data.unemployment_insurance_rate,
            income_tax_brackets=[bracket.model_dump() for bracket in (data.income_tax_brackets or [])],
            description=data.description,
            created_by=created_by
        )
        
        self.db.add(financial_settings)
        self.db.commit()
        self.db.refresh(financial_settings)
        return financial_settings

    def get_current_financial_settings(self) -> Optional[FinancialSettings]:
        """Mevcut yıl için geçerli finansal ayarları getir"""
        current_year = datetime.now().year
        return self.db.query(FinancialSettings).filter(
            FinancialSettings.effective_year == current_year,
            FinancialSettings.is_active == True
        ).order_by(FinancialSettings.effective_date.desc()).first()

    def get_financial_settings_for_date(self, target_date: date) -> Optional[FinancialSettings]:
        """Belirli bir tarih için geçerli finansal ayarları getir"""
        target_year = target_date.year
        return self.db.query(FinancialSettings).filter(
            FinancialSettings.effective_year == target_year,
            FinancialSettings.effective_date <= target_date,
            FinancialSettings.is_active == True
        ).order_by(FinancialSettings.effective_date.desc()).first()

    def get_all_financial_settings(self) -> List[FinancialSettings]:
        """Tüm finansal ayarları getir (tarihsel görünüm için)"""
        return self.db.query(FinancialSettings).filter(
            FinancialSettings.is_active == True
        ).order_by(FinancialSettings.effective_year.desc(), FinancialSettings.effective_date.desc()).all()

    def update_security_settings(self, data: SecuritySettingsUpdate, updated_by: str) -> SystemSettings:
        """Güvenlik ayarlarını güncelle"""
        settings = self.get_or_create_settings()
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        settings.updated_by = updated_by
        
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def update_smtp_settings(self, data: SMTPSettingsUpdate, updated_by: str) -> SystemSettings:
        """SMTP ayarlarını güncelle"""
        settings = self.get_or_create_settings()
        
        update_data = data.model_dump(exclude_unset=True)
        
        # Şifreyi şifrele (basit örnek - production'da daha güvenli bir yöntem kullanılmalı)
        if 'smtp_password' in update_data and update_data['smtp_password']:
            # TODO: Gerçek şifreleme implementasyonu
            pass
        
        for key, value in update_data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        settings.updated_by = updated_by
        
        self.db.commit()
        self.db.refresh(settings)
        return settings 