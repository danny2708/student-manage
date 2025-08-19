from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext

from app.api.deps import get_db
from app.schemas.auth_schema import LoginRequest, LoginSuccess
from app.models.user_model import User

router = APIRouter()

# Khởi tạo CryptContext với thuật toán bcrypt để băm và kiểm tra mật khẩu
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kiểm tra mật khẩu thô với mật khẩu đã được băm."""
    return pwd_context.verify(plain_password, hashed_password)

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
    Xác thực người dùng bằng tên đăng nhập và mật khẩu.
    """
    # 1. Tìm người dùng trong cơ sở dữ liệu
    stmt = select(User).where(User.username == request.username)
    user = db.execute(stmt).scalars().first()
    
    # 2. Kiểm tra xem người dùng có tồn tại không
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng."
        )

    # 3. Xác minh mật khẩu
    if not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng."
        )
        
    # 4. Trả về thông tin người dùng nếu đăng nhập thành công
    return LoginSuccess(
        message="Đăng nhập thành công",
        user_id=user.user_id,
        username=user.username
    )

