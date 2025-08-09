from pydantic import BaseModel, Field
from typing import Optional
# Schema cơ sở cho Student
class StudentBase(BaseModel):
    user_id: int
    student_id: int

# Schema để tạo Student mới
class StudentCreate(StudentBase):
    pass

# Schema để đọc/trả về Student hoàn chỉnh
class Student(StudentBase):
    id: int

    class Config:
        from_attributes = True

# Schema để cập nhật Student
class StudentUpdate(BaseModel):
    user_id: Optional[int] = None
    student_id: Optional[int] = None
