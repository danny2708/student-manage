# app/api/v1/endpoints/parent_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import các CRUD operations và schemas trực tiếp
from app.crud import parent_crud
from app.schemas import parent_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=parent_schema.Parent, status_code=status.HTTP_201_CREATED)
def create_new_parent(parent_in: parent_schema.ParentCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một phụ huynh mới.
    """
    # Bước 1: Kiểm tra xem email đã tồn tại chưa
    db_parent_by_email = parent_crud.get_parent_by_email(db, email=parent_in.email)
    if db_parent_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã tồn tại."
        )
        
    # Bước 2: Kiểm tra xem user_id đã được liên kết với phụ huynh khác chưa
    existing_parent = parent_crud.get_parent_by_user_id(db, user_id=parent_in.user_id)
    if existing_parent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID đã được liên kết với một phụ huynh khác."
        )

    # Bước 3: Tạo phụ huynh mới
    return parent_crud.create_parent(db=db, parent=parent_in)

@router.get("/", response_model=List[parent_schema.Parent])
def read_all_parents(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả phụ huynh.
    """
    parents = parent_crud.get_all_parents(db, skip=skip, limit=limit)
    return parents

@router.get("/{parent_id}", response_model=parent_schema.Parent)
def read_parent(parent_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một phụ huynh cụ thể bằng ID.
    """
    db_parent = parent_crud.get_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )
    return db_parent

@router.put("/{parent_id}", response_model=parent_schema.Parent)
def update_existing_parent(parent_id: int, parent_update: parent_schema.ParentUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một phụ huynh cụ thể bằng ID.
    """
    db_parent = parent_crud.update_parent(db, parent_id=parent_id, parent_update=parent_update)
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
    db_parent = parent_crud.delete_parent(db, parent_id=parent_id)
    if db_parent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Phụ huynh không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, đây là chuẩn cho xóa thành công
    return
