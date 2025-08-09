# backend/app/crud/student_class_association_crud.py
from typing import List, Optional
from sqlalchemy import select, insert, update, delete
from sqlalchemy.orm import Session
from app.models.association_tables import student_class_association
from app.schemas.student_class_association_schema import (
    StudentClassAssociationCreate,
    StudentClassAssociationUpdate
)

def get_student_class(db: Session, student_id: int, class_id: int) -> Optional[dict]:
    """Lấy thông tin liên kết học sinh-lớp học."""
    stmt = (
        select(student_class_association)
        .where(
            student_class_association.c.student_id == student_id,
            student_class_association.c.class_id == class_id
        )
    )
    result = db.execute(stmt).mappings().first()
    return dict(result) if result else None

def get_student_classes_by_student_id(
    db: Session, student_id: int, skip: int = 0, limit: int = 100
) -> List[dict]:
    """Lấy danh sách liên kết học sinh-lớp học theo student_id."""
    stmt = (
        select(student_class_association)
        .where(student_class_association.c.student_id == student_id)
        .offset(skip)
        .limit(limit)
    )
    return [dict(row) for row in db.execute(stmt).mappings().all()]

def get_student_classes_by_class_id(
    db: Session, class_id: int, skip: int = 0, limit: int = 100
) -> List[dict]:
    """Lấy danh sách liên kết học sinh-lớp học theo class_id."""
    stmt = (
        select(student_class_association)
        .where(student_class_association.c.class_id == class_id)
        .offset(skip)
        .limit(limit)
    )
    return [dict(row) for row in db.execute(stmt).mappings().all()]

def get_all_student_classes(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
    """Lấy danh sách tất cả liên kết học sinh-lớp học."""
    stmt = select(student_class_association).offset(skip).limit(limit)
    return [dict(row) for row in db.execute(stmt).mappings().all()]

def create_student_class(db: Session, student_class_in: StudentClassAssociationCreate) -> dict:
    """Tạo mới một liên kết học sinh-lớp học."""
    stmt = insert(student_class_association).values(**student_class_in.model_dump())
    db.execute(stmt)
    db.commit()
    return student_class_in.model_dump()

def update_student_class(
    db: Session, student_id: int, class_id: int, student_class_update: StudentClassAssociationUpdate
) -> Optional[dict]:
    """Cập nhật thông tin liên kết học sinh-lớp học."""
    stmt = (
        update(student_class_association)
        .where(
            student_class_association.c.student_id == student_id,
            student_class_association.c.class_id == class_id
        )
        .values(**student_class_update.model_dump(exclude_unset=True))
        .returning(student_class_association)
    )
    result = db.execute(stmt).mappings().first()
    db.commit()
    return dict(result) if result else None

def delete_student_class(db: Session, student_id: int, class_id: int) -> Optional[dict]:
    """Xóa một liên kết học sinh-lớp học."""
    stmt = (
        delete(student_class_association)
        .where(
            student_class_association.c.student_id == student_id,
            student_class_association.c.class_id == class_id
        )
        .returning(student_class_association)
    )
    result = db.execute(stmt).mappings().first()
    db.commit()
    return dict(result) if result else None
