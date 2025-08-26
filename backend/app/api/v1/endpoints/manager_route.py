from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

# Import các CRUD operations
from app.crud import manager_crud
from app.crud import user_crud, user_role_crud
from app.schemas.user_role_schema import UserRoleCreate
from app.schemas import manager_schema 
from app.api import deps

# Import dependency phân quyền cho vai trò manager
from app.api.auth.auth import get_current_manager

router = APIRouter()

@router.post(
    "/",
    response_model=manager_schema.Manager,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_current_manager)] # Chỉ cho phép manager gán role manager
)
def assign_manager(
    manager_in: manager_schema.ManagerAssign,
    db: Session = Depends(deps.get_db)
):
    """
    Gán một user đã tồn tại thành manager + cập nhật role 'manager' trong user_roles.
    """
    # 1. Kiểm tra user tồn tại
    db_user = user_crud.get_user(db=db, user_id=manager_in.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {manager_in.user_id} not found."
        )

    # 2. Kiểm tra đã là manager chưa
    existing_manager = manager_crud.get_manager_by_user_id(db=db, user_id=manager_in.user_id)
    if existing_manager:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with id {manager_in.user_id} is already a manager."
        )

    # 3. Tạo manager
    db_manager = manager_crud.create_manager(
        db=db,
        manager_in=manager_schema.ManagerCreate(user_id=manager_in.user_id)
    )

    # 4. Gán role "manager" vào user_roles nếu chưa có
    existing_role = user_role_crud.get_user_role(db, user_id=manager_in.user_id, role_name="manager")
    if not existing_role:
        user_role_crud.create_user_role(
            db=db,
            role_in=UserRoleCreate(
                user_id=manager_in.user_id,
                role_name="manager",
                assigned_at=datetime.utcnow()
            )
        )

    return db_manager


@router.get(
    "/",
    response_model=List[manager_schema.Manager],
    dependencies=[Depends(get_current_manager)] # Chỉ cho phép manager xem danh sách
)
def get_all_managers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách tất cả quản lý.
    """
    managers = manager_crud.get_all_managers(db, skip=skip, limit=limit)
    return managers


@router.get(
    "/{manager_id}",
    response_model=manager_schema.Manager,
    dependencies=[Depends(get_current_manager)] # Chỉ cho phép manager xem chi tiết
)
def get_manager(
    manager_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy thông tin của một quản lý cụ thể bằng ID.
    """
    db_manager = manager_crud.get_manager(db, manager_id=manager_id)
    if db_manager is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quản lý không tìm thấy."
        )
    return db_manager


@router.put(
    "/{manager_id}",
    response_model=manager_schema.Manager,
    dependencies=[Depends(get_current_manager)] # Chỉ cho phép manager cập nhật thông tin
)
def update_existing_manager(
    manager_id: int,
    manager: manager_schema.ManagerUpdate,
    db: Session = Depends(deps.get_db)
):
    """
    Cập nhật thông tin của một quản lý cụ thể bằng ID.
    """
    db_manager = manager_crud.update_manager(db, manager_id=manager_id, manager_update=manager)
    if db_manager is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quản lý không tìm thấy."
        )
    return db_manager


@router.delete(
    "/{manager_id}",
    response_model=dict,
    dependencies=[Depends(get_current_manager)] # Chỉ cho phép manager xóa
)
def delete_existing_manager(
    manager_id: int,
    db: Session = Depends(deps.get_db)
):
    db_manager = manager_crud.get_manager(db, manager_id=manager_id)
    if db_manager is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nhân viên không tìm thấy."
        )

    deleted_manager = manager_crud.delete_manager(db, manager_id=manager_id)

    return {
        "deleted_manager": manager_schema.Manager.from_orm(deleted_manager).dict(),
        "deleted_at": datetime.utcnow().isoformat(),
        "status": "success"
    }
