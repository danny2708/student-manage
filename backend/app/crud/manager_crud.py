from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select # Import select statement

from app.models.manager_model import Manager
from app.schemas.manager_schema import ManagerUpdate
from app.schemas.user_role_schema import ManagerCreateWithUser

def get_manager(db: Session, manager_id: int) -> Optional[Manager]:
    """
    Lấy thông tin quản lý theo ID.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Manager).where(Manager.manager_id == manager_id)
    return db.execute(stmt).scalars().first()

def get_manager_by_user_id(db: Session, user_id: int) -> Optional[Manager]:
    """
    Lấy thông tin quản lý theo user_id.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Manager).where(Manager.user_id == user_id)
    return db.execute(stmt).scalars().first()

def get_all_managers(db: Session, skip: int = 0, limit: int = 100) -> List[Manager]:
    """
    Lấy danh sách tất cả quản lý.
    Sử dụng cú pháp select() mới.
    """
    stmt = select(Manager).offset(skip).limit(limit)
    return db.execute(stmt).scalars().all()

def create_manager(db: Session, manager_in: ManagerCreateWithUser) -> Manager:
    """
    Tạo một user mới và sau đó tạo một manager mới, liên kết với user đó.
    Lệnh import 'create_user' được đưa vào trong hàm để tránh lỗi nhập vòng lặp.
    """
    from app.crud.user_crud import create_user
    from app.models.user_model import User
    
    # 1. Tạo user mới và gán role 'manager'
    new_user = User(
        username=manager_in.username,
        hashed_password=manager_in.password,
        role="manager"
    )
    db_user = create_user(db=db, user=new_user)
    
    # 2. Tạo manager mới, liên kết với user_id vừa tạo
    db_manager = Manager(
        fullname=manager_in.fullname,
        phone_number=manager_in.phone_number,
        email=manager_in.email,
        job_title=manager_in.job_title,
        department=manager_in.department,
        hire_date=manager_in.hire_date,
        user_id=db_user.user_id  # Liên kết manager với user_id vừa tạo
    )
    db.add(db_manager)
    db.commit()
    db.refresh(db_manager)
    
    return db_manager

def update_manager(db: Session, manager_id: int, manager_update: ManagerUpdate) -> Optional[Manager]:
    """
    Cập nhật thông tin quản lý.
    Sử dụng cú pháp select() mới để tìm quản lý.
    """
    db_manager = get_manager(db, manager_id)
    if db_manager:
        update_data = manager_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_manager, key, value)
        db.add(db_manager)
        db.commit()
        db.refresh(db_manager)
    return db_manager

def delete_manager(db: Session, manager_id: int) -> Optional[Manager]:
    """
    Xóa một quản lý và người dùng liên quan.
    Lệnh import 'delete_user' được đưa vào trong hàm để tránh lỗi nhập vòng lặp.
    """
    db_manager = get_manager(db, manager_id)
    if db_manager:
        from app.crud.user_crud import delete_user
        delete_user(db, db_manager.user_id)
        
        db.delete(db_manager)
        db.commit()
    return db_manager
