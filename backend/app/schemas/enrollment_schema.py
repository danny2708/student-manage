from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class EnrollmentBase(BaseModel):
    student_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    enrolled_at: datetime = Field(..., example="2023-09-01T09:00:00")

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentUpdate(EnrollmentBase):
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    enrolled_at: Optional[datetime] = None

class Enrollment(EnrollmentBase):
    enrollment_id: int = Field(..., example=1)

    class Config:
        from_attributes = True