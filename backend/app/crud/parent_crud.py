from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.parent_model import Parent
from app.schemas.parent_schema import ParentCreate, ParentUpdate
from app.models.association_tables import user_roles 

def get_parent(db: Session, parent_id: int) -> Optional[Parent]:
    stmt = select(Parent).where(Parent.parent_id == parent_id)
    return db.execute(stmt).scalar_one_or_none()

def get_parent_by_user_id(db: Session, user_id: int) -> Optional[Parent]:
    stmt = select(Parent).where(Parent.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def get_parent_by_email(db: Session, email: str) -> Optional[Parent]:
    from app.models.user_model import User
    stmt_user = select(User).where(User.email == email)
    user_with_email = db.execute(stmt_user).scalar_one_or_none()

    if user_with_email:
        stmt_parent = select(Parent).where(Parent.user_id == user_with_email.user_id)
        return db.execute(stmt_parent).scalar_one_or_none()
    return None

def get_all_parents(db: Session, skip: int = 0, limit: int = 100) -> List[Parent]:
    stmt = select(Parent).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_parent(db: Session, parent_in: ParentCreate) -> Parent:
    """
    Tạo mới phụ huynh, chỉ cần user_id. created_at sẽ được set tự động từ model.
    """
    db_parent = Parent(**parent_in.model_dump(exclude_unset=True, exclude={"created_at"}))
    db.add(db_parent)
    db.commit()
    db.refresh(db_parent)
    return db_parent

def update_parent(db: Session, parent_id: int, parent_update: ParentUpdate) -> Optional[Parent]:
    db_parent = get_parent(db, parent_id)
    if db_parent:
        update_data = parent_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_parent, key, value)
        db.add(db_parent)
        db.commit()
        db.refresh(db_parent)
    return db_parent

def delete_parent(db: Session, parent_id: int):
    db_parent = db.query(Parent).filter(Parent.parent_id == parent_id).first()
    if not db_parent:
        return None
    # Lưu dữ liệu trước khi xóa
    deleted_data = db_parent
    db.execute(
        user_roles.delete().where(user_roles.c.user_id == db_parent.user_id)
    )
    db.delete(db_parent)
    db.commit()
    return deleted_data

