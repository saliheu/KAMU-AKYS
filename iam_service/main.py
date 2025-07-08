from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import crud
import schemas
from database import engine, get_db
from auth import authenticate_user, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

# Veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kimlik ve Erişim Yönetimi (IAM) Servisi",
    description="Kullanıcı kimlik doğrulama ve yetkilendirme servisi",
    version="1.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Yeni kullanıcı oluştur"""
    # Email kontrolü
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="Bu email adresi zaten kayıtlı"
        )
    
    # Rol kontrolü
    if user.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz rol. Sadece 'admin' veya 'employee' olabilir"
        )
    
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(
    user_credentials: schemas.UserLogin, 
    db: Session = Depends(get_db)
):
    """Kullanıcı girişi ve JWT token oluşturma"""
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email veya parola hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesabınız pasifleştirilmiştir. Sisteme giriş yapamazsınız. Lütfen sistem yöneticisi ile iletişime geçin.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer"
    }

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    """Mevcut kullanıcı bilgilerini getir"""
    return current_user

@app.get("/users/", response_model=list[schemas.UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tüm kullanıcıları listele (sadece admin)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcı rolünü güncelle (sadece admin)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    
    if new_role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz rol. Sadece 'admin' veya 'employee' olabilir"
        )
    
    user = crud.update_user_role(db, user_id, new_role)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı"
        )
    
    return {"message": f"Kullanıcı rolü '{new_role}' olarak güncellendi"}

# Registration Request Endpoints

@app.post("/register", response_model=schemas.RegistrationRequestResponse)
def register_user_request(
    request: schemas.RegistrationRequestCreate, 
    db: Session = Depends(get_db)
):
    """Yeni kullanıcı kayıt talebi oluştur (Herkese açık)"""
    # Email kontrolü - Hem users hem de registration_requests tablosunda
    existing_user = crud.get_user_by_email(db, email=request.email)
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="Bu email adresi zaten kayıtlı"
        )
    
    existing_request = crud.get_registration_request_by_email(db, email=request.email)
    if existing_request:
        raise HTTPException(
            status_code=400, 
            detail="Bu email adresi için zaten bir kayıt talebi mevcut"
        )
    
    # Rol kontrolü
    if request.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz rol. Sadece 'admin' veya 'employee' olabilir"
        )
    
    return crud.create_registration_request(db=db, request=request)

@app.get("/admin/registrations", response_model=List[schemas.RegistrationRequestResponse])
def get_registration_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Onay bekleyen kayıt taleplerini listele (Sadece admin)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    
    return crud.get_registration_requests(db)

@app.post("/admin/registrations/approve/{request_id}", response_model=schemas.UserResponse)
def approve_registration_request(
    request_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kayıt talebini onayla ve kullanıcı oluştur (Sadece admin)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    
    user = crud.approve_registration_request(db, request_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Kayıt talebi bulunamadı"
        )
    
    return user

@app.post("/admin/registrations/reject/{request_id}")
def reject_registration_request(
    request_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kayıt talebini reddet ve sil (Sadece admin)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    
    success = crud.reject_registration_request(db, request_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Kayıt talebi bulunamadı"
        )
    
    return {"message": "Kayıt talebi reddedildi"}

# Internal API Endpoints (Servisler arası iletişim)
@app.post("/internal/users", response_model=schemas.UserResponse)
def create_internal_user(user: schemas.InternalUserCreate, db: Session = Depends(get_db)):
    """
    Diğer servisler tarafından kullanıcı oluşturma (Internal API)
    Bu endpoint sadece backend servisleri tarafından kullanılmalıdır
    """
    # Email kontrolü
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="Bu email adresi zaten kayıtlı"
        )
    
    # Rol kontrolü
    if user.role not in ["admin", "employee"]:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz rol. Sadece 'admin' veya 'employee' olabilir"
        )
    
    # UserCreate schema'sına dönüştür
    user_create = schemas.UserCreate(
        email=user.email,
        password=user.password,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role
    )
    
    return crud.create_user(db=db, user=user_create)

@app.get("/")
def root():
    return {"message": "IAM Servisi çalışıyor"}

@app.post("/admin/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcıyı deaktif et (sadece admin)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    
    user = crud.deactivate_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı"
        )
    
    return {"message": f"Kullanıcı başarıyla deaktif edildi"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 