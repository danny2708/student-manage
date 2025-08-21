# app/schemas/teacher_review_schema.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema cơ sở cho các trường dữ liệu do người dùng cung cấp
class TeacherReviewBase(BaseModel):
    teacher_id: int
    student_id: int
    rating: float = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    review_text: Optional[str] = Field(None, description="Student's review comment")

# Schema to create a new TeacherReview. Inherits from TeacherReviewBase
# Does not include review_id or review_date as they are auto-generated
class TeacherReviewCreate(TeacherReviewBase):
    pass

# Complete schema for TeacherReview, including auto-generated fields
class TeacherReview(TeacherReviewBase):
    review_id: int
    review_date: datetime

    class Config:
        from_attributes = True

# Schema to update a TeacherReview
class TeacherReviewUpdate(BaseModel):
    rating: Optional[float] = Field(None, ge=1, le=5)
    review_text: Optional[str] = None
