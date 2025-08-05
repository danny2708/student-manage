from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class TeacherBase(BaseModel):
    full_name: str = Field(..., example="Tran Van C")
    email: EmailStr = Field(..., example="tran.c@school.com")
    phone_number: Optional[str] = Field(None, example="0901234567")

class TeacherCreate(TeacherBase):
    user_id: int = Field(..., example=5)

class TeacherUpdate(TeacherBase):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    user_id: Optional[int] = None

class Teacher(TeacherBase):
    teacher_id: int = Field(..., example=1)
    user_id: int = Field(..., example=5)

    class Config:
        from_attributes = True