from typing import List, Optional

from sqlalchemy.orm import Session

# Import lớp StudentParentAssociation đã được định nghĩa là một lớp ORM
# trong file association_tables.py.
from app.models.association_tables import StudentParentAssociation
from app.schemas.student_parent_association_schema import (
    StudentParentAssociationCreate, 
    StudentParentAssociationUpdate
)

def create_student_parent(db: Session, student_parent: StudentParentAssociationCreate) -> StudentParentAssociation:
    """
    Tạo một liên kết mới giữa học sinh và phụ huynh.
    """
    db_student_parent = StudentParentAssociation(
        student_id=student_parent.student_id,
        parent_id=student_parent.parent_id
    )
    db.add(db_student_parent)
    db.commit()
    db.refresh(db_student_parent)
    return db_student_parent

def get_student_parent(db: Session, student_parent_id: int) -> Optional[StudentParentAssociation]:
    """
    Lấy một liên kết học sinh-phụ huynh theo ID.
    """
    return db.query(StudentParentAssociation).filter(StudentParentAssociation.id == student_parent_id).first()

def get_student_parents(db: Session, skip: int = 0, limit: int = 100) -> List[StudentParentAssociation]:
    """
    Lấy tất cả các liên kết học sinh-phụ huynh.
    """
    return db.query(StudentParentAssociation).offset(skip).limit(limit).all()

def update_student_parent(db: Session, student_parent_id: int, student_parent: StudentParentAssociationUpdate) -> Optional[StudentParentAssociation]:
    """
    Cập nhật một liên kết học sinh-phụ huynh.
    """
    db_student_parent = get_student_parent(db, student_parent_id)
    if db_student_parent:
        update_data = student_parent.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_student_parent, key, value)
        db.commit()
        db.refresh(db_student_parent)
    return db_student_parent

def delete_student_parent(db: Session, student_parent_id: int) -> bool:
    """
    Xóa một liên kết học sinh-phụ huynh.
    """
    db_student_parent = get_student_parent(db, student_parent_id)
    if db_student_parent:
        db.delete(db_student_parent)
        db.commit()
        return True
    return False
