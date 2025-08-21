from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional, List
from datetime import date as dt_date, time as dt_time

from app.models.schedule_model import Schedule, DayOfWeekEnum, ScheduleTypeEnum
from app.models.class_model import Class
from app.models.association_tables import student_class_association
from app.schemas.schedule_schema import ScheduleCreate, ScheduleUpdate

def get_schedule(db: Session, schedule_id: int) -> Optional[Schedule]:
    """
    Lấy một lịch trình cụ thể dựa trên schedule_id.
    """
    return db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()

def get_all_schedules(db: Session) -> List[Schedule]:
    """
    Lấy tất cả các lịch trình.
    """
    return db.query(Schedule).all()

def get_schedules_by_class_id(db: Session, class_id: int) -> List[Schedule]:
    """
    Lấy tất cả các lịch trình thuộc về một class cụ thể.
    """
    return db.query(Schedule).filter(Schedule.class_id == class_id).all()

def search_schedules(
    db: Session,
    class_id: Optional[int] = None,
    day_of_week: Optional[DayOfWeekEnum] = None,
    schedule_type: Optional[ScheduleTypeEnum] = None,
    date: Optional[dt_date] = None
) -> List[Schedule]:
    """
    Tìm kiếm và lọc các lịch trình dựa trên nhiều tiêu chí.
    """
    query = db.query(Schedule)
    
    # Lọc theo class_id nếu có
    if class_id is not None:
        query = query.filter(Schedule.class_id == class_id)
        
    # Lọc theo các tiêu chí khác
    if schedule_type is not None:
        query = query.filter(Schedule.schedule_type == schedule_type)
        if schedule_type == ScheduleTypeEnum.WEEKLY and day_of_week is not None:
            query = query.filter(Schedule.day_of_week == day_of_week)
        elif schedule_type == ScheduleTypeEnum.ONE_OFF and date is not None:
            query = query.filter(Schedule.date == date)
    else:
        # Nếu không có schedule_type được chỉ định, lọc theo các tiêu chí sẵn có
        if day_of_week is not None:
            query = query.filter(Schedule.day_of_week == day_of_week)
        if date is not None:
            query = query.filter(Schedule.date == date)
            
    return query.all()

def create_schedule(db: Session, schedule: ScheduleCreate) -> Schedule:
    """
    Tạo một lịch trình mới.
    """
    db_schedule = Schedule(**schedule.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def update_schedule(db: Session, schedule_id: int, schedule_update: ScheduleUpdate) -> Optional[Schedule]:
    """
    Cập nhật một lịch trình hiện có dựa trên schedule_id.
    """
    db_schedule = get_schedule(db, schedule_id)
    if not db_schedule:
        return None
    
    update_data = schedule_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_schedule, field, value)
    
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def delete_schedule(db: Session, schedule_id: int) -> Optional[Schedule]:
    """
    Xóa một lịch trình dựa trên schedule_id.
    """
    db_schedule = get_schedule(db, schedule_id)
    if db_schedule:
        db.delete(db_schedule)
        db.commit()
    return db_schedule

def get_schedules_by_class_ids(db: Session, class_ids: List[int]) -> List[Schedule]:
    """
    Lấy tất cả lịch trình dựa trên danh sách class_id.
    """
    return db.query(Schedule).filter(Schedule.class_id.in_(class_ids)).all()

def get_classes_by_teacher_id(db: Session, teacher_id: int) -> List[Class]:
    """
    Lấy danh sách các lớp học của một giáo viên cụ thể.
    """
    return db.query(Class).filter(Class.teacher_id == teacher_id).all()

def get_student_class_ids(db: Session, student_id: int) -> List[int]:
    """
    Lấy danh sách các class_id mà sinh viên đang học, sử dụng bảng liên kết.
    """
    stmt = select(student_class_association.c.class_id).where(
        student_class_association.c.student_id == student_id
    )
    result = db.execute(stmt).scalars().all()
    return result
