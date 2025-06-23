from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date

class DriverBase(BaseModel):
    tc_number: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    license_number: str
    license_type: str
    license_expiry_date: date
    department: Optional[str] = None
    position: Optional[str] = None

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    tc_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    license_number: Optional[str] = None
    license_type: Optional[str] = None
    license_expiry_date: Optional[date] = None
    department: Optional[str] = None
    position: Optional[str] = None
    is_active: Optional[bool] = None

class Driver(DriverBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True