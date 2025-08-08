from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema cơ sở cho Student
class StudentBase(BaseModel):
    user_id: int
    class_id: Optional[int] = None  # Giả sử học sinh thuộc một lớp học cụ thể
    created_at: datetime = Field(..., example="2023-10-26T14:30:00")

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
    class_id: Optional[int] = None
    created_at: Optional[datetime] = None
