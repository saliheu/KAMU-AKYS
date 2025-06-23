from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.driver import Driver
from app.models.user import User
from app.schemas.driver import DriverCreate, DriverUpdate, Driver as DriverSchema
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[DriverSchema])
def get_drivers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    department: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Driver)
    
    if department:
        query = query.filter(Driver.department == department)
    if is_active is not None:
        query = query.filter(Driver.is_active == is_active)
    
    drivers = query.offset(skip).limit(limit).all()
    return drivers

@router.get("/{driver_id}", response_model=DriverSchema)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.post("/", response_model=DriverSchema)
def create_driver(
    driver: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_driver = db.query(Driver).filter(
        (Driver.tc_number == driver.tc_number) | 
        (Driver.license_number == driver.license_number)
    ).first()
    
    if db_driver:
        raise HTTPException(
            status_code=400,
            detail="Driver with this TC number or license number already exists"
        )
    
    db_driver = Driver(**driver.dict())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    
    return db_driver

@router.put("/{driver_id}", response_model=DriverSchema)
def update_driver(
    driver_id: int,
    driver_update: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    update_data = driver_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(driver, field, value)
    
    db.commit()
    db.refresh(driver)
    
    return driver

@router.delete("/{driver_id}")
def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    
    driver.is_active = False
    db.commit()
    
    return {"message": "Driver deactivated successfully"}