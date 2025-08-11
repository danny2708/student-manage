# app/schemas/teacher_schema.py
from datetime import datetime
from pydantic import BaseModel

class TeacherBase(BaseModel):
    user_id: int

    class Config:
        from_attributes = True
        
class TeacherCreate(TeacherBase):
    user_id: int

class TeacherUpdate(BaseModel):
    user_id: int | None = None

class Teacher(TeacherBase):
    teacher_id: int
    user_id: int

    class Config:
        from_attributes = True
        
# Schema chỉ nhận user_id
class TeacherAssign(BaseModel):
    user_id: int
