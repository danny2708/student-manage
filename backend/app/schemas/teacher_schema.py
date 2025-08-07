from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, EmailStr

# Lớp cơ sở chứa các thuộc tính chung cho giáo viên
class TeacherBase(BaseModel):
    full_name: str = Field(..., example="Tran Van C")
    email: EmailStr = Field(..., example="tran.c@school.com")
    phone_number: Optional[str] = Field(None, example="0901234567")
    # Thêm trường date_of_birth
    date_of_birth: Optional[date] = Field(None, example="1985-05-15")
    
# Lớp dùng để tạo giáo viên mới, có thêm user_id
class TeacherCreate(TeacherBase):
    # Lưu ý: user_id thường được tạo ra ở backend sau khi User được tạo,
    # nhưng nếu bạn muốn nó là một phần của yêu cầu, bạn có thể để lại
    user_id: str = Field(..., example="4e3f1a23-4b6c-4d7e-8f9a-0b1c2d3e4f5a")

# Lớp dùng để cập nhật thông tin giáo viên, tất cả các trường đều là Optional
class TeacherUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    # user_id không nên cập nhật, nên ta sẽ bỏ nó đi hoặc giữ lại như optional
    # user_id: Optional[str] = None

# Lớp đại diện cho model Teacher hoàn chỉnh, bao gồm cả ID
class Teacher(TeacherBase):
    teacher_id: str = Field(..., example="a1b2c3d4-e5f6-7g8h-9i0j-1k2l3m4n5o6p")
    user_id: str = Field(..., example="4e3f1a23-4b6c-4d7e-8f9a-0b1c2d3e4f5a")

    class Config:
        from_attributes = True
