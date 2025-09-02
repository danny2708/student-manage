from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class StudentBase(BaseModel):
    """
    Schema cơ sở cho Giáo viên, chứa các trường dùng chung.
    """
    student_user_id: int
    parent_id: int

    class Config:
        from_attributes = True

class StudentCreate(StudentBase):
    """
    Schema cho việc tạo một Giáo viên mới.
    """
    pass

class StudentUpdate(BaseModel):
    """
    Schema cho việc cập nhật thông tin Giáo viên.
    Các trường là tùy chọn (Optional).
    """
    base_salary_per_class: Optional[float] = None
    reward_bonus: Optional[float] = None

class Student(StudentBase):
    """
    Schema cho mô hình Giáo viên đã hoàn chỉnh, bao gồm student_id.
    """
    student_id: int

    class Config:
        from_attributes = True

class StudentAssign(BaseModel):
    """
    Schema chỉ dùng để gán vai trò Giáo viên, chỉ cần Student_user_id.
    """
    student_user_id: int
