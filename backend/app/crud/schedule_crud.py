# backend/app/crud/schedule_crud.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional, List
from datetime import date as dt_date

from app.models.schedule_model import Schedule, DayOfWeekEnum, ScheduleTypeEnum
from app.models.class_model import Class
from app.schemas.schedule_schema import ScheduleCreate, ScheduleUpdate
from app.models.enrollment_model import Enrollment

def get_schedule_by_id(db: Session, schedule_id: int) -> Optional[Schedule]:
    """
    Lấy một lịch trình cụ thể dựa trên schedule_id.
    """
    return db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()

def create_schedule(db: Session, schedule_in: ScheduleCreate) -> Schedule:
    """
    Tạo một lịch trình mới trong cơ sở dữ liệu.
    """
    db_schedule = Schedule(**schedule_in.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def update_schedule(db: Session, schedule: Schedule, schedule_in: ScheduleUpdate) -> Schedule:
    """
    Cập nhật một lịch trình hiện có.
    """
    update_data = schedule_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(schedule, field, value)
    db.commit()
    db.refresh(schedule)
    return schedule

def delete_schedule(db: Session, schedule: Schedule):
    """
    Xóa một lịch trình.
    """
    db.delete(schedule)
    db.commit()

def search_schedules(
    db: Session,
    class_id: Optional[int] = None,
    day_of_week: Optional[DayOfWeekEnum] = None,
    schedule_type: Optional[ScheduleTypeEnum] = None,
    date: Optional[dt_date] = None,
    room: Optional[str] = None
) -> List[Schedule]:
    """
    Tìm kiếm và lọc các lịch trình dựa trên nhiều tiêu chí tùy chọn.
    Đây là hàm tìm kiếm chính, thay thế cho các hàm get_schedules_by_class_id...
    """
    query = db.query(Schedule)
    
    # Áp dụng các bộ lọc dựa trên các tham số được cung cấp
    if class_id is not None:
        query = query.filter(Schedule.class_id == class_id)
    if day_of_week is not None:
        query = query.filter(Schedule.day_of_week == day_of_week)
    if schedule_type is not None:
        query = query.filter(Schedule.schedule_type == schedule_type)
    if date is not None:
        query = query.filter(Schedule.date == date)
    if room is not None:
        query = query.filter(Schedule.room == room)
        
    return query.all()
    
def get_classes_for_teacher(db: Session, teacher_user_id: int) -> List[Class]:
    """
    Lấy danh sách các lớp học của một giáo viên cụ thể.
    """
    return db.query(Class).filter(Class.teacher_user_id == teacher_user_id).all()

def get_class_ids_for_student(db: Session, student_user_id: int) -> List[int]:
    """
    Lấy danh sách các class_id mà sinh viên đang học.
    """
    stmt = select(Enrollment.c.class_id).where(
        Enrollment.c.student_user_id == student_user_id
    )
    result = db.execute(stmt).scalars().all()
    return result

def get_schedules_by_class_ids(db: Session, class_ids: List[int]) -> List[Schedule]:
    """
    Lấy tất cả các lịch trình thuộc danh sách class_id.
    """
    return db.query(Schedule).filter(Schedule.class_id.in_(class_ids)).all()

def get_classes_by_teacher_user_id(db: Session, teacher_user_id: int) -> List[Class]:
    """
    Lấy danh sách các lớp học của một giáo viên cụ thể.
    Đồng bộ tên hàm với service.
    """
    return db.query(Class).filter(Class.teacher_user_id == teacher_user_id).all()
