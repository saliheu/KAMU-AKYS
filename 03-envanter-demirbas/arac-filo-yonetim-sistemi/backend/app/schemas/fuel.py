from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FuelRecordBase(BaseModel):
    vehicle_id: int
    driver_id: Optional[int] = None
    fuel_date: datetime
    fuel_type: str
    liters: float
    price_per_liter: float
    total_cost: float
    km_at_fueling: int
    station_name: Optional[str] = None
    receipt_number: Optional[str] = None

class FuelRecordCreate(FuelRecordBase):
    pass

class FuelRecordUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    driver_id: Optional[int] = None
    fuel_date: Optional[datetime] = None
    fuel_type: Optional[str] = None
    liters: Optional[float] = None
    price_per_liter: Optional[float] = None
    total_cost: Optional[float] = None
    km_at_fueling: Optional[int] = None
    station_name: Optional[str] = None
    receipt_number: Optional[str] = None

class FuelRecord(FuelRecordBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True