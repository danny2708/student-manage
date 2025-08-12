from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema cơ sở cho TeacherReview
class TeacherReviewBase(BaseModel):
    teacher_id: int
    student_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating từ 1 đến 5 sao")
    review_text: Optional[str] = Field(None, description="Nhận xét của học sinh")
    created_at: datetime = Field(..., example="2023-10-26T14:30:00")

# Schema để tạo TeacherReview mới
class TeacherReviewCreate(TeacherReviewBase):
    pass

# Schema để đọc/trả về TeacherReview hoàn chỉnh
class TeacherReview(TeacherReviewBase):
    review_id: int

    class Config:
        from_attributes = True

# Schema để cập nhật TeacherReview
class TeacherReviewUpdate(BaseModel):
    teacher_id: Optional[int] = None
    student_id: Optional[int] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = None
    created_at: Optional[datetime] = None
