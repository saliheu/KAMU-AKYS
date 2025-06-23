from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.database import get_db
from app.models.maintenance import Maintenance
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, Maintenance as MaintenanceSchema
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[MaintenanceSchema])
def get_maintenance_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    vehicle_id: Optional[int] = None,
    maintenance_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Maintenance)
    
    if vehicle_id:
        query = query.filter(Maintenance.vehicle_id == vehicle_id)
    if maintenance_type:
        query = query.filter(Maintenance.maintenance_type == maintenance_type)
    if start_date:
        query = query.filter(Maintenance.service_date >= start_date)
    if end_date:
        query = query.filter(Maintenance.service_date <= end_date)
    
    records = query.order_by(Maintenance.service_date.desc()).offset(skip).limit(limit).all()
    return records

@router.get("/{maintenance_id}", response_model=MaintenanceSchema)
def get_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record

@router.post("/", response_model=MaintenanceSchema)
def create_maintenance_record(
    maintenance: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == maintenance.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_maintenance = Maintenance(**maintenance.dict(), created_by=current_user.id)
    
    if maintenance.km_at_service and maintenance.km_at_service > vehicle.current_km:
        vehicle.current_km = maintenance.km_at_service
    
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    
    return db_maintenance

@router.put("/{maintenance_id}", response_model=MaintenanceSchema)
def update_maintenance_record(
    maintenance_id: int,
    maintenance_update: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    update_data = maintenance_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)
    
    db.commit()
    db.refresh(record)
    
    return record

@router.delete("/{maintenance_id}")
def delete_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    db.delete(record)
    db.commit()
    
    return {"message": "Maintenance record deleted successfully"}

@router.get("/upcoming/", response_model=List[MaintenanceSchema])
def get_upcoming_maintenance(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import timedelta
    upcoming_date = datetime.now() + timedelta(days=days)
    
    records = db.query(Maintenance).filter(
        Maintenance.next_service_date <= upcoming_date,
        Maintenance.next_service_date >= datetime.now()
    ).order_by(Maintenance.next_service_date).all()
    
    return records