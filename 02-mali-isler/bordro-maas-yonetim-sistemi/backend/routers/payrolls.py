from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from services.payroll_service import PayrollService
from services.employee_service import EmployeeService
from schemas import (
    Payroll, PayrollCreate, PayrollSummary, PayrollUpdate, PayrollStatus,
    PayrollCalculated, DashboardStats, RecentActivity
)
from auth import get_current_user, require_admin, require_employee_or_admin, TokenData

router = APIRouter()

@router.post("/", response_model=Payroll, status_code=status.HTTP_201_CREATED)
async def create_payroll(
    payroll_data: PayrollCreate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Yeni bordro oluştur (sadece admin)"""
    service = PayrollService(db)
    payroll = service.create_payroll(payroll_data)
    
    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bordro oluşturulamadı. Çalışan bulunamadı veya aynı dönem için bordro zaten mevcut."
        )
    
    return payroll

@router.get("/summary", response_model=List[PayrollSummary])
async def get_payrolls_summary(
    include_inactive: bool = Query(False, description="Pasif çalışanları dahil et"),
    employee_search: Optional[str] = Query(None, description="Çalışan adı arama"),
    status_filter: Optional[PayrollStatus] = Query(None, description="Durum filtreleme"),
    date_start: Optional[date] = Query(None, description="Başlangıç tarihi"),
    date_end: Optional[date] = Query(None, description="Bitiş tarihi"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: TokenData = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """Filtrelenebilir bordro özet listesi"""
    service = PayrollService(db)
    
    if current_user.role == "admin":
        # Admin tüm bordroları filtreleyebilir
        return service.get_payrolls_summary(
            include_inactive=include_inactive,
            employee_search=employee_search,
            status_filter=status_filter,
            date_start=date_start,
            date_end=date_end,
            skip=skip,
            limit=limit
        )
    else:
        # Employee sadece kendi bordrolarını görebilir
        employee_service = EmployeeService(db)
        employee = employee_service.get_employee_by_user_id(current_user.user_id)
        if not employee:
            return []
        
        payrolls = service.get_payrolls_by_user_id(current_user.user_id, skip=skip, limit=limit)
        return [
            PayrollSummary(
                id=payroll.id,
                employee_full_name=f"{payroll.employee.first_name} {payroll.employee.last_name}",
                employee_is_active=payroll.employee.is_active,
                pay_period_start=payroll.pay_period_start,
                pay_period_end=payroll.pay_period_end,
                gross_salary=payroll.gross_salary,
                net_salary=payroll.net_salary,
                status=payroll.status,
                created_at=payroll.created_at
            ) for payroll in payrolls
        ]

@router.put("/{payroll_id}/status", response_model=Payroll)
async def update_payroll_status(
    payroll_id: int,
    payroll_update: PayrollUpdate,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Bordro durumunu güncelle (sadece admin)"""
    service = PayrollService(db)
    payroll = service.update_payroll_status(payroll_id, payroll_update)
    
    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bordro bulunamadı"
        )
    
    return payroll

@router.delete("/{payroll_id}")
async def delete_payroll(
    payroll_id: int,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Bordro kaydını sil (sadece admin) - Sadece DRAFT veya CANCELLED statüsündeki bordrolar silinebilir"""
    service = PayrollService(db)
    
    # Önce bordronun varlığını ve durumunu kontrol et
    payroll = service.get_payroll(payroll_id)
    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bordro bulunamadı"
        )
    
    # Sadece DRAFT veya CANCELLED statüsündeki bordroları silebilir
    if payroll.status not in [PayrollStatus.DRAFT, PayrollStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sadece 'Taslak' veya 'İptal Edildi' statüsündeki bordrolar silinebilir"
        )
    
    success = service.delete_payroll(payroll_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bordro silinemedi"
        )
    
    return {"message": "Bordro başarıyla silindi", "payroll_id": payroll_id}

@router.get("/", response_model=List[PayrollSummary])
async def get_payrolls(
    skip: int = 0,
    limit: int = 100,
    current_user: TokenData = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """Bordroları listele (admin: tümü, employee: sadece kendisininki)"""
    service = PayrollService(db)
    
    if current_user.role == "admin":
        payrolls = service.get_payrolls(skip=skip, limit=limit)
    else:  # employee
        payrolls = service.get_payrolls_by_user_id(current_user.user_id, skip=skip, limit=limit)
    
    # Summary formatına çevir
    summaries = []
    for payroll in payrolls:
        summaries.append(PayrollSummary(
            id=payroll.id,
            employee_full_name=f"{payroll.employee.first_name} {payroll.employee.last_name}",
            employee_is_active=payroll.employee.is_active,
            pay_period_start=payroll.pay_period_start,
            pay_period_end=payroll.pay_period_end,
            gross_salary=payroll.gross_salary,
            net_salary=payroll.net_salary,
            status=payroll.status,
            created_at=payroll.created_at
        ))
    
    return summaries

@router.get("/{payroll_id}", response_model=Payroll)
async def get_payroll(
    payroll_id: int,
    current_user: TokenData = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """ID'ye göre bordro getir (admin: herkes, employee: sadece kendisininki)"""
    service = PayrollService(db)
    payroll = service.get_payroll_by_id_and_user(
        payroll_id, current_user.user_id, current_user.role
    )
    
    if not payroll:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bordro bulunamadı veya erişim yetkiniz yok"
        )
    
    return payroll

@router.get("/employee/{employee_id}", response_model=List[Payroll])
async def get_employee_payrolls(
    employee_id: int,
    current_user: TokenData = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """Bir çalışanın tüm bordrolarını getir (admin: herkes, employee: sadece kendisininki)"""
    service = PayrollService(db)
    
    # Employee sadece kendi bordrolarını görebilir
    if current_user.role == "employee":
        # user_id'ye karşılık gelen employee'yi bul
        employee_service = EmployeeService(db)
        employee = employee_service.get_employee_by_user_id(current_user.user_id)
        if not employee or employee.id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sadece kendi bordrolarınızı görüntüleyebilirsiniz"
            )
    
    payrolls = service.get_employee_payrolls(employee_id)
    return payrolls

@router.post("/calculate", response_model=PayrollCalculated)
async def calculate_payroll(
    gross_salary: float,
    current_user: TokenData = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Bordro hesaplaması yap (preview için) (sadece admin)"""
    if gross_salary <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Brüt maaş 0'dan büyük olmalıdır"
        )
    
    service = PayrollService(db)
    return service.calculate_payroll(gross_salary)

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: TokenData = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """Dashboard istatistikleri (rol bazlı)"""
    payroll_service = PayrollService(db)
    employee_service = EmployeeService(db)
    
    if current_user.role == "admin":
        # Admin için tüm sistem istatistikleri
        estimated_monthly_budget = employee_service.get_estimated_monthly_budget()
        current_month_net_salary = payroll_service.get_current_month_total_net_salary()
        
        # Bütçe kullanım oranını hesapla
        budget_usage_percent = 0.0
        if estimated_monthly_budget > 0:
            budget_usage_percent = min((current_month_net_salary / estimated_monthly_budget) * 100, 100.0)
        
        return DashboardStats(
            total_employees=employee_service.get_employees_count(),
            total_payrolls=payroll_service.get_payrolls_count(),
            current_month_payrolls=payroll_service.get_current_month_payrolls_count(),
            total_gross_salary=payroll_service.get_total_gross_salary(),
            total_net_salary=payroll_service.get_total_net_salary(),
            current_month_net_salary=current_month_net_salary,
            estimated_monthly_budget=estimated_monthly_budget,
            budget_usage_percent=budget_usage_percent
        )
    else:
        # Employee için kendi istatistikleri
        employee = employee_service.get_employee_by_user_id(current_user.user_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee profili bulunamadı"
            )
        
        employee_payrolls = payroll_service.get_employee_payrolls(employee.id)
        total_gross = sum(p.gross_salary for p in employee_payrolls)
        total_net = sum(p.net_salary for p in employee_payrolls)
        
        from datetime import datetime
        current_month = datetime.now().month
        current_year = datetime.now().year
        current_month_payrolls = len([
            p for p in employee_payrolls 
            if p.created_at.month == current_month and p.created_at.year == current_year
        ])
        
        # Employee için basit bütçe hesaplama (kendi maaşına göre)
        estimated_monthly_budget = employee.gross_salary if employee else 0.0
        
        # Bu ay ki bordrolarının net maaş toplamı
        current_month_net = sum(
            p.net_salary for p in employee_payrolls 
            if p.created_at.month == current_month and p.created_at.year == current_year and p.status.value == "PAID"
        )
        
        budget_usage_percent = 0.0
        if estimated_monthly_budget > 0 and current_month_net > 0:
            budget_usage_percent = min((current_month_net / estimated_monthly_budget) * 100, 100.0)
        
        return DashboardStats(
            total_employees=1,  # Sadece kendisi
            total_payrolls=len(employee_payrolls),
            current_month_payrolls=current_month_payrolls,
            total_gross_salary=total_gross,
            total_net_salary=total_net,
            current_month_net_salary=current_month_net,
            estimated_monthly_budget=estimated_monthly_budget,
            budget_usage_percent=budget_usage_percent
        )

@router.get("/dashboard/activities", response_model=List[RecentActivity])
async def get_recent_activities(
    limit: int = 10,
    current_user: TokenData = Depends(require_employee_or_admin),
    db: Session = Depends(get_db)
):
    """Son işlemleri getir (rol bazlı)"""
    service = PayrollService(db)
    
    if current_user.role == "admin":
        # Admin için tüm sistem aktiviteleri
        return service.get_recent_activities(limit)
    else:
        # Employee için sadece kendi aktiviteleri
        employee_service = EmployeeService(db)
        employee = employee_service.get_employee_by_user_id(current_user.user_id)
        if not employee:
            return []
        
        # Sadece kendi payroll aktivitelerini göster
        from schemas import RecentActivity
        employee_payrolls = service.get_employee_payrolls(employee.id)
        activities = []
        
        for payroll in employee_payrolls[:limit]:
            activities.append(RecentActivity(
                key=f"payroll_{payroll.id}",
                action="Bordro Oluşturuldu",
                details=f"{employee.first_name} {employee.last_name}",
                time=service._format_time(payroll.created_at),
                type="payroll"
            ))
        
        return activities 