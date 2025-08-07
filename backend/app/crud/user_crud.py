# app/crud/user_crud.py
from sqlalchemy.orm import Session
from app.models.user_model import User
from app.schemas.user_schema import UserCreate, UserUpdate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hàm tiện ích để băm mật khẩu
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Hàm tiện ích để xác minh mật khẩu
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, user_id: int):
    """Lấy một người dùng bằng ID."""
    return db.query(User).filter(User.user_id == user_id).first()

def get_user_by_username(db: Session, username: str):
    """Lấy một người dùng bằng tên đăng nhập."""
    return db.query(User).filter(User.username == username).first()

# Thêm hàm mới để lấy người dùng bằng email
def get_user_by_email(db: Session, email: str):
    """Lấy một người dùng bằng email."""
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách người dùng với phân trang."""
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    """Tạo một người dùng mới."""
    hashed_password = get_password_hash(user.password)
    # Cập nhật để bao gồm email khi tạo người dùng
    db_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    """Cập nhật thông tin người dùng."""
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if db_user:
        # Cập nhật logic này sẽ tự động xử lý trường email mới
        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["password"] = get_password_hash(update_data.pop("password"))
        
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    """Xóa một người dùng."""
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

