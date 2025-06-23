from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.maintenance import MaintenanceType

class MaintenanceBase(BaseModel):
    vehicle_id: int
    maintenance_type: MaintenanceType
    description: str
    service_provider: Optional[str] = None
    cost: float = 0
    km_at_service: Optional[int] = None
    service_date: datetime
    next_service_date: Optional[datetime] = None
    next_service_km: Optional[int] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(BaseModel):
    vehicle_id: Optional[int] = None
    maintenance_type: Optional[MaintenanceType] = None
    description: Optional[str] = None
    service_provider: Optional[str] = None
    cost: Optional[float] = None
    km_at_service: Optional[int] = None
    service_date: Optional[datetime] = None
    next_service_date: Optional[datetime] = None
    next_service_km: Optional[int] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

class Maintenance(MaintenanceBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True