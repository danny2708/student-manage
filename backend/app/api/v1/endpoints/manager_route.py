from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import các CRUD operations
from app.crud import manager_crud
from app.crud import user_crud
from app.schemas import manager_schema 
from app.schemas.role_schema_with_user_id import ManagerCreateWithUser

from app.api import deps

router = APIRouter()


@router.post("/", response_model=manager_schema.Manager, status_code=status.HTTP_201_CREATED)
def create_new_manager(manager_in: ManagerCreateWithUser, db: Session = Depends(deps.get_db)):
    """
    Tạo một vai trò quản lý mới và liên kết nó với một người dùng đã tồn tại.
    """
    # Bước 1: Kiểm tra xem user_id có tồn tại trong bảng users không
    db_user = user_crud.get_user(db=db, user_id=manager_in.user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {manager_in.user_id} not found."
        )

    # Bước 2: Kiểm tra xem người dùng này đã có vai trò quản lý chưa
    existing_manager = manager_crud.get_manager_by_user_id(db, user_id=manager_in.user_id)
    if existing_manager:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID đã được liên kết với một quản lý khác."
        )

    # Bước 3: Tạo bản ghi manager và liên kết với user_id
    # Lưu ý: Hàm manager_crud.create_manager sẽ nhận Pydantic model trực tiếp
    return manager_crud.create_manager(db=db, manager_in=manager_in)


@router.get("/", response_model=List[manager_schema.Manager])
def read_all_managers(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả quản lý.
    """
    managers = manager_crud.get_all_managers(db, skip=skip, limit=limit)
    return managers


@router.get("/{manager_id}", response_model=manager_schema.Manager)
def read_manager(manager_id: int, db: Session = Depends(deps.get_db)):
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


@router.put("/{manager_id}", response_model=manager_schema.Manager)
def update_existing_manager(manager_id: int, manager: manager_schema.ManagerUpdate, db: Session = Depends(deps.get_db)):
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


@router.delete("/{manager_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_manager(manager_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một quản lý cụ thể bằng ID.
    """
    db_manager = manager_crud.delete_manager(db, manager_id=manager_id)
    if db_manager is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quản lý không tìm thấy."
        )
    return {"message": "Quản lý đã được xóa thành công."}
