from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import parent_crud as crud_parent
from app.schemas import parent_schema as schemas_parent
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_parent.Parent, status_code=status.HTTP_201_CREATED)
def create_new_parent(parent: schemas_parent.ParentCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một phụ huynh mới.
    """
    db_parent_by_email = crud_parent.get_parent_by_email(db, email=parent.email)
    if db_parent_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại."
        )
    existing_parent = crud_parent.get_parent_by_user_id(db, user_id=parent.user_id)
    if existing_parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID đã được liên kết với một phụ huynh khác."
        )
    return crud_parent.create_parent(db=db, parent=parent)

@router.get("/", response_model=List[schemas_parent.Parent])
def read_all_parents(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả phụ huynh.
    """
    parents = crud_parent.get_all_parents(db, skip=skip, limit=limit)
    return parents

@router.get("/{parent_id}", response_model=schemas_parent.Parent)
def read_parent(parent_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một phụ huynh cụ thể bằng ID.
    """
    db_parent = crud_parent.get_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )
    return db_parent

@router.put("/{parent_id}", response_model=schemas_parent.Parent)
def update_existing_parent(parent_id: int, parent: schemas_parent.ParentUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một phụ huynh cụ thể bằng ID.
    """
    db_parent = crud_parent.update_parent(db, parent_id=parent_id, parent_update=parent)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )
    return db_parent

@router.delete("/{parent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_parent(parent_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một phụ huynh cụ thể bằng ID.
    """
    db_parent = crud_parent.delete_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )
    return {"message": "Phụ huynh đã được xóa thành công."}

