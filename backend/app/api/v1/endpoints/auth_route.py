from datetime import timedelta
from typing import Optional, List
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from pydantic import BaseModel
from passlib.context import CryptContext # type: ignore
from app.api.deps import get_db
from app.models.user_model import User
from app.schemas.auth_schema import LoginRequest
from app.api.auth.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kiểm tra mật khẩu thô với mật khẩu đã được băm."""
    return pwd_context.verify(plain_password, hashed_password)

# Define the comprehensive login response model.
# This should match what the frontend expects.
# It includes the token details and the user's profile information.
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    full_name: str
    email: str
    roles: List[str]
    phone: str
    dob: Optional[str] = None
    gender: Optional[str] = None

@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
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

    # Use getattr for a safe check, though the model should have a roles attribute
    roles = [role.name for role in getattr(user, "roles", [])]

    # Return the comprehensive response with all user details
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.user_id,
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        roles=roles,
        phone=user.phone_number,
        dob=user.date_of_birth.isoformat() if user.date_of_birth else None,
        gender=user.gender
    )

