from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from models import Payroll, Employee, PayrollStatus
from schemas import PayrollCreate, PayrollCalculated, PayrollUpdate, PayrollSummary, RecentActivity, TaxBracket
from services.employee_service import EmployeeService
from services.settings_service import SettingsService

class PayrollService:
    def __init__(self, db: Session):
        self.db = db
        self.employee_service = EmployeeService(db)
        self.settings_service = SettingsService(db)

    def calculate_payroll(self, gross_salary: float, payroll_date: date = None) -> PayrollCalculated:
        """Bordro hesaplaması yap - Sistem ayarlarından değerleri okuyarak"""
        deductions = {}
        
        # Tarihsel ayarları al
        if payroll_date:
            financial_settings = self.settings_service.get_financial_settings_for_date(payroll_date)
        else:
            financial_settings = self.settings_service.get_current_financial_settings()
        
        if financial_settings:
            sgk_rates = {
                "employee_rate": financial_settings.sgk_employee_rate or 14.0,
                "employer_rate": financial_settings.sgk_employer_rate or 15.5,
                "unemployment_rate": financial_settings.unemployment_insurance_rate or 1.0
            }
            tax_brackets = [TaxBracket(**bracket) for bracket in (financial_settings.income_tax_brackets or [])]
        else:
            # Fallback değerler
            sgk_rates = {"employee_rate": 14.0, "employer_rate": 15.5, "unemployment_rate": 1.0}
            tax_brackets = []
        
        # Gelir Vergisi (Kademeli Vergi Sistemi)
        income_tax, effective_rate = self._calculate_income_tax(gross_salary, tax_brackets)
        deductions["gelir_vergisi"] = {
            "oran": round(effective_rate, 2),
            "tutar": round(income_tax, 2)
        }
        
        # SGK Primi (Çalışan)
        sgk_rate = sgk_rates["employee_rate"]
        sgk_premium = gross_salary * (sgk_rate / 100)
        deductions["sgk_primi"] = {
            "oran": sgk_rate,
            "tutar": round(sgk_premium, 2)
        }
        
        # İşsizlik Sigortası
        unemployment_rate = sgk_rates["unemployment_rate"]
        unemployment_insurance = gross_salary * (unemployment_rate / 100)
        deductions["issizlik_sigortasi"] = {
            "oran": unemployment_rate,
            "tutar": round(unemployment_insurance, 2)
        }
        
        # Toplam kesinti
        total_deductions = income_tax + sgk_premium + unemployment_insurance
        deductions["toplam_kesinti"] = round(total_deductions, 2)
        
        # Net maaş
        net_salary = gross_salary - total_deductions
        
        return PayrollCalculated(
            gross_salary=gross_salary,
            deductions=deductions,
            net_salary=round(net_salary, 2)
        )
    
    def _calculate_income_tax(self, gross_salary: float, tax_brackets: List) -> tuple:
        """Kademeli gelir vergisi hesaplama"""
        if not tax_brackets:
            # Fallback: Eğer vergi dilimi yoksa %15 sabit oran kullan
            return gross_salary * 0.15, 15.0
        
        total_tax = 0.0
        remaining_amount = gross_salary
        
        for bracket in tax_brackets:
            min_amount = bracket.min_amount
            max_amount = bracket.max_amount if bracket.max_amount else float('inf')
            rate = bracket.rate / 100
            
            if remaining_amount <= 0:
                break
            
            # Bu dilime düşen miktar
            taxable_in_bracket = min(remaining_amount, max_amount - min_amount)
            
            if taxable_in_bracket > 0:
                tax_in_bracket = taxable_in_bracket * rate
                total_tax += tax_in_bracket
                remaining_amount -= taxable_in_bracket
        
        # Efektif vergi oranı
        effective_rate = (total_tax / gross_salary * 100) if gross_salary > 0 else 0
        
        return total_tax, effective_rate

    def create_payroll(self, payroll_data: PayrollCreate) -> Optional[Payroll]:
        """Yeni bordro oluştur"""
        # Çalışanın varlığını kontrol et
        employee = self.employee_service.get_employee(payroll_data.employee_id)
        if not employee:
            return None
        
        # Aynı dönem için bordro olup olmadığını kontrol et
        existing_payroll = self.db.query(Payroll).filter(
            Payroll.employee_id == payroll_data.employee_id,
            Payroll.pay_period_start == payroll_data.pay_period_start,
            Payroll.pay_period_end == payroll_data.pay_period_end
        ).first()
        
        if existing_payroll:
            return None  # Aynı dönem için bordro zaten var
        
        # Bordro hesaplaması (tarihe göre)
        payroll_start_date = payroll_data.pay_period_start.date() if isinstance(payroll_data.pay_period_start, datetime) else payroll_data.pay_period_start
        calculated = self.calculate_payroll(employee.gross_salary, payroll_start_date)
        
        # Bordro oluştur
        db_payroll = Payroll(
            employee_id=payroll_data.employee_id,
            pay_period_start=payroll_data.pay_period_start,
            pay_period_end=payroll_data.pay_period_end,
            gross_salary=calculated.gross_salary,
            deductions=calculated.deductions,
            net_salary=calculated.net_salary,
            status=PayrollStatus.DRAFT  # Varsayılan olarak taslak
        )
        
        self.db.add(db_payroll)
        self.db.commit()
        self.db.refresh(db_payroll)
        return db_payroll

    def update_payroll_status(self, payroll_id: int, payroll_update: PayrollUpdate) -> Optional[Payroll]:
        """Bordro durumunu güncelle"""
        db_payroll = self.db.query(Payroll).filter(Payroll.id == payroll_id).first()
        if not db_payroll:
            return None
        
        if payroll_update.status:
            db_payroll.status = payroll_update.status
        
        self.db.commit()
        self.db.refresh(db_payroll)
        return db_payroll

    def delete_payroll(self, payroll_id: int) -> bool:
        """Bordro kaydını tamamen sil"""
        db_payroll = self.db.query(Payroll).filter(Payroll.id == payroll_id).first()
        if not db_payroll:
            return False
        
        # Sadece DRAFT veya CANCELLED statüsündeki bordroları silebilir
        if db_payroll.status not in [PayrollStatus.DRAFT, PayrollStatus.CANCELLED]:
            return False
        
        self.db.delete(db_payroll)
        self.db.commit()
        return True

    def get_payroll(self, payroll_id: int) -> Optional[Payroll]:
        """ID'ye göre bordro getir"""
        return self.db.query(Payroll).filter(Payroll.id == payroll_id).first()

    def get_payrolls(self, skip: int = 0, limit: int = 100) -> List[Payroll]:
        """Tüm bordroları listele (admin için)"""
        return self.db.query(Payroll).offset(skip).limit(limit).all()

    def get_payrolls_summary(
        self, 
        include_inactive: bool = False,
        employee_search: str = None,
        status_filter: PayrollStatus = None,
        date_start: date = None,
        date_end: date = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[PayrollSummary]:
        """Bordro özet listesi (filtreleme ile)"""
        from sqlalchemy import and_, or_
        
        query = self.db.query(
            Payroll.id,
            (Employee.first_name + ' ' + Employee.last_name).label('employee_full_name'),
            Employee.is_active.label('employee_is_active'),
            Payroll.pay_period_start,
            Payroll.pay_period_end,
            Payroll.gross_salary,
            Payroll.net_salary,
            Payroll.status,
            Payroll.created_at
        ).join(Employee, Payroll.employee_id == Employee.id)
        
        # Aktif çalışan filtreleme
        if not include_inactive:
            query = query.filter(Employee.is_active == True)
        
        # Çalışan adı arama
        if employee_search:
            search_pattern = f"%{employee_search}%"
            query = query.filter(
                or_(
                    Employee.first_name.ilike(search_pattern),
                    Employee.last_name.ilike(search_pattern),
                    (Employee.first_name + ' ' + Employee.last_name).ilike(search_pattern)
                )
            )
        
        # Durum filtreleme
        if status_filter:
            query = query.filter(Payroll.status == status_filter)
        
        # Tarih aralığı filtreleme
        if date_start:
            query = query.filter(Payroll.pay_period_start >= date_start)
        if date_end:
            query = query.filter(Payroll.pay_period_end <= date_end)
        
        query = query.order_by(Payroll.created_at.desc())
        results = query.offset(skip).limit(limit).all()
        
        return [
            PayrollSummary(
                id=r.id,
                employee_full_name=r.employee_full_name,
                employee_is_active=r.employee_is_active,
                pay_period_start=r.pay_period_start,
                pay_period_end=r.pay_period_end,
                gross_salary=r.gross_salary,
                net_salary=r.net_salary,
                status=r.status,
                created_at=r.created_at
            ) for r in results
        ]

    def get_payrolls_by_user_id(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Payroll]:
        """Belirli bir user_id'ye ait bordroları getir (employee için)"""
        # Önce user_id'ye karşılık gelen employee'yi bul
        employee = self.db.query(Employee).filter(Employee.user_id == user_id).first()
        if not employee:
            return []
        
        return self.db.query(Payroll).filter(
            Payroll.employee_id == employee.id
        ).offset(skip).limit(limit).all()

    def get_employee_payrolls(self, employee_id: int) -> List[Payroll]:
        """Bir çalışanın tüm bordrolarını getir"""
        return self.db.query(Payroll).filter(
            Payroll.employee_id == employee_id
        ).order_by(Payroll.pay_period_start.desc()).all()
    
    def get_payroll_by_id_and_user(self, payroll_id: int, user_id: int, user_role: str) -> Optional[Payroll]:
        """Payroll'u user yetkisine göre getir"""
        query = self.db.query(Payroll).filter(Payroll.id == payroll_id)
        
        # Employee ise sadece kendi bordrolarını görebilir
        if user_role == "employee":
            # Önce user_id'ye karşılık gelen employee'yi bul
            employee = self.db.query(Employee).filter(Employee.user_id == user_id).first()
            if employee:
                query = query.filter(Payroll.employee_id == employee.id)
            else:
                return None
        
        return query.first()

    def get_payrolls_count(self) -> int:
        """Toplam bordro sayısı"""
        return self.db.query(Payroll).count()

    def get_current_month_payrolls_count(self) -> int:
        """Bu ay oluşturulan bordro sayısı"""
        current_month = datetime.now().date().replace(day=1)
        return self.db.query(Payroll).filter(
            Payroll.created_at >= current_month
        ).count()

    def get_total_gross_salary(self) -> float:
        """Toplam brüt maaş"""
        from sqlalchemy import func
        result = self.db.query(func.sum(Payroll.gross_salary)).scalar()
        return float(result or 0.0)

    def get_total_net_salary(self) -> float:
        """Toplam net maaş"""
        from sqlalchemy import func
        result = self.db.query(func.sum(Payroll.net_salary)).scalar()
        return float(result or 0.0)
    
    def get_current_month_total_net_salary(self) -> float:
        """Bu ayın toplam net maaş tutarı (ödenen bordrolar)"""
        from sqlalchemy import func
        from datetime import datetime
        
        # Bu ayın başlangıcı
        current_date = datetime.now().date()
        current_month_start = current_date.replace(day=1)
        
        # Bu ay içinde oluşturulan ve PAID statusündeki bordroların net maaş toplamı
        result = self.db.query(func.sum(Payroll.net_salary)).filter(
            Payroll.created_at >= current_month_start,
            Payroll.status == PayrollStatus.PAID  # Sadece ödenen bordrolar
        ).scalar()
        
        return float(result or 0.0)
    
    def get_recent_activities(self, limit: int = 10) -> List[RecentActivity]:
        """Son işlemleri getir"""
        # Tüm aktiviteleri datetime ile birlikte tutacağız
        all_activities = []
        
        # Son bordro işlemleri
        recent_payrolls = self.db.query(Payroll).order_by(
            Payroll.created_at.desc()
        ).limit(limit).all()
        
        for payroll in recent_payrolls:
            all_activities.append({
                'activity': RecentActivity(
                    key=f"payroll_{payroll.id}",
                    action="Bordro Oluşturuldu",
                    details=f"{payroll.employee.first_name} {payroll.employee.last_name}",
                    time=self._format_time(payroll.created_at),
                    type="payroll"
                ),
                'datetime': payroll.created_at
            })
        
        # Son çalışan kayıtları
        recent_employees = self.db.query(Employee).order_by(
            Employee.created_at.desc()
        ).limit(limit).all()
        
        for employee in recent_employees:
            all_activities.append({
                'activity': RecentActivity(
                    key=f"employee_{employee.id}",
                    action="Çalışan Eklendi",
                    details=f"{employee.first_name} {employee.last_name} - {employee.title}",
                    time=self._format_time(employee.created_at),
                    type="employee"
                ),
                'datetime': employee.created_at
            })
        
        # Eğer hiç aktivite yoksa sistem mesajları ekle
        if not all_activities:
            now = datetime.now()
            all_activities = [
                {
                    'activity': RecentActivity(
                        key="system_1",
                        action="Sistem Başlatıldı",
                        details="Bordro ve maaş yönetim sistemi aktif",
                        time="Bugün",
                        type="system"
                    ),
                    'datetime': now
                }
            ]
        
        # Tarihe göre sırala
        all_activities.sort(key=lambda x: x['datetime'], reverse=True)
        
        # Sadece activity objelerini döndür, limit kadar
        return [item['activity'] for item in all_activities[:limit]]
    
    def _format_time(self, dt: datetime) -> str:
        """Zamanı kullanıcı dostu formatta göster"""
        now = datetime.now()
        diff = now - dt
        
        if diff.days == 0:
            if diff.seconds < 3600:  # 1 saat
                minutes = diff.seconds // 60
                return f"{minutes} dakika önce" if minutes > 0 else "Az önce"
            else:
                hours = diff.seconds // 3600
                return f"{hours} saat önce"
        elif diff.days == 1:
            return "Dün"
        elif diff.days < 7:
            return f"{diff.days} gün önce"
        else:
            return dt.strftime("%d.%m.%Y") 