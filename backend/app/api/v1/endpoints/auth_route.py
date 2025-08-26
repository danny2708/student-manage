from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext
from datetime import timedelta, datetime, timezone # Import thêm datetime và timezone
from jose import JWTError, jwt
from typing import Optional

from dotenv import load_dotenv
import os

# Load các biến môi trường từ file .env
load_dotenv()

from app.api.deps import get_db
from app.schemas.auth_schema import LoginRequest, LoginSuccess
from app.models.user_model import User

router = APIRouter()

# Tải SECRET_KEY từ biến môi trường
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Kiểm tra nếu SECRET_KEY không tồn tại
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is not set. Please set it in your .env file.")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kiểm tra mật khẩu thô với mật khẩu đã được băm."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Tạo JWT access token."""
    to_encode = data.copy()
    
    # Tính toán thời gian hết hạn dựa trên thời gian hiện tại
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post(
    "/login", 
    response_model=LoginSuccess,
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
    stmt = select(User).where(User.username == request.username)
    user = db.execute(stmt).scalars().first()
    
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
        
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "message": "Đăng nhập thành công",
        "user_id": user.user_id,
        "username": user.username
    }
