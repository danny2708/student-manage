from sqlalchemy.orm import Session
from app.models.manager_model import Manager
from app.schemas.manager_schema import ManagerUpdate
from app.schemas.user_role import ManagerCreateWithUser, RoleCreate
from app.crud.user_crud import create_user
from app.models.user_model import User
from app.models.role_model import Role


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
    """
    Tạo một user mới và sau đó tạo một manager mới, liên kết với user đó.
    """
    # 1. Tách dữ liệu user và manager từ schema ManagerCreateWithUser
    user_data = {
        "username": manager_in.username,
        "password": manager_in.password,
        "fullname": manager_in.fullname,
        "email": manager_in.email,
        "phone": manager_in.phone,
        "date_of_birth": manager_in.date_of_birth,
        "gender": manager_in.gender,
        "address": manager_in.address
    }
    
    manager_data = {
        "job_title": manager_in.job_title,
        "department": manager_in.department,
        "hire_date": manager_in.hire_date,
    }
    
    # 2. Tạo user mới và gán role 'manager'
    new_user = create_user(
        db=db,
        user_in=user_data,
        roles=[RoleCreate(role_name="manager")]
    )
    
    # 3. Tạo manager mới, liên kết với user_id vừa tạo
    db_manager = Manager(
        **manager_data,
        user_id=new_user.user_id  # Liên kết manager với user_id vừa tạo
    )
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
