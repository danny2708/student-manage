from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TestBase(BaseModel):
    test_name: str = Field(..., example="Bài kiểm tra giữa kỳ")
    student_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    score: float = Field(..., example=8.5)
    exam_date: date = Field(..., example="2024-05-20")

class TestCreate(TestBase):
    pass

class TestUpdate(BaseModel):
    test_name: Optional[str] = None
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    score: Optional[float] = None
    exam_date: Optional[date] = None


# Mô hình dùng để trả về dữ liệu từ database (Read)
class Test(BaseModel):
    test_id: int
    test_name: str
    student_id: int
    class_id: int
    subject_id: int
    teacher_id: int
    score: float
    exam_date: date

    class Config:
        from_attributes = True
