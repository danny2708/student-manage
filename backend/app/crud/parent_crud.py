from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.parent_model import Parent
from app.schemas.parent_schema import ParentCreate, ParentUpdate
from app.models.association_tables import user_roles
from app.models.role_model import Role
from app.models.student_model import Student 

def get_parent(
    db: Session,
    user_id: Optional[int] = None
) -> Optional[Parent]:
    stmt = select(Parent)
    if user_id is not None:
        stmt = stmt.where(Parent.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def get_parent_by_user_id(db: Session, user_id: int) -> Optional[Parent]:
    """
    Lấy thông tin phụ huynh theo user_id.
    """
    stmt = select(Parent).where(Parent.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()

def get_parent_by_email(db: Session, email: str) -> Optional[Parent]:
    from app.models.user_model import User
    stmt = (
        select(Parent)
        .join(User,Parent.user_id == User.user_id)
        .where(User.email == email)
    )
    return db.execute(stmt).scalar_one_or_none()

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

def update_parent(db: Session, user_id: int, parent_update: ParentUpdate) -> Optional[Parent]:
    db_parent = get_parent(db, user_id=user_id)
    if db_parent:
        for key, value in parent_update.model_dump(exclude_unset=True).items():
            setattr(db_parent, key, value)
        db.commit()
        db.refresh(db_parent)
    return db_parent


def delete_parent(db: Session, user_id: int):
    db_parent = get_parent(db, user_id=user_id)
    if not db_parent:
        return None

    # Lấy role "parent"
    parent_role = db.query(Role).filter(Role.name == "parent").first()
    if not parent_role:
        return None

    # Xóa chỉ role "parent" cho user này
    db.execute(
        user_roles.delete()
        .where(user_roles.c.user_id == db_parent.user_id)
        .where(user_roles.c.role_id == parent_role.role_id)
    )

    db.delete(db_parent)
    db.commit()
    return db_parent

def get_childrens(db: Session, parent_user_id: int):
    """Lấy danh sách các Student con của Parent dựa theo parent_user_id."""
    parent = db.query(Parent).filter(Parent.user_id == parent_user_id).first()
    if not parent:
        return []
    return db.query(Student).filter(Student.parent_id == parent.user_id).all()


