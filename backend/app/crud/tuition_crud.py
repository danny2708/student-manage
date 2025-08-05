from sqlalchemy.orm import Session
from app.models.tuition_model import Tuition
from app.schemas.tuition_schema import TuitionCreate, TuitionUpdate

def get_tuition(db: Session, tuition_id: int):
    """Lấy thông tin học phí theo ID."""
    return db.query(Tuition).filter(Tuition.tuition_id == tuition_id).first()

def get_tuitions_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách học phí theo student_id."""
    return db.query(Tuition).filter(Tuition.student_id == student_id).offset(skip).limit(limit).all()

def get_all_tuitions(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả học phí."""
    return db.query(Tuition).offset(skip).limit(limit).all()

def create_tuition(db: Session, tuition: TuitionCreate):
    """Tạo mới một bản ghi học phí."""
    db_tuition = Tuition(**tuition.model_dump())
    db.add(db_tuition)
    db.commit()
    db.refresh(db_tuition)
    return db_tuition

def update_tuition(db: Session, tuition_id: int, tuition_update: TuitionUpdate):
    """Cập nhật thông tin học phí."""
    db_tuition = db.query(Tuition).filter(Tuition.tuition_id == tuition_id).first()
    if db_tuition:
        update_data = tuition_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_tuition, key, value)
        db.add(db_tuition)
        db.commit()
        db.refresh(db_tuition)
    return db_tuition

def delete_tuition(db: Session, tuition_id: int):
    """Xóa một bản ghi học phí."""
    db_tuition = db.query(Tuition).filter(Tuition.tuition_id == tuition_id).first()
    if db_tuition:
        db.delete(db_tuition)
        db.commit()
    return db_tuition

