# app/schemas/user_schema.py
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# Import các schema cho Role mới được tạo
from app.schemas.role_schema import Role

# Schema cơ bản cho User (các trường chung)
class UserBase(BaseModel):
    username: str
    email: EmailStr

# Schema để tạo User mới
class UserCreate(UserBase):
    password: str
    # roles_ids là một danh sách ID vai trò khi tạo người dùng
    roles_ids: List[int] = []

# Schema để cập nhật User
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    # Bạn có thể thêm trường để cập nhật danh sách vai trò nếu cần
    roles_ids: Optional[List[int]] = None

# Schema dùng để đọc/trả về dữ liệu User
class User(UserBase):
    user_id: int
    is_active: bool = True  # Thêm một trường ví dụ
    roles: List[Role] = []  # Vai trò giờ là một danh sách các đối tượng Role

    class Config:
        from_attributes = True
