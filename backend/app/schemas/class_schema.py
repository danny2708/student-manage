from pydantic import BaseModel, Field
from typing import Optional

class ClassBase(BaseModel):
    class_name: str = Field(..., example="10A1")
    teacher_id: int = Field(..., example=1, description="ID của giáo viên chủ nhiệm")

class ClassCreate(ClassBase):
    pass

class ClassUpdate(ClassBase):
    class_name: Optional[str] = None
    teacher_id: Optional[int] = None

class Class(ClassBase):
    class_id: int = Field(..., example=1)

    class Config:
        from_attributes = True
