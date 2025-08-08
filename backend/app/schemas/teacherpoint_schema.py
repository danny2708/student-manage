from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime  # Giữ nguyên datetime để bao gồm cả ngày và giờ

# Schema cơ sở cho TeacherPoint
class TeacherPointBase(BaseModel):
    teacher_id: int
    student_id: int
    points: int
    created_at: datetime = Field(..., example="2023-10-26T14:30:00") # Đã đổi tên trường từ 'date' thành 'created_at'

# Schema để tạo TeacherPoint mới
class TeacherPointCreate(TeacherPointBase):
    pass

# Schema để đọc/trả về TeacherPoint hoàn chỉnh
class TeacherPoint(TeacherPointBase):
    id: int

    class Config:
        from_attributes = True

# Schema để cập nhật TeacherPoint
class TeacherPointUpdate(BaseModel):
    teacher_id: Optional[int] = None
    student_id: Optional[int] = None
    points: Optional[int] = None
    created_at: Optional[datetime] = None # Đã đổi tên trường
