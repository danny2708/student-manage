from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class StudentBase(BaseModel):
    full_name: str = Field(..., example="Nguyen Van E")
    date_of_birth: date = Field(..., example="2010-05-20")
    gender: str = Field(..., example="Male")
    class_id: Optional[int] = Field(None, example=1, description="ID của lớp hiện tại của học sinh") 
    
class StudentCreate(StudentBase):
    user_id: int = Field(..., example=7)

class StudentUpdate(StudentBase):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    class_id: Optional[int] = None
    user_id: Optional[int] = None

class Student(StudentBase):
    student_id: int = Field(..., example=1)
    user_id: int = Field(..., example=7)

    class Config:
        from_attributes = True