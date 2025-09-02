from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import date
from app.models.user_model import GenderEnum



# -------------------------------
# Base schema dùng chung
# -------------------------------
class UserBase(BaseModel):
    username: str = Field(..., example="john_doe")
    email: Optional[EmailStr] = Field(None, example="john.doe@example.com")
    full_name: Optional[str] = Field(None, example="John Doe")
    date_of_birth: Optional[date] = Field(None, example="1990-01-01")
    gender: Optional[GenderEnum] = Field(None, example="male")
    phone_number: Optional[str] = Field(None, example="0901234567")


# -------------------------------
# Schema cho CRUD User
# -------------------------------
class UserCreate(UserBase):
    password: str = Field(..., example="password")
    password_changed: bool = Field(default=False, description="Đánh dấu mật khẩu đã được đổi hay chưa")


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[GenderEnum] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None


class UserOut(UserBase):
    user_id: int = Field(..., example=1)
    password_changed: bool

    class Config:
        from_attributes = True


# -------------------------------
# Schema cho import từ Google Sheet
# -------------------------------
class SheetUserCreate(UserBase):
    password: str
    password_changed: bool = Field(default=False)


class SheetUserImportRequest(BaseModel):
    users: List[SheetUserCreate]
