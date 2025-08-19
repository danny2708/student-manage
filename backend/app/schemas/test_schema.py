from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# Định nghĩa mô hình cơ sở với tất cả các trường
# Trừ test_id vì nó được tạo tự động bởi database
class TestBase(BaseModel):
    test_name: str = Field(..., example="Bài kiểm tra giữa kỳ")
    student_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    subject_id: int = Field(..., example=1)
    teacher_id: int = Field(..., example=1)
    score: float = Field(..., example=8.5)
    exam_date: date = Field(..., example="2024-05-20")

# Mô hình dùng để tạo bản ghi mới (Create)
# Kế thừa từ TestBase, không cần trường test_id
class TestCreate(TestBase):
    pass

# Mô hình dùng để cập nhật bản ghi (Update)
# Tất cả các trường là tùy chọn (Optional)
class TestUpdate(BaseModel):
    test_name: Optional[str] = None
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    score: Optional[float] = None
    exam_date: Optional[date] = None

# Mô hình dùng để trả về dữ liệu từ database (Read)
# Bao gồm test_id và các trường từ TestBase
class Test(TestBase):
    test_id: int = Field(..., example=1)

    class Config:
        # Cấu hình để cho phép chuyển đổi từ mô hình SQLAlchemy
        from_attributes = True
