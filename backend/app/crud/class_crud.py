from sqlalchemy.orm import Session
from app.models.class_model import Class
from app.schemas.class_schema import ClassCreate, ClassUpdate
from sqlalchemy import select, join
from app.models.user_model import User
from app.schemas.class_schema import ClassView
from typing import List

def get_class_with_teacher_name_query():
    """Returns a SQLAlchemy query object with a JOIN to get the teacher's name."""
    return (
        select(
            Class.class_id,
            Class.class_name,
            User.full_name.label("teacher_name"),
            Class.subject_id,
            Class.max_students,
            Class.fee
        )
        .select_from(
            join(Class, User, Class.teacher_user_id == User.user_id)
        )
    )

def get_class(db: Session, class_id: int):
    """Get a class by ID, returning a ClassView object with the teacher's name."""
    query = get_class_with_teacher_name_query().where(Class.class_id == class_id)
    result = db.execute(query).first()
    if result:
        # Convert the Row object to a dictionary before validation
        return ClassView.model_validate(result._asdict())
    return None

def get_class_by_name(db: Session, class_name: str):
    """Get a class by name, returning a ClassView object with the teacher's name."""
    query = get_class_with_teacher_name_query().where(Class.class_name == class_name)
    result = db.execute(query).first()
    if result:
        # Convert the Row object to a dictionary
        return ClassView.model_validate(result._asdict())
    return None

def get_classes_by_teacher_id(db: Session, teacher_id: int, skip: int = 0, limit: int = 100) -> List[ClassView]:
    """Get a list of classes by teacher_id, returning a list of ClassView objects."""
    query = (
        get_class_with_teacher_name_query()
        .where(Class.teacher_user_id == teacher_id)
        .offset(skip)
        .limit(limit)
    )
    results = db.execute(query).all()
    # Convert each Row object in the list to a dictionary
    return [ClassView.model_validate(row._asdict()) for row in results]

def get_all_classes(db: Session, skip: int = 0, limit: int = 100) -> List[ClassView]:
    """Get a list of all classes, returning a list of ClassView objects."""
    query = get_class_with_teacher_name_query().offset(skip).limit(limit)
    results = db.execute(query).all()
    # Convert each Row object in the list to a dictionary
    return [ClassView.model_validate(row._asdict()) for row in results]

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

