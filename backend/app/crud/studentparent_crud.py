# D:\student-management-app\backend\app\crud\studentparent_crud.py

from sqlalchemy.orm import Session
# Cập nhật tên class từ StudentParent thành StudentParentAssociation
from app.models.association_tables import  student_parent_association
from app.schemas.studentparent_schema import StudentParentCreate, StudentParentUpdate

def get_student_parent(db: Session, studentparent_id: int):
    """Lấy thông tin liên kết học sinh-phụ huynh theo ID."""
    return db.query(student_parent_association).filter(student_parent_association.c.studentparent_id == studentparent_id).first()

def get_student_parents_by_student_id(db: Session, student_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách liên kết học sinh-phụ huynh theo student_id."""
    return db.query(student_parent_association).filter(student_parent_association.c.student_id == student_id).offset(skip).limit(limit).all()

def get_student_parents_by_parent_id(db: Session, parent_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách liên kết học sinh-phụ huynh theo parent_id."""
    return db.query(student_parent_association).filter(student_parent_association.c.parent_id == parent_id).offset(skip).limit(limit).all()

def get_all_student_parents(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả liên kết học sinh-phụ huynh."""
    return db.query(student_parent_association).offset(skip).limit(limit).all()

def create_student_parent(db: Session, student_parent: StudentParentCreate):
    """Tạo mới một liên kết học sinh-phụ huynh."""
    # Khởi tạo đối tượng với tên class mới
    db_student_parent = student_parent_association(**student_parent.model_dump())
    db.add(db_student_parent)
    db.commit()
    db.refresh(db_student_parent)
    return db_student_parent

def update_student_parent(db: Session, studentparent_id: int, student_parent_update: StudentParentUpdate):
    """Cập nhật thông tin liên kết học sinh-phụ huynh."""
    db_student_parent = db.query(student_parent_association).filter(student_parent_association.c.studentparent_id == studentparent_id).first()
    if db_student_parent:
        update_data = student_parent_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student_parent, key, value)
        db.add(db_student_parent)
        db.commit()
        db.refresh(db_student_parent)
    return db_student_parent

def delete_student_parent(db: Session, studentparent_id: int):
    """Xóa một liên kết học sinh-phụ huynh."""
    db_student_parent = db.query(student_parent_association).filter(student_parent_association.c.studentparent_id == studentparent_id).first()
    if db_student_parent:
        db.delete(db_student_parent)
        db.commit()
    return db_student_parent
