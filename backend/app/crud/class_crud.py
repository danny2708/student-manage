from sqlalchemy.orm import Session
from app.models.class_model import Class
from app.schemas.class_schema import ClassCreate, ClassUpdate

def get_class(db: Session, class_id: int):
    """Lấy thông tin lớp học theo ID."""
    return db.query(Class).filter(Class.class_id == class_id).first()

def get_class_by_name(db: Session, class_name: str):
    """Lấy thông tin lớp học theo tên."""
    return db.query(Class).filter(Class.class_name == class_name).first()

def get_classes_by_teacher_id(db: Session, teacher_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách lớp học theo teacher_id."""
    return db.query(Class).filter(Class.teacher_user_id == teacher_id).offset(skip).limit(limit).all()

def get_all_classes(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả lớp học."""
    return db.query(Class).offset(skip).limit(limit).all()

def create_class(db: Session, class_data: ClassCreate):
    """Tạo mới một lớp học."""
    db_class = Class(**class_data.model_dump())
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def update_class(db: Session, class_id: int, class_update: ClassUpdate):
    """Cập nhật thông tin lớp học."""
    db_class = db.query(Class).filter(Class.class_id == class_id).first()
    if db_class:
        update_data = class_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_class, key, value)
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
    return db_class

def delete_class(db: Session, class_id: int):
    db_class = db.query(Class).filter(Class.class_id == class_id).first()
    if not db_class:
        return None
    # Lưu dữ liệu trước khi xóa
    deleted_data = db_class
    db.delete(db_class)
    db.commit()
    return deleted_data

