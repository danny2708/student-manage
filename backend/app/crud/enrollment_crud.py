from sqlalchemy.orm import Session
from app.models.enrollment_model import Enrollment
from app.schemas.enrollment_schema import EnrollmentCreate, EnrollmentUpdate

def get_enrollment(db: Session, enrollment_id: int):
    """Lấy thông tin đăng ký theo ID."""
    return db.query(Enrollment).filter(Enrollment.enrollment_id == enrollment_id).first()

def get_enrollments_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách đăng ký theo student_id."""
    return db.query(Enrollment).filter(Enrollment.student_id == student_id).offset(skip).limit(limit).all()

def get_enrollments_by_class_id(db: Session, class_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách đăng ký theo class_id."""
    return db.query(Enrollment).filter(Enrollment.class_id == class_id).offset(skip).limit(limit).all()

def get_all_enrollments(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả đăng ký."""
    return db.query(Enrollment).offset(skip).limit(limit).all()

def create_enrollment(db: Session, enrollment: EnrollmentCreate):
    """Tạo mới một đăng ký."""
    db_enrollment = Enrollment(**enrollment.model_dump())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

def update_enrollment(db: Session, enrollment_id: int, enrollment_update: EnrollmentUpdate):
    """Cập nhật thông tin đăng ký."""
    db_enrollment = db.query(Enrollment).filter(Enrollment.enrollment_id == enrollment_id).first()
    if db_enrollment:
        update_data = enrollment_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_enrollment, key, value)
        db.add(db_enrollment)
        db.commit()
        db.refresh(db_enrollment)
    return db_enrollment

def delete_enrollment(db: Session, enrollment_id: int):
    """Xóa một đăng ký."""
    db_enrollment = db.query(Enrollment).filter(Enrollment.enrollment_id == enrollment_id).first()
    if db_enrollment:
        db.delete(db_enrollment)
        db.commit()
    return db_enrollment

