# app/api/auth/auth.py
import os
from datetime import datetime, timedelta, timezone # Import timezone
from typing import Optional, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt # type: ignore
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.user_model import User # Import model User của bạn
from app.schemas.auth_schema import TokenData, AuthenticatedUser
# Thêm dòng này để load các biến môi trường từ file .env
from dotenv import load_dotenv
load_dotenv()

# Cấu hình JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-from-env") 
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set. Please set it in your .env file.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None):
    """
    Tạo một JWT token mới.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> TokenData:
    """
    Xác minh và giải mã một JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    return token_data

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> AuthenticatedUser:
    """
    Dependency để lấy thông tin người dùng hiện tại từ token.
    """
    token_data = verify_token(token)
    
    # Truy vấn người dùng từ cơ sở dữ liệu dựa trên user_id từ token
    user = db.query(User).filter(User.id == token_data.user_id).first()
    
    # Kiểm tra xem người dùng có tồn tại không
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tìm thấy"
        )
    
    # Kiểm tra xem tài khoản có đang hoạt động không
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Người dùng không hoạt động"
        )

    # Chuyển đổi đối tượng SQLAlchemy thành Pydantic model
    return AuthenticatedUser(
        id=user.id,
        username=user.username,
        role=user.role,
        is_active=user.is_active,
        full_name=user.full_name,
        email=user.email
    )

def get_current_active_user(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Dependency để lấy người dùng đang hoạt động.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Người dùng không hoạt động")
    return current_user

def get_current_manager_or_teacher(
    current_user: AuthenticatedUser = Depends(get_current_active_user),
):
    """
    Dependency: Chỉ cho phép truy cập nếu user có vai trò là manager hoặc teacher.
    """
    if current_user.role not in ["manager", "teacher"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản lý hoặc giáo viên mới có quyền truy cập",
        )
    return current_user


def get_current_manager(
    current_user: AuthenticatedUser = Depends(get_current_active_user),
):
    """
    Dependency: Chỉ cho phép truy cập nếu user có vai trò là manager.
    """
    if current_user.role != "manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản lý mới có quyền truy cập",
        )
    return current_user
