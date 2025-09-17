from pydantic import BaseModel, Field
from typing import Optional

class ClassBase(BaseModel):
    class_name: str = Field(..., example="Class 1A")
    teacher_user_id: Optional[int] = Field(None, example=1)
    subject_id: Optional[int] = Field(None, example=1)
    capacity: Optional[int] = Field(None, example=30)
    fee: Optional[int] = Field(None, example=1000)

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    class_name: Optional[str] = Field(None, example="Class 1A")
    teacher_user_id: Optional[int] = Field(None, example=1)
    subject_id: Optional[int] = Field(None, example=1)
    capacity: Optional[int] = Field(None, example=30)
    fee: Optional[int] = Field(None, example=1000)

class Class(ClassBase):
    class_id: int = Field(..., example=1)

    class Config:
        from_attributes = True

class ClassView(BaseModel):
    class_id: int
    class_name: str 
    teacher_name: Optional[str] 
    subject_name: Optional[str] 
    capacity: Optional[int]
    fee: Optional[int] 
