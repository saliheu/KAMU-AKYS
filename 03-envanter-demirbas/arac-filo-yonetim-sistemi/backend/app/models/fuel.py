from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class FuelRecord(Base):
    __tablename__ = "fuel_records"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    fuel_date = Column(DateTime(timezone=True), nullable=False)
    fuel_type = Column(String, nullable=False)
    liters = Column(Float, nullable=False)
    price_per_liter = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    km_at_fueling = Column(Integer, nullable=False)
    station_name = Column(String)
    receipt_number = Column(String)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    vehicle = relationship("Vehicle", back_populates="fuel_records")