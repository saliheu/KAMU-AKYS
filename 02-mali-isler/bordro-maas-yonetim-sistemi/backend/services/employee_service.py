from sqlalchemy.orm import Session
from typing import List, Optional
from models import Employee
from schemas import EmployeeCreate, EmployeeUpdate

class EmployeeService:
    def __init__(self, db: Session):
        self.db = db

    def create_employee(self, employee_data: EmployeeCreate) -> Employee:
        """Yeni çalışan oluştur"""
        # User_id benzersizlik kontrolü
        if employee_data.user_id:
            existing_employee_with_user = self.db.query(Employee).filter(
                Employee.user_id == employee_data.user_id
            ).first()
            if existing_employee_with_user:
                raise ValueError(f"User ID {employee_data.user_id} zaten başka bir çalışan tarafından kullanılıyor")
        
        db_employee = Employee(**employee_data.model_dump())
        self.db.add(db_employee)
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee

    def get_employee(self, employee_id: int) -> Optional[Employee]:
        """ID'ye göre çalışan getir"""
        return self.db.query(Employee).filter(Employee.id == employee_id).first()

    def get_employee_by_national_id(self, national_id: str) -> Optional[Employee]:
        """TC Kimlik No'ya göre çalışan getir"""
        return self.db.query(Employee).filter(Employee.national_id == national_id).first()

    def get_employees(self, skip: int = 0, limit: int = 100, include_inactive: bool = False) -> List[Employee]:
        """Çalışanları listele (varsayılan: sadece aktif olanlar)"""
        query = self.db.query(Employee)
        if not include_inactive:
            query = query.filter(Employee.is_active == True)
        return query.offset(skip).limit(limit).all()
    
    def get_employee_by_user_id(self, user_id: int, include_inactive: bool = False) -> Optional[Employee]:
        """User ID'ye göre çalışan getir"""
        query = self.db.query(Employee).filter(Employee.user_id == user_id)
        if not include_inactive:
            query = query.filter(Employee.is_active == True)
        return query.first()
    
    def get_employee_by_id_and_user(self, employee_id: int, user_id: int, user_role: str, include_inactive: bool = False) -> Optional[Employee]:
        """Employee'yi user yetkisine göre getir"""
        query = self.db.query(Employee).filter(Employee.id == employee_id)
        if not include_inactive:
            query = query.filter(Employee.is_active == True)
        
        # Employee ise sadece kendi bilgisini görebilir
        if user_role == "employee":
            # user_id ile eşleşen employee'yi kontrol et
            employee = self.get_employee_by_user_id(user_id, include_inactive)
            if employee and employee.id == employee_id:
                return employee
            else:
                return None
        
        return query.first()
    
    def get_employees_for_user(self, user_id: int, user_role: str, skip: int = 0, limit: int = 100, include_inactive: bool = False) -> List[Employee]:
        """Kullanıcı rolüne göre employee listesi getir"""
        if user_role == "admin":
            # Admin tüm employee'leri görebilir
            return self.get_employees(skip, limit, include_inactive)
        elif user_role == "employee":
            # Employee sadece kendi bilgisini görebilir
            employee = self.get_employee_by_user_id(user_id, include_inactive)
            return [employee] if employee else []
        else:
            return []

    def update_employee(self, employee_id: int, employee_data: EmployeeUpdate) -> Optional[Employee]:
        """Çalışan bilgilerini güncelle"""
        db_employee = self.get_employee(employee_id)
        if not db_employee:
            return None
        
        update_data = employee_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_employee, key, value)
        
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee

    def delete_employee(self, employee_id: int) -> bool:
        """Çalışanı soft delete ile pasifleştir"""
        db_employee = self.get_employee(employee_id)
        if not db_employee:
            return False
        
        db_employee.is_active = False
        self.db.commit()
        return True

    def get_employees_count(self, include_inactive: bool = False) -> int:
        """Toplam çalışan sayısı"""
        query = self.db.query(Employee)
        if not include_inactive:
            query = query.filter(Employee.is_active == True)
        return query.count()
    
    def get_estimated_monthly_budget(self) -> float:
        """Aktif çalışanların brüt maaşları toplamından aylık tahmini bütçe hesapla"""
        from sqlalchemy import func
        
        result = self.db.query(func.sum(Employee.gross_salary)).filter(
            Employee.is_active == True
        ).scalar()
        
        return float(result or 0.0) 