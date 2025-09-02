# app/schemas/student_schema.py

from pydantic import BaseModel
from typing import Optional

class StudentBase(BaseModel):
    user_id: int
    parent_id: Optional[int] = None   # ✅ để Optional, không bắt buộc khi tạo

    class Config:
        from_attributes = True

class StudentCreate(BaseModel):
    user_id: int
    parent_id: Optional[int] = None   # ✅ cho phép để trống

    class Config:
        from_attributes = True

class StudentUpdate(BaseModel):
    parent_id: Optional[int] = None   # ✅ chỉ cập nhật parent_id

    class Config:
        from_attributes = True

class Student(StudentBase):
    student_id: int

    class Config:
        from_attributes = True

class StudentAssign(BaseModel):
    user_id: int
