from sqlalchemy import Column, Integer, String, DateTime, Enum, Float, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class VehicleStatus(str, enum.Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"
    SOLD = "sold"

class VehicleType(str, enum.Enum):
    CAR = "car"
    VAN = "van"
    TRUCK = "truck"
    BUS = "bus"
    MOTORCYCLE = "motorcycle"

class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String, unique=True, index=True, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    vehicle_type = Column(Enum(VehicleType), nullable=False)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.ACTIVE)
    color = Column(String)
    chassis_number = Column(String, unique=True)
    engine_number = Column(String)
    fuel_type = Column(String)
    purchase_date = Column(DateTime(timezone=True))
    purchase_price = Column(Float)
    current_km = Column(Integer, default=0)
    department = Column(String)
    assigned_driver_id = Column(Integer, ForeignKey("drivers.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    assigned_driver = relationship("Driver", back_populates="vehicle")
    maintenance_records = relationship("Maintenance", back_populates="vehicle")
    fuel_records = relationship("FuelRecord", back_populates="vehicle")