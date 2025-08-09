from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class StudentClassAssociationBase(BaseModel):
    student_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    enrollment_date: date = Field(..., example="2023-10-26")
    status: str = Field(..., example="Active", description="Trạng thái: Active, Pending, Completed")

class StudentClassAssociationCreate(StudentClassAssociationBase):
    """Schema để tạo một liên kết mới giữa sinh viên và lớp học."""
    pass

class StudentClassAssociationUpdate(BaseModel):
    """Schema để cập nhật một liên kết giữa sinh viên và lớp học."""
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    enrollment_date: Optional[date] = None
    status: Optional[str] = None

class StudentClassAssociation(StudentClassAssociationBase):
    class Config:
        from_attributes = True
