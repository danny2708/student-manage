# app/api/v1/endpoints/parent_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

# Import các CRUD operations và schemas trực tiếp
from app.crud import parent_crud, user_crud, user_role_crud
from app.schemas.user_role_schema import UserRoleCreate
from app.schemas import parent_schema
from app.api import deps

# Import các dependency factory từ đường dẫn chính xác
from app.api.auth.auth import get_current_active_user, has_roles

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = has_roles(["manager"])

@router.post(
    "/",
    response_model=parent_schema.Parent,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(MANAGER_ONLY)] # Chỉ cho phép manager gán role parent
)
def assign_parent(
    parent_in: parent_schema.ParentAssign,
    db: Session = Depends(deps.get_db)
):
    """
    Gán một user đã tồn tại thành parent và cập nhật role 'parent' trong user_roles.
    Chỉ có manager mới có thể thực hiện hành động này.
    """
    # 1. Kiểm tra user có tồn tại
    db_user = user_crud.get_user(db=db, user_id=parent_in.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {parent_in.user_id} not found."
        )

    # 2. Kiểm tra user đã là parent chưa
    existing_parent = parent_crud.get_parent_by_user_id(db=db, user_id=parent_in.user_id)
    if existing_parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with id {parent_in.user_id} is already a parent."
        )

    # 3. Gán parent
    db_parent = parent_crud.create_parent(
        db=db,
        parent_in=parent_schema.ParentCreate(user_id=parent_in.user_id)
    )

    # 4. Cập nhật user_roles nếu chưa có role "parent"
    existing_role = user_role_crud.get_user_role(db, user_id=parent_in.user_id, role_name="parent")
    if not existing_role:
        user_role_crud.create_user_role(
            db=db,
            role_in=UserRoleCreate(
                user_id=parent_in.user_id,
                role_name="parent",
                assigned_at=datetime.utcnow()
            )
        )

    return db_parent

@router.get(
    "/",
    response_model=List[parent_schema.Parent],
    dependencies=[Depends(MANAGER_ONLY)] # Sử dụng has_roles để kiểm tra vai trò manager
)
def get_all_parents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách tất cả phụ huynh.
    Chỉ có manager mới có quyền truy cập.
    """
    parents = parent_crud.get_all_parents(db, skip=skip, limit=limit)
    return parents

@router.get(
    "/{parent_id}",
    response_model=parent_schema.Parent
)
def get_parent(
    parent_id: int,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_active_user)
):
    """
    Lấy thông tin của một phụ huynh cụ thể bằng ID.
    Phụ huynh chỉ có thể xem thông tin của chính họ. Manager có thể xem tất cả.
    """
    db_parent = parent_crud.get_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )

    # Kiểm tra quyền: Người dùng hiện tại là phụ huynh này HOẶC là manager
    if db_parent.user_id != current_user.id and not current_user.is_manager:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem thông tin phụ huynh này."
        )

    return db_parent

@router.put(
    "/{parent_id}",
    response_model=parent_schema.Parent
)
def update_existing_parent(
    parent_id: int,
    parent_update: parent_schema.ParentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_active_user)
):
    """
    Cập nhật thông tin của một phụ huynh cụ thể bằng ID.
    Phụ huynh chỉ có thể cập nhật thông tin của chính họ. Manager có thể cập nhật bất kỳ phụ huynh nào.
    """
    db_parent = parent_crud.get_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )

    # Kiểm tra quyền: Người dùng hiện tại là phụ huynh này HOẶC là manager
    if db_parent.user_id != current_user.id and not current_user.is_manager:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền cập nhật thông tin phụ huynh này."
        )

    return parent_crud.update_parent(db, parent_id=parent_id, parent_update=parent_update)

@router.delete(
    "/{parent_id}",
    response_model=dict,
    dependencies=[Depends(MANAGER_ONLY)] # Sử dụng has_roles để kiểm tra vai trò manager
)
def delete_existing_parent(
    parent_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Xóa một phụ huynh cụ thể bằng ID.
    Chỉ có manager mới có quyền thực hiện.
    """
    db_parent = parent_crud.get_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )

    deleted_parent = parent_crud.delete_parent(db, parent_id=parent_id)

    return {
        "deleted_parent": parent_schema.Parent.from_orm(deleted_parent).dict(),
        "deleted_at": datetime.utcnow().isoformat(),
        "status": "success"
    }
