from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class AttendanceBase(BaseModel):
    student_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    attendance_date: date = Field(..., example="2023-10-26")
    status: bool = Field(..., example=True, description="True: Có mặt, False: Vắng mặt")

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(AttendanceBase):
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    attendance_date: Optional[date] = None
    status: Optional[bool] = None

class Attendance(AttendanceBase):
    id: int = Field(..., example=1)

    class Config:
        from_attributes = True