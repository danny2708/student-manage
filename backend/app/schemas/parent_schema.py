from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class ParentBase(BaseModel):
    full_name: str = Field(..., example="Pham Thi D")
    email: EmailStr = Field(..., example="pham.d@example.com")
    phone_number: Optional[str] = Field(None, example="0912345678")

class ParentCreate(ParentBase):
    user_id: int = Field(..., example=6)

class ParentUpdate(ParentBase):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    user_id: Optional[int] = None

class Parent(ParentBase):
    parent_id: int = Field(..., example=1)
    user_id: int = Field(..., example=6)

    class Config:
        from_attributes = True