from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class TestBase(BaseModel):
    test_name: str = Field(..., example="Bài kiểm tra giữa kỳ")
    student_user_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    subject_id: int = Field(..., example=2)
    teacher_user_id: int = Field(..., example=5)
    score: float = Field(..., example=8.5)
    exam_date: date = Field(..., example="2024-05-20")

class TestCreate(BaseModel):
    test_name: str = Field(..., example="Bài kiểm tra giữa kỳ")
    student_user_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    score: float = Field(..., example=8.5)
    exam_date: date = Field(..., example="2024-05-20")

class TestUpdate(BaseModel):
    test_name: Optional[str] = None
    score: Optional[float] = None
    exam_date: Optional[date] = None

class Test(TestBase):
    test_id: int

    class Config:
        from_attributes = True
