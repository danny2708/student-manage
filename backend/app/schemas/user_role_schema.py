"""user_role_schema"""
from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime 
from .user_schema import UserCreate
from .teacher_schema import TeacherCreate
from .staff_schema import StaffCreate
from .student_schema import StudentCreate, StudentUpdate
from .parent_schema import ParentCreate, ParentUpdate


# ----------------- Base schemas for User and Role -----------------

class UserBase(BaseModel):
    """
    Schema c\u01A1 s\u1EDF cho ng\u01B0\u1EDDi d\u00F9ng.
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
    Schema c\u01A1 s\u1EDF cho vai tr\u00F2 (Role).
    """
    role_name: str

class RoleCreate(RoleBase):
    """
    Schema \u0111\u1EC3 t\u1EA1o m\u1ED9t vai tr\u00F2 m\u1EDBi.
    """
    pass

class UserRoleInDB(RoleBase):
    """
    Schema cho vai tr\u00F2 khi \u0111\u01B0\u1EE3c \u0111\u1ECDc t\u1EEB c\u01A1 s\u1EDF d\u1EEF li\u1EC7u.
    """
    role_id: int
    model_config = ConfigDict(from_attributes=True)

# ----------------- User and Role relationship schemas -----------------

# B\u1ED5 sung schema UserRoleCreate \u0111\u1EC3 s\u1EED d\u1EE5ng trong CRUD v\u00E0 API
class UserRoleCreate(BaseModel):
    """
    Schema \u0111\u1EC3 t\u1EA1o m\u1ED9t m\u1ED1i quan h\u1EC7 vai tr\u00F2 cho ng\u01B0\u1EDDi d\u00F9ng.
    """
    user_id: int
    role_name: str
    assigned_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class StudentCreateWithUser(BaseModel):
    """
    Schema k\u1EBFt h\u1EE3p \u0111\u1EC3 t\u1EA1o Student v\u00E0 User c\u00F9ng l\u00FAC.
    """
    user_data: UserCreate
    student_data: StudentCreate

class StudentUpdate(BaseModel):
    """
    Schema \u0111\u1EC3 c\u1EADp nh\u1EADt th\u00F4ng tin sinh vi\u00EAn.
    """
    student_data: StudentUpdate

class ParentCreateWithUser(BaseModel):
    """
    Schema k\u1EBFt h\u1EE3p \u0111\u1EC3 t\u1EA1o Parent v\u00E0 User c\u00F9ng l\u00FAC.
    """
    user_data: UserCreate
    parent_data: ParentCreate

class ParentUpdate(BaseModel):
    """
    Schema \u0111\u1EC3 c\u1EADp nh\u1EADt th\u00F4ng tin ph\u1EE5 huynh.
    """
    parent_data: ParentUpdate

class StaffCreateWithUser(BaseModel):
    """
    Schema k\u1EBFt h\u1EE3p \u0111\u1EC3 t\u1EA1o Staff v\u00E0 User c\u00F9ng l\u00FAC.
    """
    user_data: UserCreate
    staff_data: StaffCreate

class ManagerCreateWithUser(UserBase):
    """
    Schema \u0111\u1EC3 t\u1EA1o m\u1ED9t qu\u1EA3n l\u00FD m\u1EDBi c\u00F9ng v\u1EDBi th\u00F4ng tin ng\u01B0\u1EDDi d\u00F9ng.
    """
    password: str

class TeacherCreateWithUser(BaseModel):
    """
    Schema k\u1EBFt h\u1EE3p \u0111\u1EC3 t\u1EA1o Teacher v\u00E0 User c\u00F9ng l\u00FAC.
    """
    user_data: UserCreate
    teacher_data: TeacherCreate
