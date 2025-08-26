from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# Pydantic model cho payload của JWT
class TokenData(BaseModel):
    user_id: Optional[int] = None

# Pydantic model cho người dùng đã xác thực
class AuthenticatedUser(BaseModel):
    id: int = Field(..., example=1, description="ID của người dùng")
    username: str = Field(..., example="john_doe", description="Tên đăng nhập")
    role: str = Field(..., example="manager", description="Vai trò của người dùng (manager, teacher, student, parent)")
    is_active: bool = Field(True, example=True, description="Trạng thái hoạt động của người dùng")
    full_name: Optional[str] = Field(None, example="John Doe", description="Họ và tên đầy đủ")
    email: Optional[EmailStr] = Field(None, example="john.doe@example.com", description="Email của người dùng")

    class Config:
        from_attributes = True
        
class LoginRequest(BaseModel):
    """
    Schema cho yêu cầu đăng nhập.
    """
    username: str = Field(..., example="johndoe")
    password: str = Field(..., example="secure_password")

class LoginSuccess(BaseModel):
    """
    Schema cho phản hồi khi đăng nhập thành công.
    """
    message: str = Field(..., example="Đăng nhập thành công")
    user_id: int = Field(..., example=1)
    username: str = Field(..., example="johndoe")

    class Config:
        from_attributes = True
