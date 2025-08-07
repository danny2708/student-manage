from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date

class ParentBase(BaseModel):
    """
    Schema cơ bản cho Parent, chứa các trường dùng chung.
    Bao gồm cả date_of_birth để khớp với database model.
    """
    full_name: str = Field(..., example="Pham Thi D")
    email: EmailStr = Field(..., example="pham.d@example.com")
    phone_number: Optional[str] = Field(None, example="0912345678")
    date_of_birth: Optional[date] = Field(None, example="1990-01-15")

class ParentCreate(ParentBase):
    """
    Schema dùng khi tạo một Parent mới.
    Thêm user_id để liên kết với tài khoản User.
    """
    user_id: int = Field(..., example=6)

class ParentUpdate(ParentBase):
    """
    Schema dùng khi cập nhật thông tin Parent.
    Tất cả các trường đều là Optional để có thể cập nhật từng phần.
    """
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    user_id: Optional[int] = None

class Parent(ParentBase):
    """
    Schema dùng khi trả về thông tin Parent.
    Thêm parent_id và đảm bảo các trường khớp với database.
    """
    parent_id: int = Field(..., example=1)
    user_id: int = Field(..., example=6)

    class Config:
        from_attributes = True

