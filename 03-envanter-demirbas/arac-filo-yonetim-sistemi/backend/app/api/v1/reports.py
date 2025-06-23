from datetime import timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from datetime import date, datetime
import calendar

from app.database import get_db
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.driver import Driver
from app.models.maintenance import Maintenance
from app.models.fuel import FuelRecord
from app.models.user import User
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_vehicles = db.query(Vehicle).filter(Vehicle.is_active == True).count()
    active_vehicles = db.query(Vehicle).filter(
        Vehicle.status == VehicleStatus.ACTIVE,
        Vehicle.is_active == True
    ).count()
    maintenance_vehicles = db.query(Vehicle).filter(
        Vehicle.status == VehicleStatus.MAINTENANCE,
        Vehicle.is_active == True
    ).count()
    
    total_drivers = db.query(Driver).filter(Driver.is_active == True).count()
    
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    monthly_fuel_cost = db.query(func.sum(FuelRecord.total_cost)).filter(
        extract('month', FuelRecord.fuel_date) == current_month,
        extract('year', FuelRecord.fuel_date) == current_year
    ).scalar() or 0
    
    monthly_maintenance_cost = db.query(func.sum(Maintenance.cost)).filter(
        extract('month', Maintenance.service_date) == current_month,
        extract('year', Maintenance.service_date) == current_year
    ).scalar() or 0
    
    upcoming_maintenance = db.query(Maintenance).filter(
        Maintenance.next_service_date >= datetime.now(),
        Maintenance.next_service_date <= datetime.now().replace(day=28) + timedelta(days=30)
    ).count()
    
    return {
        "total_vehicles": total_vehicles,
        "active_vehicles": active_vehicles,
        "maintenance_vehicles": maintenance_vehicles,
        "total_drivers": total_drivers,
        "monthly_fuel_cost": monthly_fuel_cost,
        "monthly_maintenance_cost": monthly_maintenance_cost,
        "upcoming_maintenance": upcoming_maintenance,
        "total_monthly_cost": monthly_fuel_cost + monthly_maintenance_cost
    }

@router.get("/vehicle-utilization")
def get_vehicle_utilization_report(
    start_date: date,
    end_date: date,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(
        Vehicle.id,
        Vehicle.plate_number,
        Vehicle.brand,
        Vehicle.model,
        Vehicle.department,
        func.count(FuelRecord.id).label("fuel_entries"),
        func.sum(FuelRecord.liters).label("total_fuel"),
        func.max(FuelRecord.km_at_fueling).label("max_km"),
        func.min(FuelRecord.km_at_fueling).label("min_km")
    ).outerjoin(FuelRecord, Vehicle.id == FuelRecord.vehicle_id).filter(
        Vehicle.is_active == True,
        FuelRecord.fuel_date >= start_date,
        FuelRecord.fuel_date <= end_date
    ).group_by(Vehicle.id)
    
    if department:
        query = query.filter(Vehicle.department == department)
    
    results = query.all()
    
    report = []
    for result in results:
        km_driven = (result.max_km - result.min_km) if result.max_km and result.min_km else 0
        fuel_efficiency = (result.total_fuel / km_driven * 100) if km_driven > 0 and result.total_fuel else 0
        
        report.append({
            "vehicle_id": result.id,
            "plate_number": result.plate_number,
            "vehicle": f"{result.brand} {result.model}",
            "department": result.department,
            "km_driven": km_driven,
            "total_fuel": result.total_fuel or 0,
            "fuel_entries": result.fuel_entries,
            "fuel_efficiency": round(fuel_efficiency, 2)
        })
    
    return report

@router.get("/cost-analysis")
def get_cost_analysis_report(
    year: int = Query(datetime.now().year),
    vehicle_id: Optional[int] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    months = []
    
    for month in range(1, 13):
        fuel_query = db.query(func.sum(FuelRecord.total_cost)).filter(
            extract('month', FuelRecord.fuel_date) == month,
            extract('year', FuelRecord.fuel_date) == year
        )
        
        maintenance_query = db.query(func.sum(Maintenance.cost)).filter(
            extract('month', Maintenance.service_date) == month,
            extract('year', Maintenance.service_date) == year
        )
        
        if vehicle_id:
            fuel_query = fuel_query.filter(FuelRecord.vehicle_id == vehicle_id)
            maintenance_query = maintenance_query.filter(Maintenance.vehicle_id == vehicle_id)
        
        if department:
            vehicle_ids = db.query(Vehicle.id).filter(Vehicle.department == department).subquery()
            fuel_query = fuel_query.filter(FuelRecord.vehicle_id.in_(vehicle_ids))
            maintenance_query = maintenance_query.filter(Maintenance.vehicle_id.in_(vehicle_ids))
        
        fuel_cost = fuel_query.scalar() or 0
        maintenance_cost = maintenance_query.scalar() or 0
        
        months.append({
            "month": calendar.month_name[month],
            "fuel_cost": fuel_cost,
            "maintenance_cost": maintenance_cost,
            "total_cost": fuel_cost + maintenance_cost
        })
    
    total_fuel = sum(m["fuel_cost"] for m in months)
    total_maintenance = sum(m["maintenance_cost"] for m in months)
    
    return {
        "year": year,
        "months": months,
        "annual_summary": {
            "total_fuel_cost": total_fuel,
            "total_maintenance_cost": total_maintenance,
            "total_cost": total_fuel + total_maintenance
        }
    }

@router.get("/driver-performance")
def get_driver_performance_report(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import timedelta
    
    results = db.query(
        Driver.id,
        Driver.first_name,
        Driver.last_name,
        Driver.department,
        func.count(FuelRecord.id).label("fuel_entries"),
        func.sum(FuelRecord.liters).label("total_fuel"),
        func.sum(FuelRecord.total_cost).label("total_fuel_cost")
    ).outerjoin(FuelRecord, Driver.id == FuelRecord.driver_id).filter(
        Driver.is_active == True,
        FuelRecord.fuel_date >= start_date,
        FuelRecord.fuel_date <= end_date
    ).group_by(Driver.id).all()
    
    report = []
    for result in results:
        report.append({
            "driver_id": result.id,
            "driver_name": f"{result.first_name} {result.last_name}",
            "department": result.department,
            "fuel_entries": result.fuel_entries,
            "total_fuel": result.total_fuel or 0,
            "total_fuel_cost": result.total_fuel_cost or 0,
            "avg_fuel_per_entry": (result.total_fuel / result.fuel_entries) if result.fuel_entries > 0 else 0
        })
    
    return sorted(report, key=lambda x: x["total_fuel_cost"], reverse=True)