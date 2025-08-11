from pydantic import BaseModel, Field
from typing import Optional

class ClassBase(BaseModel):
    class_name: str = Field(..., example="Class 1A")
    teacher_id: Optional[int] = Field(None, example=1)
    subject_id: Optional[int] = Field(None, example=1)

class ClassCreate(ClassBase):
    pass

class ClassUpdate(ClassBase):
    name: Optional[str] = None
    teacher_id: Optional[int] = None
    subject_id: Optional[int] = None

class Class(ClassBase):
    class_id: int = Field(..., example=1)

    class Config:
        from_attributes = True
