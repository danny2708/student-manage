from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import date


# -------------------------------
# Base schema dùng chung
# -------------------------------
class UserBase(BaseModel):
    username: str = Field(..., example="john_doe")
    email: Optional[EmailStr] = Field(None, example="john.doe@example.com")
    full_name: Optional[str] = Field(None, example="John Doe")
    date_of_birth: Optional[date] = Field(None, example="1990-01-01")
    gender: Optional[str] = Field(None, example="Male")
    phone_number: Optional[str] = Field(None, example="0901234567")


# -------------------------------
# Schema cho CRUD User
# -------------------------------
class UserCreate(UserBase):
    password: str = Field(..., example="verysecretpassword")
    first_password: Optional[str] = None   # phục vụ import từ sheet


class UserUpdate(UserBase):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None


class UserOut(UserBase):
    user_id: int = Field(..., example=1)
    username: str

    class Config:
        from_attributes = True


# -------------------------------
# Schema cho import từ Google Sheet
# -------------------------------
class SheetUserCreate(BaseModel):
    username: str
    full_name: str
    email: Optional[EmailStr] = None
    password: str
    first_password: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None


class SheetUserImportRequest(BaseModel):
    users: List[SheetUserCreate]
