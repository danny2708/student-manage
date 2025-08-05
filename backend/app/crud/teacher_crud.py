from sqlalchemy.orm import Session
from app.models.teacher_model import Teacher
from app.schemas.teacher_schema import TeacherCreate, TeacherUpdate

def get_teacher(db: Session, teacher_id: int):
    """Lấy thông tin giáo viên theo ID."""
    return db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()

def get_teacher_by_user_id(db: Session, user_id: int):
    """Lấy thông tin giáo viên theo user_id."""
    return db.query(Teacher).filter(Teacher.user_id == user_id).first()

def get_teacher_by_email(db: Session, email: str):
    """Lấy thông tin giáo viên theo email."""
    return db.query(Teacher).filter(Teacher.email == email).first()

def get_all_teachers(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả giáo viên."""
    return db.query(Teacher).offset(skip).limit(limit).all()

def create_teacher(db: Session, teacher: TeacherCreate):
    """Tạo mới một giáo viên."""
    db_teacher = Teacher(**teacher.model_dump())
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

def update_teacher(db: Session, teacher_id: int, teacher_update: TeacherUpdate):
    """Cập nhật thông tin giáo viên."""
    db_teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if db_teacher:
        update_data = teacher_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_teacher, key, value)
        db.add(db_teacher)
        db.commit()
        db.refresh(db_teacher)
    return db_teacher

def delete_teacher(db: Session, teacher_id: int):
    """Xóa một giáo viên."""
    db_teacher = db.query(Teacher).filter(Teacher.teacher_id == teacher_id).first()
    if db_teacher:
        db.delete(db_teacher)
        db.commit()
    return db_teacher

