from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(Integer, primary_key=True, index=True)
    tc_number = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String)
    email = Column(String)
    license_number = Column(String, unique=True, nullable=False)
    license_type = Column(String, nullable=False)
    license_expiry_date = Column(Date, nullable=False)
    department = Column(String)
    position = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    vehicle = relationship("Vehicle", back_populates="assigned_driver", uselist=False)