from pydantic import BaseModel
from typing import Optional
from datetime import datetime  # Đã sửa date thành datetime

# Schema cơ sở cho TeacherPoint
class TeacherPointBase(BaseModel):
    teacher_id: int
    student_id: int
    points: int
    timestamp: datetime  # Đã đổi tên trường và sử dụng datetime

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
    timestamp: Optional[datetime] = None # datetime cũng là tùy chọn khi cập nhật
