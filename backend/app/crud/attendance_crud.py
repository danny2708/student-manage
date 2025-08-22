# app/crud/attendance_crud.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import insert, and_, select
from sqlalchemy.exc import IntegrityError
from app.models.student_model import Student
from app.models.attendance_model import Attendance
from app.schemas.attendance_schema import AttendanceBatchCreate, AttendanceRecordCreate
from datetime import datetime

def create_initial_attendance_records(db: Session, attendance_data: AttendanceBatchCreate) -> List[Attendance]:
    """
    Tạo bản ghi điểm danh ban đầu cho tất cả học sinh trong một lớp.
    Đã cập nhật để xử lý lỗi IntegrityError.
    """
    try:
        student_ids_to_create = [record.student_id for record in attendance_data.records or []]

        existing_students = db.query(Student).filter(
            Student.student_id.in_(student_ids_to_create)
        ).all()
        existing_student_ids = {student.student_id for student in existing_students}

        non_existent_ids = [s_id for s_id in student_ids_to_create if s_id not in existing_student_ids]
        if non_existent_ids:
            raise ValueError(f"Students with ids {non_existent_ids} not found.")

        attendance_records = []
        for record in attendance_data.records:
            attendance_records.append({
                "class_id": attendance_data.class_id,
                "attendance_date": attendance_data.attendance_date,
                "status": record.status.value,
                "checkin_time": record.checkin_time,
                "student_id": record.student_id
            })

        stmt = insert(Attendance).values(attendance_records).returning(Attendance)
        result = db.execute(stmt).scalars().all()
        db.commit()
        return result
    except IntegrityError:
        db.rollback()
        raise ValueError("Một hoặc nhiều bản ghi điểm danh đã tồn tại. Không thể tạo bản ghi trùng lặp.")
    except Exception as e:
        db.rollback()
        raise e

def get_attendance_record_by_student_and_date(db: Session, student_id: int, class_id: int, date: str):
    """
    Lấy bản ghi điểm danh của một học sinh vào một ngày cụ thể.
    """
    stmt = select(Attendance).where(
        and_(
            Attendance.student_id == student_id,
            Attendance.class_id == class_id,
            Attendance.attendance_date == date
        )
    )
    result = db.execute(stmt).scalar_one_or_none()
    return result

def update_attendance_record(db: Session, student_id: int, class_id: int, date: str, update_data: AttendanceRecordCreate):
    """
    Cập nhật bản ghi điểm danh.
    """
    db_record = get_attendance_record_by_student_and_date(db, student_id, class_id, date)
    if not db_record:
        return None
    
    db_record.status = update_data.status.value
    db_record.checkin_time = update_data.checkin_time

    db.commit()
    db.refresh(db_record)
    return db_record
