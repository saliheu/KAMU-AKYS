from sqlalchemy.orm import Session
from typing import Optional, List
from models import User, RegistrationRequest
from schemas import UserCreate, RegistrationRequestCreate
from auth import get_password_hash

def get_user(db: Session, user_id: int) -> Optional[User]:
    """ID'ye göre kullanıcı getir"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Email'e göre kullanıcı getir"""
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Tüm kullanıcıları listele"""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    """Yeni kullanıcı oluştur"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_role(db: Session, user_id: int, new_role: str) -> Optional[User]:
    """Kullanıcı rolünü güncelle"""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.role = new_role
        db.commit()
        db.refresh(user)
    return user

def deactivate_user(db: Session, user_id: int) -> Optional[User]:
    """Kullanıcıyı deaktif et"""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.is_active = False
        db.commit()
        db.refresh(user)
    return user

# Registration Request CRUD Functions

def create_registration_request(db: Session, request: RegistrationRequestCreate) -> RegistrationRequest:
    """Yeni kayıt talebi oluştur"""
    hashed_password = get_password_hash(request.password)
    db_request = RegistrationRequest(
        email=request.email,
        hashed_password=hashed_password,
        first_name=request.first_name,
        last_name=request.last_name,
        role=request.role
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_registration_requests(db: Session) -> List[RegistrationRequest]:
    """Tüm kayıt taleplerini listele"""
    return db.query(RegistrationRequest).order_by(RegistrationRequest.requested_at.desc()).all()

def get_registration_request(db: Session, request_id: int) -> Optional[RegistrationRequest]:
    """ID'ye göre kayıt talebi getir"""
    return db.query(RegistrationRequest).filter(RegistrationRequest.id == request_id).first()

def get_registration_request_by_email(db: Session, email: str) -> Optional[RegistrationRequest]:
    """Email'e göre kayıt talebi getir"""
    return db.query(RegistrationRequest).filter(RegistrationRequest.email == email).first()

def approve_registration_request(db: Session, request_id: int) -> Optional[User]:
    """Kayıt talebini onayla ve kullanıcı oluştur"""
    reg_request = db.query(RegistrationRequest).filter(RegistrationRequest.id == request_id).first()
    if not reg_request:
        return None
    
    # Yeni kullanıcı oluştur
    new_user = User(
        email=reg_request.email,
        hashed_password=reg_request.hashed_password,
        first_name=reg_request.first_name,
        last_name=reg_request.last_name,
        role=reg_request.role
    )
    db.add(new_user)
    
    # Kayıt talebini sil
    db.delete(reg_request)
    
    db.commit()
    db.refresh(new_user)
    return new_user

def reject_registration_request(db: Session, request_id: int) -> bool:
    """Kayıt talebini reddet ve sil"""
    reg_request = db.query(RegistrationRequest).filter(RegistrationRequest.id == request_id).first()
    if not reg_request:
        return False
    
    db.delete(reg_request)
    db.commit()
    return True 