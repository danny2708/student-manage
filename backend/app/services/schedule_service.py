from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional

from app.crud import schedule_crud
from app.schemas import schedule_schema
from app.models.schedule_model import Schedule, DayOfWeekEnum, ScheduleTypeEnum
from app.models.class_model import Class
from app.models.student_model import Student


def create_schedule(db: Session, schedule_in: schedule_schema.ScheduleCreate) -> Schedule:
    """
    Tạo một lịch học mới, có thể là lịch hàng tuần hoặc lịch đột xuất.
    
    Hàm này sử dụng schema ScheduleCreate để tạo đối tượng Schedule, đảm bảo
    tính nhất quán và an toàn dữ liệu.
    """
    return schedule_crud.create_schedule(db=db, schedule=schedule_in)


def get_schedules_by_class(db: Session, class_id: int) -> List[Schedule]:
    """
    Lấy tất cả lịch học của một lớp cụ thể.
    """
    return schedule_crud.search_schedules(db=db, class_id=class_id)


def get_schedules_for_teacher(db: Session, teacher_id: int) -> List[Schedule]:
    """
    Lấy tất cả lịch học của một giáo viên thông qua truy vấn trung gian class_id.
    """
    # Bước 1: Lấy danh sách class_id của giáo viên đó
    teacher_classes = db.query(Class.class_id).filter(Class.teacher_id == teacher_id).all()
    class_ids = [c[0] for c in teacher_classes]
    
    if not class_ids:
        return []

    # Bước 2: Lấy lịch học cho các class_id đó
    return db.query(Schedule).filter(Schedule.class_id.in_(class_ids)).all()


def get_schedules_for_student(db: Session, student_id: int) -> List[Schedule]:
    """
    Lấy tất cả lịch học của một học sinh thông qua truy vấn trung gian class_id.
    """
    # Bước 1: Lấy danh sách class_id của học sinh đó
    # Giả sử có bảng liên kết giữa Student và Class
    student_classes = db.query(Class.class_id).join(Student.classes).filter(Student.student_id == student_id).all()
    class_ids = [c[0] for c in student_classes]
    
    if not class_ids:
        return []

    # Bước 2: Lấy lịch học cho các class_id đó
    return db.query(Schedule).filter(Schedule.class_id.in_(class_ids)).all()


def search_schedules(
    db: Session,
    class_id: Optional[int] = None,
    day_of_week: Optional[DayOfWeekEnum] = None,
    schedule_type: Optional[ScheduleTypeEnum] = None,
    date: Optional[date] = None
) -> List[Schedule]:
    """
    Tìm kiếm và lọc các lịch trình dựa trên nhiều tiêu chí.
    """
    return schedule_crud.search_schedules(
        db=db,
        class_id=class_id,
        day_of_week=day_of_week,
        schedule_type=schedule_type,
        date=date
    )
