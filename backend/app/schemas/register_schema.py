from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

# Tạo một schema mới cho thông tin đăng ký user, có bao gồm 'role'
# Schema này sẽ thay thế UserLogin trong RegisterRequest
class UserRegistrationInfo(BaseModel):
    username: str = Field(..., example="john_doe")
    email: str = Field(..., example="johndoe@example.com")
    password: str = Field(..., example="super-secret-password")
    role: str = Field(..., example="teacher", description="Vai trò của người dùng (e.g., staff, teacher, manager, parent, student)")

class StudentRegistrationInfo(BaseModel):
    full_name: str = Field(..., example="Nguyen Van A")
    date_of_birth: date = Field(..., example="2010-01-01")
    gender: str = Field(..., example="Male")
    class_id: Optional[int] = Field(None, example=1, description="ID của lớp học, nếu có")

# Schema cho endpoint đăng ký một người dùng duy nhất
class RegisterRequest(BaseModel):
    user_info: UserRegistrationInfo  # Sử dụng schema đã có trường 'role'
    role_info: Optional[dict] = Field(None, description="Thông tin chi tiết theo vai trò (e.g., teacher_id, position)")

# Schema cho endpoint đăng ký phụ huynh và con
class ParentAndChildrenRequest(BaseModel):
    username: str = Field(..., example="parent_user")
    email: str = Field(..., example="parent@example.com")
    password: str = Field(..., example="super-secret-password")
    full_name: str = Field(..., example="Tran Thi B")
    date_of_birth: date = Field(..., example="1985-05-15")
    phone_number: str = Field(..., example="0912345678")
    children_info: List[StudentRegistrationInfo] = Field(..., description="Danh sách thông tin của các học sinh")

# Schema cho endpoint liên kết học sinh với phụ huynh đã có
class RegisterStudentWithParentRequest(BaseModel):
    parent_user_id: int = Field(..., example=1, description="ID của phụ huynh đã tồn tại")
    student_info: StudentRegistrationInfo
