from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class TeacherBase(BaseModel):
    """
    Schema cơ sở cho Giáo viên, chứa các trường dùng chung.
    """
    user_id: int
    base_salary_per_class:  Optional[float]
    reward_bonus:  Optional[float]

    class Config:
        from_attributes = True

class TeacherCreate(TeacherBase):
    """
    Schema cho việc tạo một Giáo viên mới.
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
    user_id: int

    class Config:
        from_attributes = True

class TeacherAssign(BaseModel):
    """
    Schema chỉ dùng để gán vai trò Giáo viên, chỉ cần teacher_user_id.
    """
    user_id: int

class ClassTaught(BaseModel):
    class_id: int
    class_name: str 
    teacher_name: Optional[str] 
    subject_name: Optional[str] 
    capacity: Optional[int]
    fee: Optional[int] 