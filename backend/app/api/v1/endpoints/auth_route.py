# app/api/route/auth_route.py
from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel
from passlib.context import CryptContext # type: ignore # type: ignore
from app.api.deps import get_db
from app.models.user_model import User
from app.schemas.auth_schema import LoginRequest
from app.api.auth.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

# Schema cho phản hồi khi đăng nhập thành công
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    message: Optional[str] = "Đăng nhập thành công"
    user_id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    roles: list = []

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kiểm tra mật khẩu thô với mật khẩu đã được băm."""
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    stmt = select(User).where(User.username == request.username)
    user = db.execute(stmt).scalars().first()

    if not user or not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.user_id)}, 
        expires_delta=access_token_expires
    )

    roles = [role.name for role in getattr(user, "roles", [])]

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.user_id,
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        roles=roles
    )