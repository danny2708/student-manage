# app/schemas/user_schema.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from app.models.user_model import UserRole # Import UserRole từ user_model

# Schema cơ sở cho User
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Tên đăng nhập")
    role: UserRole = Field(UserRole.student, description="Vai trò của người dùng (student, teacher, manager, parent, staff)")

# Schema để tạo User (bao gồm mật khẩu)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Mật khẩu (sẽ được băm)")

# Schema để cập nhật User (mật khẩu là tùy chọn)
class UserUpdate(UserBase):
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Tên đăng nhập mới")
    password: Optional[str] = Field(None, min_length=6, description="Mật khẩu mới (sẽ được băm)")
    role: Optional[UserRole] = Field(None, description="Vai trò mới của người dùng")

# Schema để đọc User (không bao gồm mật khẩu)
class User(UserBase):
    user_id: int = Field(..., description="ID người dùng")

    class Config:
        from_attributes = True # Thay thế orm_mode = True trong Pydantic v2

