from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import manager_crud as crud_manager
from app.schemas import manager_schema as schemas_manager
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_manager.Manager, status_code=status.HTTP_201_CREATED)
def create_new_manager(manager: schemas_manager.ManagerCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một quản lý mới.
    """
    existing_manager = crud_manager.get_manager_by_user_id(db, user_id=manager.user_id)
    if existing_manager:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID đã được liên kết với một quản lý khác."
        )
    return crud_manager.create_manager(db=db, manager=manager)

@router.get("/", response_model=List[schemas_manager.Manager])
def read_all_managers(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả quản lý.
    """
    managers = crud_manager.get_all_managers(db, skip=skip, limit=limit)
    return managers

@router.get("/{manager_id}", response_model=schemas_manager.Manager)
def read_manager(manager_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một quản lý cụ thể bằng ID.
    """
    db_manager = crud_manager.get_manager(db, manager_id=manager_id)
    if db_manager is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quản lý không tìm thấy."
        )
    return db_manager

@router.put("/{manager_id}", response_model=schemas_manager.Manager)
def update_existing_manager(manager_id: int, manager: schemas_manager.ManagerUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một quản lý cụ thể bằng ID.
    """
    db_manager = crud_manager.update_manager(db, manager_id=manager_id, manager_update=manager)
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
    db_manager = crud_manager.delete_manager(db, manager_id=manager_id)
    if db_manager is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quản lý không tìm thấy."
        )
    return {"message": "Quản lý đã được xóa thành công."}

