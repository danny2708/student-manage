# app/api/v1/endpoints/notification_route.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

# Import các CRUD operations
from app.crud import notification_crud
from app.crud import user_crud

# Import các schemas cần thiết trực tiếp từ module
from app.schemas import notification_schema
from app.api import deps

router = APIRouter()

@router.post("/", response_model=notification_schema.Notification, status_code=status.HTTP_201_CREATED)
def create_new_notification(notification_in: notification_schema.NotificationCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một thông báo mới.
    """
    # Bước 1: Kiểm tra xem sender_id có tồn tại trong bảng users không
    db_sender = user_crud.get_user(db, user_id=notification_in.sender_id)
    if not db_sender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sender with id {notification_in.sender_id} not found."
        )

    # Bước 2: Kiểm tra xem receiver_id có tồn tại trong bảng users không
    db_receiver = user_crud.get_user(db, user_id=notification_in.receiver_id)
    if not db_receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receiver with id {notification_in.receiver_id} not found."
        )

    # Bước 3: Tạo thông báo mới
    return notification_crud.create_notification(db=db, notification=notification_in)

@router.get("/", response_model=List[notification_schema.Notification])
def read_all_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các thông báo.
    """
    notifications = notification_crud.get_all_notifications(db, skip=skip, limit=limit)
    return notifications

@router.get("/{notification_id}", response_model=notification_schema.Notification)
def read_notification(notification_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một thông báo cụ thể bằng ID.
    """
    db_notification = notification_crud.get_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông báo không tìm thấy."
        )
    return db_notification

@router.put("/{notification_id}", response_model=notification_schema.Notification)
def update_existing_notification(notification_id: int, notification_update: notification_schema.NotificationUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một thông báo cụ thể bằng ID.
    """
    db_notification = notification_crud.update_notification(db, notification_id=notification_id, notification_update=notification_update)
    if db_notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông báo không tìm thấy."
        )
    return db_notification

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_notification(notification_id: int, db: Session = Depends(deps.get_db)):
    """
    Xóa một thông báo cụ thể bằng ID.
    """
    db_notification = notification_crud.delete_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông báo không tìm thấy."
        )
    # Trả về status code 204 mà không có nội dung, vì đây là tiêu chuẩn cho xóa thành công
    return
