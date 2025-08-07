from sqlalchemy.orm import Session
from app.models.parent_model import Parent
from app.schemas.parent_schema import ParentCreate, ParentUpdate

def get_parent(db: Session, parent_id: int):
    """Lấy thông tin phụ huynh theo ID."""
    return db.query(Parent).filter(Parent.parent_id == parent_id).first()

def get_parent_by_user_id(db: Session, user_id: int):
    """Lấy thông tin phụ huynh theo user_id."""
    return db.query(Parent).filter(Parent.user_id == user_id).first()

def get_parent_by_email(db: Session, email: str):
    """Lấy thông tin phụ huynh theo email."""
    return db.query(Parent).filter(Parent.email == email).first()

def get_all_parents(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả phụ huynh."""
    return db.query(Parent).offset(skip).limit(limit).all()

def create_parent(db: Session, parent_data: ParentCreate) -> Parent:
    # Lấy thông tin user từ parent_data
    user_data = parent_data.user_info
    
    # Tạo user mới trước
    db_user = create_user_base(db=db, user=user_data)
    
    # Tạo parent mới, chỉ sử dụng các trường hợp lệ của Parent SQLAlchemy model
    db_parent = Parent(
        user_id=db_user.user_id,
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

