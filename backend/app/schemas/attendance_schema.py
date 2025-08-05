# app/schemas/attendance.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class AttendanceBase(BaseModel):
    student_id: int = Field(..., example=1)
    class_id: int = Field(..., example=1)
    attendance_date: date = Field(..., example="2023-10-26", alias="date") # Đổi tên trường và thêm alias
    status: str = Field(..., example="Present", description="Trạng thái: Present, Absent, Late")

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(AttendanceBase):
    student_id: Optional[int] = None
    class_id: Optional[int] = None
    attendance_date: Optional[date] = None # Cập nhật tên trường
    status: Optional[str] = None

class Attendance(AttendanceBase):
    attendance_id: int = Field(..., example=1)
    # Không cần alias ở đây vì nó là output, nhưng giữ tên nhất quán.

    class Config:
        from_attributes = True

