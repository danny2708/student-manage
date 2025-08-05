from pydantic import BaseModel, Field
from typing import Optional

class SubjectBase(BaseModel):
    subject_name: str = Field(..., example="Mathematics")
    teacher_id: int = Field(..., example=1)

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(SubjectBase):
    subject_name: Optional[str] = None
    teacher_id: Optional[int] = None

class Subject(SubjectBase):
    subject_id: int = Field(..., example=1)

    class Config:
        from_attributes = True