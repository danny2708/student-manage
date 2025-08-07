# app/schemas/register_schema.py
from datetime import date
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# --- 1. Schemas cho User cơ bản ---
class UserBase(BaseModel):
    username: str
    password: str
    email: EmailStr

class UserInfo(UserBase):
    role: str

# --- 2. Schemas cho các vai trò chi tiết ---
# Loại bỏ trường 'role'
class StaffCreate(BaseModel):
    full_name: str
    date_of_birth: Optional[date] = None

class TeacherCreate(BaseModel):
    full_name: str
    date_of_birth: Optional[date] = None
    subject: Optional[str] = None

class ManagerCreate(BaseModel):
    full_name: str
    date_of_birth: Optional[date] = None

class StudentCreate(BaseModel):
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    class_id: Optional[int] = None

class ParentCreate(BaseModel):
    full_name: str
    date_of_birth: Optional[date] = None
    phone_number: Optional[str] = None


# --- 3. Schemas cho các yêu cầu đăng ký (Register Requests) ---
# Endpoint 1: Đăng ký một người dùng duy nhất
class RegisterRequest(BaseModel):
    user_info: UserInfo
    role_info: Optional[
        StaffCreate | TeacherCreate | ManagerCreate | StudentCreate | ParentCreate
    ] = None

# Endpoint 2: Đăng ký phụ huynh và con cùng lúc (Đã Hợp nhất)
class ParentAndChildrenRequest(BaseModel):
    username: str
    password: str
    email: EmailStr
    full_name: str
    date_of_birth: Optional[date] = None
    phone_number: Optional[str] = None
    children_info: List[StudentCreate]

# Endpoint 3: Liên kết học sinh với phụ huynh đã có
class RegisterStudentWithParentRequest(BaseModel):
    parent_user_id: int
    student_info: StudentCreate
