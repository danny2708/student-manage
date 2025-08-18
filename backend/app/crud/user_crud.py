from typing import List, Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserUpdate

# bcrypt context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    Lưu first_password (raw), password = hash(first_password).
    """
    raw_password = user.first_password or user.password

    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        date_of_birth=user.date_of_birth,
        gender=user.gender,
        phone_number=user.phone_number,
        first_password=raw_password,                # lưu bản raw
        password=pwd_context.hash(raw_password),    # hash để login
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """
    Cập nhật thông tin của một người dùng đã tồn tại.
    Nếu có password mới → hash lại.
    """
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)

    # Nếu có password mới → hash
    if "password" in update_data and update_data["password"]:
        update_data["password"] = pwd_context.hash(update_data["password"])
    
    for key, value in update_data.items():
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
