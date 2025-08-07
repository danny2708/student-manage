from sqlalchemy.orm import Session
from app.models.manager_model import Manager
from app.schemas.manager_schema import ManagerUpdate
from app.schemas.role_schema_with_user_id import ManagerCreateWithUser

def get_manager(db: Session, manager_id: int):
    """Lấy thông tin quản lý theo ID."""
    return db.query(Manager).filter(Manager.manager_id == manager_id).first()

def get_manager_by_user_id(db: Session, user_id: int):
    """Lấy thông tin quản lý theo user_id."""
    return db.query(Manager).filter(Manager.user_id == user_id).first()

def get_all_managers(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả quản lý."""
    return db.query(Manager).offset(skip).limit(limit).all()

def create_manager(db: Session, manager_in: ManagerCreateWithUser):
    # Tạo một đối tượng Manager mới từ schema đầu vào
    db_manager = Manager(**manager_in.model_dump())
    db.add(db_manager)
    db.commit()
    db.refresh(db_manager)
    return db_manager

def update_manager(db: Session, manager_id: int, manager_update: ManagerUpdate):
    """Cập nhật thông tin quản lý."""
    db_manager = db.query(Manager).filter(Manager.manager_id == manager_id).first()
    if db_manager:
        update_data = manager_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_manager, key, value)
        db.add(db_manager)
        db.commit()
        db.refresh(db_manager)
    return db_manager

def delete_manager(db: Session, manager_id: int):
    """Xóa một quản lý."""
    db_manager = db.query(Manager).filter(Manager.manager_id == manager_id).first()
    if db_manager:
        db.delete(db_manager)
        db.commit()
    return db_manager

