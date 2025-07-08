from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: Optional[str] = "employee"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

# Registration Request Schemas
class RegistrationRequestBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: Optional[str] = "employee"

class RegistrationRequestCreate(RegistrationRequestBase):
    password: str

class RegistrationRequestResponse(RegistrationRequestBase):
    id: int
    requested_at: datetime
    
    class Config:
        from_attributes = True

# Internal User Creation Schema (servisler arası iletişim için)
class InternalUserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: Optional[str] = "employee" 