from pydantic import BaseModel, Field
from typing import Optional
from app.models.user import UserRole 

# Schema cơ bản, dùng cho cả input và output để tránh lặp lại
class UserBase(BaseModel):
    username: str = Field(..., example="john.doe")
    role: UserRole = Field(..., example=UserRole.STUDENT)

# Schema dùng cho việc tạo User mới (bao gồm mật khẩu)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="securepassword123")

# Schema dùng cho việc cập nhật User (tất cả các trường là tùy chọn)
class UserUpdate(UserBase):
    username: Optional[str] = Field(None, example="john.doe_new")
    password: Optional[str] = Field(None, min_length=6, example="newsecurepassword")
    role: Optional[UserRole] = Field(None, example=UserRole.TEACHER)

# Schema cho User khi đọc từ DB (bao gồm user_id)
# Sử dụng Config.from_attributes = True để tương thích với SQLAlchemy ORM
class User(UserBase):
    user_id: int = Field(..., example=1)

    class Config:
        from_attributes = True # Cho phép Pydantic đọc dữ liệu từ các thuộc tính ORM

# Schema cho User khi lưu vào DB (có thể không cần thiết nếu bạn dùng UserCreate và User)
# Nhưng hữu ích nếu bạn muốn một schema riêng biệt cho dữ liệu đã được xử lý trước khi lưu
class UserInDB(User):
    hashed_password: str # Mật khẩu đã được băm

