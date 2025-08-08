from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema cơ sở cho Teacher
class TeacherBase(BaseModel):
    user_id: int
    subject_id: Optional[int] = None  # Giả sử giáo viên có thể dạy một môn học cụ thể
    created_at: datetime = Field(..., example="2023-10-26T14:30:00")

# Schema để tạo Teacher mới
class TeacherCreate(TeacherBase):
    pass

# Schema để đọc/trả về Teacher hoàn chỉnh
class Teacher(TeacherBase):
    id: int

    class Config:
        from_attributes = True

# Schema để cập nhật Teacher
class TeacherUpdate(BaseModel):
    user_id: Optional[int] = None
    subject_id: Optional[int] = None
    created_at: Optional[datetime] = None
