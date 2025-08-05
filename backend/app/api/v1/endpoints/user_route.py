# app/api/v1/endpoints/user_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.crud import user_crud as crud_user
from app.schemas import user_schema as schemas_user
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_user.User, status_code=status.HTTP_201_CREATED)
def create_new_user(user: schemas_user.UserCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một người dùng mới.
    """
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập đã tồn tại."
        )
    return crud_user.create_user(db=db, user=user)

@router.get("/", response_model=List[schemas_user.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả người dùng.
    """
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=schemas_user.User)
def read_user(user_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một người dùng cụ thể bằng ID.
    """
    db_user = crud_user.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tìm thấy."
        )
    return db_user

@router.put("/{user_id}", response_model=schemas_user.User)
def update_existing_user(user_id: int, user: schemas_user.UserUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một người dùng cụ thể bằng ID.
    """
    db_user = crud_user.update_user(db, user_id=user_id, user_update=user)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tìm thấy."
        )
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_user(user_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một người dùng cụ thể bằng ID.
    """
    db_user = crud_user.delete_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tìm thấy."
        )
    return {"message": "Người dùng đã được xóa thành công."}

