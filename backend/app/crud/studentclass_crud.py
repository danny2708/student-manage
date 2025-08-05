from sqlalchemy.orm import Session
from app.models.studentclass_model import StudentClass
from app.schemas.studentclass_schema import StudentClassCreate, StudentClassUpdate

def get_student_class(db: Session, studentclass_id: int):
    """Lấy thông tin liên kết học sinh-lớp học theo ID."""
    return db.query(StudentClass).filter(StudentClass.studentclass_id == studentclass_id).first()

def get_student_classes_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách liên kết học sinh-lớp học theo student_id."""
    return db.query(StudentClass).filter(StudentClass.student_id == student_id).offset(skip).limit(limit).all()

def get_student_classes_by_class_id(db: Session, class_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách liên kết học sinh-lớp học theo class_id."""
    return db.query(StudentClass).filter(StudentClass.class_id == class_id).offset(skip).limit(limit).all()

def get_all_student_classes(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả liên kết học sinh-lớp học."""
    return db.query(StudentClass).offset(skip).limit(limit).all()

def create_student_class(db: Session, student_class: StudentClassCreate):
    """Tạo mới một liên kết học sinh-lớp học."""
    db_student_class = StudentClass(**student_class.model_dump())
    db.add(db_student_class)
    db.commit()
    db.refresh(db_student_class)
    return db_student_class

def update_student_class(db: Session, studentclass_id: int, student_class_update: StudentClassUpdate):
    """Cập nhật thông tin liên kết học sinh-lớp học."""
    db_student_class = db.query(StudentClass).filter(StudentClass.studentclass_id == studentclass_id).first()
    if db_student_class:
        update_data = student_class_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student_class, key, value)
        db.add(db_student_class)
        db.commit()
        db.refresh(db_student_class)
    return db_student_class

def delete_student_class(db: Session, studentclass_id: int):
    """Xóa một liên kết học sinh-lớp học."""
    db_student_class = db.query(StudentClass).filter(StudentClass.studentclass_id == studentclass_id).first()
    if db_student_class:
        db.delete(db_student_class)
        db.commit()
    return db_student_class

