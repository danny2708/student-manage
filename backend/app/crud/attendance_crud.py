from sqlalchemy.orm import Session
from app.models.attendance_model import Attendance
from app.schemas.attendance_schema import AttendanceCreate, AttendanceUpdate

def get_attendance(db: Session, attendance_id: int):
    """Lấy thông tin điểm danh theo ID."""
    return db.query(Attendance).filter(Attendance.attendance_id == attendance_id).first()

def get_attendances_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách điểm danh theo student_id."""
    return db.query(Attendance).filter(Attendance.student_id == student_id).offset(skip).limit(limit).all()

def get_attendances_by_class_id(db: Session, class_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách điểm danh theo class_id."""
    return db.query(Attendance).filter(Attendance.class_id == class_id).offset(skip).limit(limit).all()

def get_all_attendances(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả điểm danh."""
    return db.query(Attendance).offset(skip).limit(limit).all()

def create_attendance(db: Session, attendance: AttendanceCreate):
    """Tạo mới một bản ghi điểm danh."""
    db_attendance = Attendance(**attendance.model_dump())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def update_attendance(db: Session, attendance_id: int, attendance_update: AttendanceUpdate):
    """Cập nhật thông tin điểm danh."""
    db_attendance = db.query(Attendance).filter(Attendance.attendance_id == attendance_id).first()
    if db_attendance:
        update_data = attendance_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_attendance, key, value)
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
    return db_attendance

def delete_attendance(db: Session, attendance_id: int):
    """Xóa một bản ghi điểm danh."""
    db_attendance = db.query(Attendance).filter(Attendance.attendance_id == attendance_id).first()
    if db_attendance:
        db.delete(db_attendance)
        db.commit()
    return db_attendance

