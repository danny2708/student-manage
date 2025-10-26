#app/api/auth/auth.py
import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt # type: ignore
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.user_model import User
from app.schemas.auth_schema import TokenData, AuthenticatedUser
from dotenv import load_dotenv
from app.config import SECRET_KEY

# Tải các biến môi trường
load_dotenv()

# Cấu hình JWT
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 180

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception

def get_current_active_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> AuthenticatedUser:
    token_data = verify_token(token)
    user = db.query(User).filter(User.user_id == token_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    roles = [role.name for role in user.roles]
    return AuthenticatedUser(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        date_of_birth=user.date_of_birth,
        gender=user.gender,
        phone_number=user.phone_number,
        roles=roles
    )

def has_roles(required_roles: List[str]):
    """
    Dependency factory để kiểm tra quyền truy cập dựa trên vai trò.
    Hàm này trả về một dependency mới dựa trên danh sách vai trò yêu cầu.
    """
    def role_checker(current_user: AuthenticatedUser = Depends(get_current_active_user)):
        # Kiểm tra xem người dùng có ít nhất một trong các vai trò yêu cầu không
        if not any(role in required_roles for role in current_user.roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền để thực hiện hành động này."
            )
        return current_user
    return role_checker
