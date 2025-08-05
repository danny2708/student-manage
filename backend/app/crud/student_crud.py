from sqlalchemy.orm import Session
from app.models.student_model import Student
from app.schemas.student_schema import StudentCreate, StudentUpdate

def get_student(db: Session, student_id: int):
    """Lấy thông tin học sinh theo ID."""
    return db.query(Student).filter(Student.student_id == student_id).first()

def get_student_by_user_id(db: Session, user_id: int):
    """Lấy thông tin học sinh theo user_id."""
    return db.query(Student).filter(Student.user_id == user_id).first()

def get_students_by_class_id(db: Session, class_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách học sinh theo class_id."""
    return db.query(Student).filter(Student.class_id == class_id).offset(skip).limit(limit).all()

def get_all_students(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả học sinh."""
    return db.query(Student).offset(skip).limit(limit).all()

def create_student(db: Session, student: StudentCreate):
    """Tạo mới một học sinh."""
    db_student = Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: int, student_update: StudentUpdate):
    """Cập nhật thông tin học sinh."""
    db_student = db.query(Student).filter(Student.student_id == student_id).first()
    if db_student:
        update_data = student_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student, key, value)
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int):
    """Xóa một học sinh."""
    db_student = db.query(Student).filter(Student.student_id == student_id).first()
    if db_student:
        db.delete(db_student)
        db.commit()
    return db_student

