from sqlalchemy.orm import Session
from app.models.subject_model import Subject
from app.schemas.subject_schema import SubjectCreate, SubjectUpdate

def get_subject(db: Session, subject_id: int):
    """Lấy thông tin môn học theo ID."""
    return db.query(Subject).filter(Subject.subject_id == subject_id).first()

def get_subject_by_name(db: Session, name: str):
    """Lấy thông tin môn học theo tên."""
    return db.query(Subject).filter(Subject.name == name).first()

def get_subjects_by_teacher_id(db: Session, teacher_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách môn học theo teacher_id."""
    return db.query(Subject).filter(Subject.teacher_id == teacher_id).offset(skip).limit(limit).all()

def get_all_subjects(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả môn học."""
    return db.query(Subject).offset(skip).limit(limit).all()

def create_subject(db: Session, subject: SubjectCreate):
    """Tạo mới một môn học."""
    db_subject = Subject(**subject.model_dump())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def update_subject(db: Session, subject_id: int, subject_update: SubjectUpdate):
    """Cập nhật thông tin môn học."""
    db_subject = db.query(Subject).filter(Subject.subject_id == subject_id).first()
    if db_subject:
        update_data = subject_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_subject, key, value)
        db.add(db_subject)
        db.commit()
        db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int):
    """Xóa một môn học."""
    db_subject = db.query(Subject).filter(Subject.subject_id == subject_id).first()
    if db_subject:
        db.delete(db_subject)
        db.commit()
    return db_subject

