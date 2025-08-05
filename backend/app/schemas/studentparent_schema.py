from pydantic import BaseModel, Field
from typing import Optional

class StudentParentBase(BaseModel):
    student_id: int = Field(..., example=1)
    parent_id: int = Field(..., example=1)

class StudentParentCreate(StudentParentBase):
    pass

class StudentParentUpdate(StudentParentBase):
    student_id: Optional[int] = None
    parent_id: Optional[int] = None

class StudentParent(StudentParentBase):
    studentparent_id: int = Field(..., example=1)

    class Config:
        from_attributes = True