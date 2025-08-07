# app/schemas/student.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# 1. StudentBase: Các trường chung cơ bản
class StudentBase(BaseModel):
    full_name: str = Field(..., example="Nguyen Van E")
    date_of_birth: date = Field(..., example="2010-05-20")
    gender: str = Field(..., example="Male")

# 2. StudentCreate: Kế thừa StudentBase và thêm các trường cần thiết khi TẠO mới
# user_id là trường bắt buộc khi tạo, vì student phải được liên kết với một user
# class_id là tùy chọn, vì học sinh có thể chưa được xếp lớp ngay
class StudentCreate(StudentBase):
    user_id: int = Field(..., example=7, description="ID của user liên kết với student")
    class_id: Optional[int] = Field(None, example=1, description="ID của lớp hiện tại của học sinh")

# 3. StudentUpdate: Kế thừa StudentBase nhưng tất cả các trường đều là TÙY CHỌN
# Điều này cho phép client chỉ gửi các trường cần cập nhật, giúp linh hoạt hơn
# Lưu ý: user_id không nên được cập nhật, vì mối quan hệ 1-1 không thay đổi
class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    class_id: Optional[int] = None
    
# 4. Student: Schema hiển thị đầy đủ thông tin của student từ DB
# Bao gồm cả khóa chính (student_id) và khóa ngoại (user_id)
# Các mối quan hệ (ví dụ: thông tin user, class) có thể được lồng vào đây nếu cần
class Student(StudentBase):
    student_id: int = Field(..., example=1)
    user_id: int = Field(..., example=7)
    class_id: Optional[int] = None

    class Config:
        # Tùy chỉnh này cho phép mô hình Pydantic đọc các thuộc tính từ các đối tượng ORM (như SQLAlchemy)
        from_attributes = True

# 5. StudentInDB: Một schema riêng để hiển thị chi tiết hơn từ DB
# Có thể thêm các mối quan hệ nếu bạn muốn trả về toàn bộ thông tin user hoặc class
# Ví dụ:
# from .user import User
# from .class import Class
# class StudentInDB(Student):
#     user: User
#     class: Optional[Class]
