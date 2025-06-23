from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class MaintenanceType(str, enum.Enum):
    PERIODIC = "periodic"
    REPAIR = "repair"
    INSPECTION = "inspection"
    TIRE_CHANGE = "tire_change"
    OIL_CHANGE = "oil_change"
    OTHER = "other"

class Maintenance(Base):
    __tablename__ = "maintenance"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    maintenance_type = Column(Enum(MaintenanceType), nullable=False)
    description = Column(Text, nullable=False)
    service_provider = Column(String)
    cost = Column(Float, default=0)
    km_at_service = Column(Integer)
    service_date = Column(DateTime(timezone=True), nullable=False)
    next_service_date = Column(DateTime(timezone=True))
    next_service_km = Column(Integer)
    invoice_number = Column(String)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    vehicle = relationship("Vehicle", back_populates="maintenance_records")