# app/api/auth/auth.py
import os
from datetime import timedelta, datetime, timezone
from typing import Optional, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext # type: ignore # type: ignore
from jose import jwt # type: ignore
from pydantic import BaseModel

from dotenv import load_dotenv

from app.api.deps import get_db
from app.models.user_model import User
from app.schemas.auth_schema import LoginRequest

# Tải các biến môi trường từ file .env
load_dotenv()

router = APIRouter()

# Tải SECRET_KEY từ biến môi trường
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set. Please set it in your .env file.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Schema cho phản hồi khi đăng nhập thành công
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    message: Optional[str] = "Đăng nhập thành công"
    user_id: int
    username: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kiểm tra mật khẩu thô với mật khẩu đã được băm."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: Dict, expires_delta: Optional[timedelta] = None):
    """Tạo JWT access token."""
    to_encode = data.copy()
    
    # Tính toán thời gian hết hạn dựa trên thời gian hiện tại
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post(
    "/login", 
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Đăng nhập người dùng"
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Xác thực người dùng bằng tên đăng nhập và mật khẩu và trả về JWT token.
    """
    # Sử dụng `username` để tìm kiếm người dùng
    stmt = select(User).where(User.username == request.username)
    user = db.execute(stmt).scalars().first()
    
    # Kiểm tra người dùng và mật khẩu
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Tính thời gian hết hạn cho token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Tạo JWT token. Chúng ta sử dụng `sub` để lưu `user_id`, đây là một thực tiễn tốt.
    # Tên người dùng cũng có thể được bao gồm để tiện lợi, nhưng `user_id` là đủ.
    access_token = create_access_token(
        data={"sub": str(user.user_id)}, 
        expires_delta=access_token_expires
    )
        
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.user_id,
        "username": user.username
    }
