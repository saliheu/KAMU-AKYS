from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.vehicle import VehicleStatus, VehicleType

class VehicleBase(BaseModel):
    plate_number: str
    brand: str
    model: str
    year: int
    vehicle_type: VehicleType
    status: VehicleStatus = VehicleStatus.ACTIVE
    color: Optional[str] = None
    chassis_number: Optional[str] = None
    engine_number: Optional[str] = None
    fuel_type: Optional[str] = None
    purchase_date: Optional[datetime] = None
    purchase_price: Optional[float] = None
    current_km: int = 0
    department: Optional[str] = None
    assigned_driver_id: Optional[int] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    plate_number: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vehicle_type: Optional[VehicleType] = None
    status: Optional[VehicleStatus] = None
    color: Optional[str] = None
    chassis_number: Optional[str] = None
    engine_number: Optional[str] = None
    fuel_type: Optional[str] = None
    purchase_date: Optional[datetime] = None
    purchase_price: Optional[float] = None
    current_km: Optional[int] = None
    department: Optional[str] = None
    assigned_driver_id: Optional[int] = None
    is_active: Optional[bool] = None

class Vehicle(VehicleBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True