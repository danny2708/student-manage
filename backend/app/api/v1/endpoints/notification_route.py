from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import notification_crud as crud_notification
from app.schemas import notification_schema as schemas_notification
from app.api import deps

router = APIRouter()

@router.post("/", response_model=schemas_notification.Notification, status_code=status.HTTP_201_CREATED)
def create_new_notification(notification: schemas_notification.NotificationCreate, db: Session = Depends(deps.get_db)):
    """
    Tạo một thông báo mới.
    """
    # Bạn có thể thêm kiểm tra xem sender_id và receiver_id có tồn tại trong bảng users không
    return crud_notification.create_notification(db=db, notification=notification)

@router.get("/", response_model=List[schemas_notification.Notification])
def read_all_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(deps.get_db)):
    """
    Lấy danh sách tất cả các thông báo.
    """
    notifications = crud_notification.get_all_notifications(db, skip=skip, limit=limit)
    return notifications

@router.get("/{notification_id}", response_model=schemas_notification.Notification)
def read_notification(notification_id: int, db: Session = Depends(deps.get_db)):
    """
    Lấy thông tin của một thông báo cụ thể bằng ID.
    """
    db_notification = crud_notification.get_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông báo không tìm thấy."
        )
    return db_notification

@router.put("/{notification_id}", response_model=schemas_notification.Notification)
def update_existing_notification(notification_id: int, notification: schemas_notification.NotificationUpdate, db: Session = Depends(deps.get_db)):
    """
    Cập nhật thông tin của một thông báo cụ thể bằng ID.
    """
    db_notification = crud_notification.update_notification(db, notification_id=notification_id, notification_update=notification)
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
    db_notification = crud_notification.delete_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông báo không tìm thấy."
        )
    return {"message": "Thông báo đã được xóa thành công."}

