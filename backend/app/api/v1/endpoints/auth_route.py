# app/api/auth/auth_routes.py

from datetime import timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from passlib.context import CryptContext  # type: ignore
from pydantic import BaseModel
from dotenv import load_dotenv
from starlette.requests import Request
import os

from app.api.deps import get_db
from app.models.user_model import User
from app.schemas.auth_schema import LoginRequest
from app.api.auth.auth import (
    create_access_token,
    verify_token,  # ✅ dùng verify_token từ auth.py
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.schemas.user_schema import UserOut
from app.services import sso_service

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

load_dotenv("credential.env")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

# ---------------------- RESPONSE SCHEMA ---------------------- #
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    full_name: str
    email: str
    roles: List[str]
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None


# ---------------------- LOGIN TRUYỀN THỐNG ---------------------- #
@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not pwd_context.verify(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng",
        )

    access_token = create_access_token(
        data={"sub": str(user.user_id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    roles = [role.name for role in getattr(user, "roles", [])]

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


# ---------------------- GOOGLE SSO ---------------------- #
@router.get("/google")
def login_with_google():
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&scope=openid%20email%20profile"
    )
    return RedirectResponse(url=google_auth_url)


@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    try:
        # 1️⃣ Đổi code lấy token từ Google
        token_data = sso_service.exchange_code_for_token(code)
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Không lấy được access_token từ Google")

        # 2️⃣ Lấy thông tin user từ Google
        user_info = sso_service.get_user_info(access_token)
        if not user_info.email:
            raise HTTPException(status_code=400, detail="Không lấy được thông tin người dùng từ Google")

        # 3️⃣ Kiểm tra hoặc tạo user mới trong DB
        user = db.query(User).filter(User.email == user_info.email).first()
        if not user:
            user = User(
                username=user_info.email.split("@")[0],
                email=user_info.email,
                full_name=user_info.full_name,
                password="",  # Không dùng password cho SSO
                gender="male",  # Mặc định hoặc lấy từ user_info nếu có
                phone_number="",  # Mặc định hoặc lấy từ user_info nếu có
                date_of_birth="2000-01-01"  # Mặc định hoặc lấy từ user_info nếu có"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # 4️⃣ Tạo JWT token
        jwt_token = create_access_token(
            data={"sub": str(user.user_id)},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        # 5️⃣ Redirect về frontend kèm token
        frontend_url = f"{FRONTEND_URL}/login/callback?token={jwt_token}"
        return RedirectResponse(url=frontend_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    except Exception as e:
        print(f"❌ Google login error: {e}")
        return RedirectResponse(
            url=f"{FRONTEND_URL}/login?error=google_login_failed",
            status_code=status.HTTP_307_TEMPORARY_REDIRECT
        )


# ---------------------- LẤY USER TỪ TOKEN ---------------------- #
@router.get("/me", response_model=UserOut)
def get_current_user(request: Request, db: Session = Depends(get_db)):
    """
    ✅ Trả về thông tin người dùng từ JWT token (Authorization header)
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Thiếu hoặc sai định dạng token")

    token = auth_header.split(" ")[1]
    token_data = verify_token(token)
    user = db.query(User).filter(User.user_id == token_data.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user