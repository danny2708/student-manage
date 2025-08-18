from typing import List, Optional
from sqlalchemy import insert, select, update, delete
from sqlalchemy.orm import Session

from app.models.association_tables import student_parent_association
from app.schemas.student_parent_schema import (
    StudentParentAssociationCreate,
    StudentParentAssociationUpdate,
)


def create_student_parent(db: Session, student_parent: StudentParentAssociationCreate) -> dict:
    """
    Tạo một liên kết mới giữa học sinh và phụ huynh.
    """
    stmt = (
        insert(student_parent_association)
        .values(
            student_id=student_parent.student_id,
            parent_id=student_parent.parent_id
        )
        .returning(student_parent_association)
    )
    result = db.execute(stmt).mappings().first()
    db.commit()
    return dict(result) if result else None


def get_student_parent(db: Session, student_id: int, parent_id: int) -> Optional[dict]:
    """
    Lấy một liên kết học sinh-phụ huynh theo cặp khóa chính.
    """
    stmt = (
        select(student_parent_association)
        .where(
            student_parent_association.c.student_id == student_id,
            student_parent_association.c.parent_id == parent_id
        )
    )
    result = db.execute(stmt).mappings().first()
    return dict(result) if result else None


def get_student_parents(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
    """
    Lấy tất cả các liên kết học sinh-phụ huynh.
    """
    stmt = (
        select(student_parent_association)
        .offset(skip)
        .limit(limit)
    )
    results = db.execute(stmt).mappings().all()
    return [dict(row) for row in results]


def update_student_parent(
    db: Session,
    student_id: int,
    parent_id: int,
    student_parent: StudentParentAssociationUpdate
) -> Optional[dict]:
    """
    Cập nhật một liên kết học sinh-phụ huynh.
    """
    update_data = student_parent.model_dump(exclude_unset=True)
    if not update_data:
        return get_student_parent(db, student_id, parent_id)

    stmt = (
        update(student_parent_association)
        .where(
            student_parent_association.c.student_id == student_id,
            student_parent_association.c.parent_id == parent_id
        )
        .values(**update_data)
        .returning(student_parent_association)
    )
    result = db.execute(stmt).mappings().first()
    db.commit()
    return dict(result) if result else None


def delete_student_parent(db: Session, student_id: int, parent_id: int) -> bool:
    """
    Xóa một liên kết học sinh-phụ huynh.
    """
    stmt = (
        delete(student_parent_association)
        .where(
            student_parent_association.c.student_id == student_id,
            student_parent_association.c.parent_id == parent_id
        )
    )
    result = db.execute(stmt)
    db.commit()
    return result.rowcount > 0
