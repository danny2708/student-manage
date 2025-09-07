# backend/app/crud/schedule_crud.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional, List
from datetime import date as dt_date
from app.schemas import schedule_schema
from app.models.schedule_model import Schedule, DayOfWeekEnum, ScheduleTypeEnum
from app.models.class_model import Class
from app.schemas.schedule_schema import ScheduleCreate, ScheduleUpdate
from app.models.enrollment_model import Enrollment
from app.services import schedule_service

def get_schedule_by_id(db: Session, schedule_id: int) -> Optional[Schedule]:
    """
    Lấy một lịch trình cụ thể dựa trên schedule_id.
    """
    return db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()

def create_schedule(db: Session, schedule_in: ScheduleCreate, current_user):
    if not any(role in ["manager", "teacher"] for role in current_user.roles):
        raise PermissionError("Bạn không có quyền tạo lịch.")

    schedule_service.check_schedule_conflict(
        db=db,
        class_id=schedule_in.class_id,
        day_of_week=schedule_in.day_of_week,
        start_time=schedule_in.start_time,
        end_time=schedule_in.end_time,
        date=schedule_in.date,
        room=schedule_in.room,
        exclude_schedule_id=None   # create => không cần loại trừ
    )

    db_schedule = Schedule(**schedule_in.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def update_schedule(db: Session, schedule: Schedule, schedule_in: ScheduleUpdate) -> Schedule:
    update_data = schedule_in.model_dump(exclude_unset=True)

    class_id = update_data.get("class_id", schedule.class_id)
    day_of_week = update_data.get("day_of_week", schedule.day_of_week)
    start_time = update_data.get("start_time", schedule.start_time)
    end_time = update_data.get("end_time", schedule.end_time)
    date = update_data.get("date", schedule.date)
    room = update_data.get("room", schedule.room)

    schedule_service.check_schedule_conflict(
        db=db,
        class_id=class_id,
        day_of_week=day_of_week,
        start_time=start_time,
        end_time=end_time,
        date=date,
        room=room,
        exclude_schedule_id=schedule.schedule_id   # update => bỏ qua chính nó
    )

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
    class_ids: Optional[List[int]] = None,
    day_of_week: Optional[DayOfWeekEnum] = None,
    schedule_type: Optional[ScheduleTypeEnum] = None,
    date: Optional[dt_date] = None,
    room: Optional[str] = None
) -> List[Schedule]:
    """
    Tìm kiếm và lọc các lịch trình dựa trên nhiều tiêu chí.
    Hỗ trợ cả class_id đơn và danh sách class_ids.
    """
    query = db.query(Schedule)

    if class_id is not None:
        query = query.filter(Schedule.class_id == class_id)
    if class_ids:
        query = query.filter(Schedule.class_id.in_(class_ids))
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

def get_schedule(db: Session, schedule_id: int) -> Schedule | None:
    """
    Lấy một lịch học theo schedule_id.
    Trả về Schedule object hoặc None nếu không tìm thấy.
    """
    return db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()