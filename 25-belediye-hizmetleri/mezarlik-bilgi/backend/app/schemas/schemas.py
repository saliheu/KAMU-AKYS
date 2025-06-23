from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Mezarlik Schemas
class MezarlikBase(BaseModel):
    ad: str
    adres: Optional[str] = None
    il: Optional[str] = None
    ilce: Optional[str] = None
    kapasite: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class MezarlikCreate(MezarlikBase):
    pass

class Mezarlik(MezarlikBase):
    id: int
    dolu_sayisi: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Ada Schemas
class AdaBase(BaseModel):
    ada_no: str
    kapasite: Optional[int] = None

class AdaCreate(AdaBase):
    mezarlik_id: int

class Ada(AdaBase):
    id: int
    mezarlik_id: int
    dolu_sayisi: int
    
    class Config:
        from_attributes = True

# Mezar Schemas
class MezarBase(BaseModel):
    mezar_no: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class MezarCreate(MezarBase):
    ada_id: int

class Mezar(MezarBase):
    id: int
    ada_id: int
    durum: str
    
    class Config:
        from_attributes = True

# Defin Kaydi Schemas
class DefinKaydiBase(BaseModel):
    tc_no: Optional[str] = None
    ad_soyad: str
    baba_adi: Optional[str] = None
    anne_adi: Optional[str] = None
    dogum_tarihi: Optional[date] = None
    olum_tarihi: date
    defin_tarihi: date
    olum_nedeni: Optional[str] = None
    memleket: Optional[str] = None
    yakin_ad_soyad: Optional[str] = None
    yakin_telefon: Optional[str] = None
    yakin_adres: Optional[str] = None
    notlar: Optional[str] = None

class DefinKaydiCreate(DefinKaydiBase):
    mezar_id: int

class DefinKaydi(DefinKaydiBase):
    id: int
    mezar_id: int
    kaydeden_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Ziyaretci Schemas
class ZiyaretciKaydiBase(BaseModel):
    ad_soyad: str
    telefon: Optional[str] = None
    aranan_kisi: str

class ZiyaretciKaydiCreate(ZiyaretciKaydiBase):
    pass

class ZiyaretciKaydi(ZiyaretciKaydiBase):
    id: int
    ziyaret_tarihi: datetime
    bulundu_mu: bool
    
    class Config:
        from_attributes = True