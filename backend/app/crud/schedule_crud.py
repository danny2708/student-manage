from sqlalchemy.orm import Session
from app.models.schedule_model import Schedule
from app.schemas.schedule_schema import ScheduleCreate, ScheduleUpdate

def get_schedule(db: Session, schedule_id: int):
    """Lấy thông tin lịch học theo ID."""
    return db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()

def get_schedules_by_class_id(db: Session, class_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách lịch học theo class_id."""
    return db.query(Schedule).filter(Schedule.class_id == class_id).offset(skip).limit(limit).all()

def get_all_schedules(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả lịch học."""
    return db.query(Schedule).offset(skip).limit(limit).all()

def create_schedule(db: Session, schedule: ScheduleCreate):
    """Tạo mới một bản ghi lịch học."""
    db_schedule = Schedule(**schedule.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def update_schedule(db: Session, schedule_id: int, schedule_update: ScheduleUpdate):
    """Cập nhật thông tin lịch học."""
    db_schedule = db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()
    if db_schedule:
        update_data = schedule_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_schedule, key, value)
        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
    return db_schedule

def delete_schedule(db: Session, schedule_id: int):
    """Xóa một bản ghi lịch học."""
    db_schedule = db.query(Schedule).filter(Schedule.schedule_id == schedule_id).first()
    if db_schedule:
        db.delete(db_schedule)
        db.commit()
    return db_schedule

