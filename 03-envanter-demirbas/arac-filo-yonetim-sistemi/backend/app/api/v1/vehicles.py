from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.user import User
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, Vehicle as VehicleSchema
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[VehicleSchema])
def get_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Vehicle)
    
    if status:
        query = query.filter(Vehicle.status == status)
    if department:
        query = query.filter(Vehicle.department == department)
    
    vehicles = query.offset(skip).limit(limit).all()
    return vehicles

@router.get("/{vehicle_id}", response_model=VehicleSchema)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.post("/", response_model=VehicleSchema)
def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_vehicle = db.query(Vehicle).filter(
        Vehicle.plate_number == vehicle.plate_number
    ).first()
    
    if db_vehicle:
        raise HTTPException(
            status_code=400,
            detail="Vehicle with this plate number already exists"
        )
    
    db_vehicle = Vehicle(**vehicle.dict())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    
    return db_vehicle

@router.put("/{vehicle_id}", response_model=VehicleSchema)
def update_vehicle(
    vehicle_id: int,
    vehicle_update: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    update_data = vehicle_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)
    
    db.commit()
    db.refresh(vehicle)
    
    return vehicle

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle.is_active = False
    db.commit()
    
    return {"message": "Vehicle deactivated successfully"}