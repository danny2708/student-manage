from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserUpdate

def get_user(db: Session, user_id: int) -> Optional[User]:
    """
    Truy vấn người dùng bằng ID.
    """
    return db.query(User).filter(User.user_id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """
    Truy vấn danh sách tất cả người dùng với phân trang.
    """
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    """
    Tạo một người dùng mới trong cơ sở dữ liệu.
    """
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """
    Cập nhật thông tin của một người dùng đã tồn tại.
    """
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    
    # Cập nhật các trường
    for key, value in user_update.dict(exclude_unset=True).items():
        setattr(db_user, key, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> Optional[User]:
    """
    Xóa một người dùng cụ thể khỏi cơ sở dữ liệu.
    """
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    
    db.delete(db_user)
    db.commit()
    return db_user
