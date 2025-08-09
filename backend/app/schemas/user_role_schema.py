"""user_role_schema"""
from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import date

# Import các schema cần thiết từ các module khác
from .user_schema import UserCreate
from .teacher_schema import TeacherCreate
from .staff_schema import StaffCreate
from .student_schema import StudentCreate, StudentUpdate
from .parent_schema import ParentCreate, ParentUpdate


# ----------------- Base schemas for User and Role -----------------

class UserBase(BaseModel):
    """
    Schema cơ sở cho người dùng.
    """
    username: str
    fullname: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[bool] = None
    address: Optional[str] = None

class RoleBase(BaseModel):
    """
    Schema cơ sở cho vai trò (Role).
    """
    role_name: str

class RoleCreate(RoleBase):
    """
    Schema để tạo một vai trò mới.
    """
    pass

class UserRoleInDB(RoleBase):
    """
    Schema cho vai trò khi được đọc từ cơ sở dữ liệu.
    """
    role_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------------- User and Role relationship schemas -----------------

class StudentCreateWithUser(BaseModel):
    """
    Schema kết hợp để tạo Student và User cùng lúc.
    """
    user_data: UserCreate
    student_data: StudentCreate

class StudentUpdate(BaseModel):
    """
    Schema để cập nhật thông tin sinh viên.
    """
    student_data: StudentUpdate

class ParentCreateWithUser(BaseModel):
    """
    Schema kết hợp để tạo Parent và User cùng lúc.
    """
    user_data: UserCreate
    parent_data: ParentCreate

class ParentUpdate(BaseModel):
    """
    Schema để cập nhật thông tin phụ huynh.
    """
    parent_data: ParentUpdate

class StaffCreateWithUser(BaseModel):
    """
    Schema kết hợp để tạo Staff và User cùng lúc.
    """
    user_data: UserCreate
    staff_data: StaffCreate

class ManagerCreateWithUser(UserBase):
    """
    Schema để tạo một quản lý mới cùng với thông tin người dùng.
    """
    password: str

class TeacherCreateWithUser(BaseModel):
    """
    Schema kết hợp để tạo Teacher và User cùng lúc.
    """
    user_data: UserCreate
    teacher_data: TeacherCreate
