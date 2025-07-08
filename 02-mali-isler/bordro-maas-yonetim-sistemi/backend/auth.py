from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

# IAM servisi ile aynı güvenlik ayarları
SECRET_KEY = "your-super-secret-key-here-change-in-production"
ALGORITHM = "HS256"

# Token scheme
security = HTTPBearer()

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

def verify_token(token: str) -> TokenData:
    """JWT token doğrulaması"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        email: str = payload.get("email")
        role: str = payload.get("role")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token geçersiz",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token_data = TokenData(user_id=user_id, email=email, role=role)
        return token_data
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """Mevcut kullanıcıyı token'dan alma"""
    token = credentials.credentials
    token_data = verify_token(token)
    return token_data

def require_admin(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """Admin yetkisi kontrolü"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekli"
        )
    return current_user

def require_employee_or_admin(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """Employee veya admin yetkisi kontrolü"""
    if current_user.role not in ["employee", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için geçerli bir rol gerekli"
        )
    return current_user 