# app/schemas/attendance_schema.py
from pydantic import BaseModel
from datetime import date, time
from typing import List, Optional
from app.models.attendance_model import AttendanceStatus

class AttendanceCreate(BaseModel):
    student_id: int
    class_id: int
    status: AttendanceStatus
    checkin_time: Optional[time] = None

class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    checkin_time: Optional[time] = None

class AttendanceRead(AttendanceCreate):
    attendance_id: int
    attendance_date: date

    class Config:
        from_attributes = True

class AttendanceInitialRecord(BaseModel):
    student_id: int
    status: AttendanceStatus
    checkin_time: Optional[time] = None

# Lớp này mô tả một bản ghi điểm danh duy nhất trong request
class AttendanceRecordCreate(BaseModel):
    student_id: int
    status: AttendanceStatus
    checkin_time: Optional[time] = None
    attendance_date: date
    
class AttendanceUpdateLate(BaseModel):
    checkin_time: time
    attendance_date: date
    
class AttendanceBatchCreate(BaseModel):
    class_id: int
    attendance_date: date
    records: List[AttendanceInitialRecord]