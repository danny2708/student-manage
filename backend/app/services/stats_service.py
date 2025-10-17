from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from app.models.class_model import Class
from app.models.teacher_model import Teacher
from app.models.student_model import Student
from app.models.schedule_model import Schedule
from app.schemas.stats_schema import Stats


def get_stats(db: Session) -> Stats:
    """
    Truy vấn cơ sở dữ liệu và trả về các số liệu thống kê.

    Args:
        db (Session): Phiên làm việc với cơ sở dữ liệu.

    Returns:
        Stats: Một đối tượng Pydantic chứa các số liệu thống kê.
    """
    # Đếm tổng số lớp học
    total_classes = db.query(func.count(Class.class_id)).scalar()
    
    # Đếm tổng số giáo viên
    total_teachers = db.query(func.count(Teacher.user_id)).scalar()
    
    # Đếm tổng số học sinh
    total_students = db.query(func.count(Student.user_id)).scalar()
    
    # Đếm tổng số lịch học trong ngày hôm nay
    # datetime.date.today() cần được import
    from datetime import date
    total_schedules = db.query(func.count(Schedule.schedule_id)).scalar()

    # Tạo một dictionary từ các kết quả truy vấn
    stats_data = {
        "total_classes": total_classes,
        "total_teachers": total_teachers,
        "total_students": total_students,
        "total_schedules": total_schedules,
    }
    
    # Chuyển đổi dictionary thành đối tượng Pydantic Stats
    return Stats(**stats_data)