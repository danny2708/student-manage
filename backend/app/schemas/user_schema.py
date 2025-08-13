from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date, datetime

class UserBase(BaseModel):
    username: str = Field(..., example="john_doe")
    email: Optional[EmailStr] = Field(None, example="john.doe@example.com")
    full_name: Optional[str] = Field(None, example="John Doe")
    date_of_birth: Optional[date] = Field(None, example="1990-01-01")
    gender: Optional[str] = Field(None, example="Male")
    phone_number: Optional[str] = Field(None, example="0901234567")

class UserCreate(UserBase):
    password: str = Field(..., example="verysecretpassword")

class UserUpdate(UserBase):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    # Thay đổi 'id' thành 'user_id' để khớp với database
    user_id: int = Field(..., example=1)
    
    class Config:
        from_attributes = True

class SheetUserCreate(BaseModel):
    username: str
    full_name: str
    email: EmailStr