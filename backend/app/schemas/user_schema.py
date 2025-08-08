from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., example="john_doe")
    email: Optional[str] = Field(None, example="john.doe@example.com")
    full_name: Optional[str] = Field(None, example="John Doe")

class UserCreate(UserBase):
    password: str = Field(..., example="verysecretpassword")

class UserUpdate(UserBase):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int = Field(..., example=1)
    created_at: datetime
    
    class Config:
        from_attributes = True