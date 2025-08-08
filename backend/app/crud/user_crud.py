from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.user_model import User
from app.models.role_model import Role
from app.schemas.user_schema import UserCreate, UserUpdate
from app.schemas.user_role import RoleCreate
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

def create_user(db: Session, user_in: Dict[str, Any], roles: List[RoleCreate] = None):
    """
    Tạo một người dùng mới với đầy đủ thông tin và gán các vai trò.
    Hàm này được thiết kế để sử dụng bởi các CRUD khác (ví dụ: student_crud, parent_crud).
    """
    # Hash mật khẩu trước khi lưu
    user_in["password"] = get_password_hash(user_in["password"])

    # Tạo một đối tượng User từ dữ liệu đầu vào
    db_user = User(**user_in)
    
    # Xử lý vai trò (roles) nếu có
    if roles:
        for role_data in roles:
            # Tìm kiếm vai trò đã tồn tại trong DB
            role = db.query(Role).filter(Role.role_name == role_data.role_name).first()
            if role:
                # Nếu vai trò đã tồn tại, gán vào user
                db_user.roles.append(role)
            else:
                # Nếu vai trò chưa tồn tại, tạo mới và gán vào user
                new_role = Role(role_name=role_data.role_name)
                db_user.roles.append(new_role)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    """Cập nhật thông tin người dùng."""
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if db_user:
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
