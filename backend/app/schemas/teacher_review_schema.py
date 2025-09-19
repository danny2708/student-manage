# app/schemas/teacher_review_schema.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema cơ sở cho các trường dữ liệu do người dùng cung cấp
class TeacherReviewBase(BaseModel):
    teacher_user_id: int
    rating: float = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    review_content: Optional[str] = Field(None, description="Student's review comment")

class TeacherReviewCreate(TeacherReviewBase):
    pass

# Schema đầy đủ cho TeacherReview (bao gồm các trường auto-generated)
class TeacherReview(TeacherReviewBase):
    review_id: int
    student_user_id: int
    review_date: datetime

    class Config:
        from_attributes = True

# Schema để cập nhật TeacherReview
class TeacherReviewUpdate(BaseModel):
    rating: Optional[float] = Field(None, ge=1, le=5)
    review_content: Optional[str] = None

class TeacherReviewView(BaseModel):
    id: int
    teacher_name: str
    student_name: str
    rating: float
    review_date: datetime
    review_content: Optional[str]
    
    class Config:
        from_attributes = True