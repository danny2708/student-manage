from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.crud import notification_crud, user_crud
from app.schemas import notification_schema
from app.api import deps
from app.api.auth.auth import get_current_active_user, has_roles

router = APIRouter()

# Dependency cho quyền truy cập của Manager
MANAGER_ONLY = Depends(has_roles(["manager"]))

@router.post(
    "/",
    response_model=notification_schema.Notification,
    status_code=status.HTTP_201_CREATED
)
def create_new_notification(
    notification_in: notification_schema.NotificationCreate,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_active_user)
):
    if notification_in.sender_id is not None and notification_in.sender_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to send a notification as another user."
        )

    db_receiver = user_crud.get_user(db, user_id=notification_in.receiver_id)
    if not db_receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receiver with id {notification_in.receiver_id} not found."
        )

    return notification_crud.create_notification(db=db, notification=notification_in)

@router.get(
    "/",
    response_model=List[notification_schema.Notification],
    dependencies=[MANAGER_ONLY]
)
def get_all_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    return notification_crud.get_all_notifications(db, skip=skip, limit=limit)

@router.get("/{notification_id}", response_model=notification_schema.Notification)
def get_notification(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_active_user)
):
    db_notification = notification_crud.get_notification(db, notification_id=notification_id)
    if not db_notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thông báo không tìm thấy.")

    # Kiểm tra quyền: người nhận HOẶC manager
    if db_notification.receiver_id != current_user.user_id and "manager" not in current_user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền xem thông báo này.")

    return db_notification

@router.put("/{notification_id}", response_model=notification_schema.Notification)
def update_existing_notification(
    notification_id: int,
    notification_update: notification_schema.NotificationUpdate,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_active_user)
):
    db_notification = notification_crud.get_notification(db, notification_id=notification_id)
    if not db_notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thông báo không tìm thấy.")

    # Kiểm tra quyền: người nhận HOẶC manager
    if db_notification.receiver_id != current_user.user_id and "manager" not in current_user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không có quyền cập nhật thông báo này.")

    return notification_crud.update_notification(db, notification_id=notification_id, notification_update=notification_update)

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[MANAGER_ONLY])
def delete_existing_notification(
    notification_id: int,
    db: Session = Depends(deps.get_db)
):
    db_notification = notification_crud.delete_notification(db, notification_id=notification_id)
    if not db_notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thông báo không tìm thấy.")
