from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class StudentClassBase(BaseModel):
    student_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    joined_at: datetime = Field(..., example="2023-09-01T08:00:00")

class StudentClassCreate(StudentClassBase):
    pass

class StudentClassUpdate(StudentClassBase):
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    joined_at: Optional[datetime] = None

class StudentClass(StudentClassBase):
    studentclass_id: int = Field(..., example=1)

    class Config:
        from_attributes = True

