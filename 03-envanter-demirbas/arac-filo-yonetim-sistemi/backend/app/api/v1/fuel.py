from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from sqlalchemy import func

from app.database import get_db
from app.models.fuel import FuelRecord
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.fuel import FuelRecordCreate, FuelRecordUpdate, FuelRecord as FuelRecordSchema
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[FuelRecordSchema])
def get_fuel_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    vehicle_id: Optional[int] = None,
    driver_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FuelRecord)
    
    if vehicle_id:
        query = query.filter(FuelRecord.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(FuelRecord.driver_id == driver_id)
    if start_date:
        query = query.filter(FuelRecord.fuel_date >= start_date)
    if end_date:
        query = query.filter(FuelRecord.fuel_date <= end_date)
    
    records = query.order_by(FuelRecord.fuel_date.desc()).offset(skip).limit(limit).all()
    return records

@router.get("/{fuel_record_id}", response_model=FuelRecordSchema)
def get_fuel_record(
    fuel_record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(FuelRecord).filter(FuelRecord.id == fuel_record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Fuel record not found")
    return record

@router.post("/", response_model=FuelRecordSchema)
def create_fuel_record(
    fuel_record: FuelRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == fuel_record.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_fuel_record = FuelRecord(**fuel_record.dict(), created_by=current_user.id)
    
    if fuel_record.km_at_fueling > vehicle.current_km:
        vehicle.current_km = fuel_record.km_at_fueling
    
    db.add(db_fuel_record)
    db.commit()
    db.refresh(db_fuel_record)
    
    return db_fuel_record

@router.put("/{fuel_record_id}", response_model=FuelRecordSchema)
def update_fuel_record(
    fuel_record_id: int,
    fuel_record_update: FuelRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(FuelRecord).filter(FuelRecord.id == fuel_record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Fuel record not found")
    
    update_data = fuel_record_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)
    
    db.commit()
    db.refresh(record)
    
    return record

@router.delete("/{fuel_record_id}")
def delete_fuel_record(
    fuel_record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(FuelRecord).filter(FuelRecord.id == fuel_record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Fuel record not found")
    
    db.delete(record)
    db.commit()
    
    return {"message": "Fuel record deleted successfully"}

@router.get("/statistics/consumption")
def get_fuel_consumption_stats(
    vehicle_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(
        func.sum(FuelRecord.liters).label("total_liters"),
        func.sum(FuelRecord.total_cost).label("total_cost"),
        func.count(FuelRecord.id).label("refuel_count"),
        func.avg(FuelRecord.price_per_liter).label("avg_price_per_liter")
    ).filter(FuelRecord.vehicle_id == vehicle_id)
    
    if start_date:
        query = query.filter(FuelRecord.fuel_date >= start_date)
    if end_date:
        query = query.filter(FuelRecord.fuel_date <= end_date)
    
    stats = query.first()
    
    fuel_records = db.query(FuelRecord).filter(
        FuelRecord.vehicle_id == vehicle_id
    ).order_by(FuelRecord.km_at_fueling).all()
    
    consumption_per_100km = None
    if len(fuel_records) > 1:
        total_km = fuel_records[-1].km_at_fueling - fuel_records[0].km_at_fueling
        total_fuel = sum(record.liters for record in fuel_records[1:])
        if total_km > 0:
            consumption_per_100km = (total_fuel / total_km) * 100
    
    return {
        "total_liters": stats.total_liters or 0,
        "total_cost": stats.total_cost or 0,
        "refuel_count": stats.refuel_count or 0,
        "avg_price_per_liter": stats.avg_price_per_liter or 0,
        "consumption_per_100km": consumption_per_100km
    }