from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class AttendanceBase(BaseModel):
    student_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    date: date = Field(..., example="2023-10-26")
    status: str = Field(..., example="Present", description="Trạng thái: Present, Absent, Late")

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(AttendanceBase):
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    date: Optional[date] = None
    status: Optional[str] = None

class Attendance(AttendanceBase):
    attendance_id: int = Field(..., example=1)

    class Config:
        from_attributes = True