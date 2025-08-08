from sqlalchemy.orm import Session
from app.models.parent_model import Parent
from app.schemas.parent_schema import ParentCreate, ParentUpdate
from app.schemas.user_role import RoleCreate
from app.crud.user_crud import create_user
from app.models.user_model import User
from app.models.role_model import Role


def get_parent(db: Session, parent_id: int):
    """Lấy thông tin phụ huynh theo ID."""
    return db.query(Parent).filter(Parent.parent_id == parent_id).first()

def get_parent_by_user_id(db: Session, user_id: int):
    """Lấy thông tin phụ huynh theo user_id."""
    return db.query(Parent).filter(Parent.user_id == user_id).first()

def get_parent_by_email(db: Session, email: str):
    """Lấy thông tin phụ huynh theo email."""
    # Lấy thông tin user có email tương ứng
    user_with_email = db.query(User).filter(User.email == email).first()
    if user_with_email:
        # Nếu tìm thấy user, tìm parent tương ứng
        return db.query(Parent).filter(Parent.user_id == user_with_email.user_id).first()
    return None

def get_all_parents(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả phụ huynh."""
    return db.query(Parent).offset(skip).limit(limit).all()

def create_parent(db: Session, parent_data: ParentCreate) -> Parent:
    """
    Tạo một user mới và sau đó tạo một parent mới, liên kết với user đó.
    """
    # Lấy thông tin user từ parent_data
    user_data = parent_data.user_info.model_dump()
    
    # Tạo user mới và gán role 'parent'
    new_user = create_user(
        db=db,
        user_in=user_data,
        roles=[RoleCreate(role_name="parent")]
    )
    
    # Tạo parent mới, liên kết với user_id vừa tạo
    db_parent = Parent(
        user_id=new_user.user_id,
        relationship_to_student=parent_data.relationship_to_student
    )
    
    db.add(db_parent)
    db.commit()
    db.refresh(db_parent)
    
    return db_parent

def update_parent(db: Session, parent_id: int, parent_update: ParentUpdate):
    """Cập nhật thông tin phụ huynh."""
    db_parent = db.query(Parent).filter(Parent.parent_id == parent_id).first()
    if db_parent:
        update_data = parent_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_parent, key, value)
        db.add(db_parent)
        db.commit()
        db.refresh(db_parent)
    return db_parent

def delete_parent(db: Session, parent_id: int):
    """Xóa một phụ huynh."""
    db_parent = db.query(Parent).filter(Parent.parent_id == parent_id).first()
    if db_parent:
        db.delete(db_parent)
        db.commit()
    return db_parent
