from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.user_schema import User, UserCreate, UserUpdate
from app.crud import user_crud # Đảm bảo file user_crud.py đã được cập nhật

router = APIRouter()

@router.post(
    "/",
    response_model=User,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo một người dùng mới"
)
def create_user_info(user: UserCreate, db: Session = Depends(get_db)):
    """
    Tạo một người dùng mới trong cơ sở dữ liệu.
    """
    return user_crud.create_user(db=db, user=user)

@router.get(
    "/",
    response_model=List[User],
    summary="Lấy danh sách tất cả người dùng"
)
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Truy vấn và trả về danh sách tất cả người dùng với tùy chọn phân trang.
    """
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get(
    "/{user_id}",
    response_model=User,
    summary="Lấy thông tin một người dùng bằng ID"
)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """
    Truy vấn và trả về thông tin của một người dùng cụ thể bằng ID.
    """
    user = user_crud.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người dùng không tìm thấy.")
    return user

@router.put(
    "/{user_id}",
    response_model=User,
    summary="Cập nhật thông tin người dùng"
)
def update_user_info(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    """
    Cập nhật thông tin của một người dùng đã tồn tại.
    """
    updated_user = user_crud.update_user(db, user_id, user_update)
    if updated_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người dùng không tìm thấy.")
    return updated_user

@router.delete(
    "/{user_id}",
    response_model=User,
    summary="Xóa một người dùng"
)
def delete_user_info(user_id: int, db: Session = Depends(get_db)):
    """
    Xóa một người dùng cụ thể khỏi cơ sở dữ liệu.
    """
    deleted_user = user_crud.delete_user(db, user_id)
    if deleted_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người dùng không tìm thấy.")
    return deleted_user
