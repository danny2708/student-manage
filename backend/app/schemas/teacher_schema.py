from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class TeacherBase(BaseModel):
    """
    Schema cơ sở cho Giáo viên, chứa các trường dùng chung.
    """
    user_id: int
    base_salary_per_class: float
    reward_bonus: float

    class Config:
        from_attributes = True

class TeacherCreate(TeacherBase):
    """
    Schema cho việc tạo một Giáo viên mới.
    Thừa kế từ TeacherBase nên đã có đầy đủ các trường.
    """
    pass

class TeacherUpdate(BaseModel):
    """
    Schema cho việc cập nhật thông tin Giáo viên.
    Các trường là tùy chọn (Optional).
    """
    base_salary_per_class: Optional[float] = None
    reward_bonus: Optional[float] = None

class Teacher(TeacherBase):
    """
    Schema cho mô hình Giáo viên đã hoàn chỉnh, bao gồm teacher_id.
    """
    teacher_id: int

    class Config:
        from_attributes = True

# Schema chỉ nhận user_id để gán vai trò
# Đây là schema phù hợp với một endpoint chỉ gán vai trò,
# nhưng endpoint của bạn cũng tạo bản ghi mới nên cần TeacherCreate.
class TeacherAssign(BaseModel):
    """
    Schema chỉ dùng để gán vai trò Giáo viên, chỉ cần user_id.
    """
    user_id: int
