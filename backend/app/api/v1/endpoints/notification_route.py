from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import các CRUD operations
from app.crud import notification_crud, user_crud

# Import các schemas cần thiết trực tiếp từ module
from app.schemas import notification_schema
from app.api import deps

# Import dependencies phân quyền từ đường dẫn chính xác
from app.api.auth.auth import get_current_user, get_current_manager

router = APIRouter()

@router.post(
    "/",
    response_model=notification_schema.Notification,
    status_code=status.HTTP_201_CREATED
)
def create_new_notification(
    notification_in: notification_schema.NotificationCreate,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_user) # Lấy thông tin người dùng hiện tại
):
    """
    Tạo một thông báo mới.
    """
    # 1. Kiểm tra xem người gửi có phải là người dùng hiện tại không
    if notification_in.sender_id is not None and notification_in.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to send a notification as another user."
        )

    # 2. Kiểm tra xem receiver_id có tồn tại trong bảng users không
    db_receiver = user_crud.get_user(db, user_id=notification_in.receiver_id)
    if not db_receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receiver with id {notification_in.receiver_id} not found."
        )

    # 3. Tạo thông báo mới
    return notification_crud.create_notification(db=db, notification=notification_in)

# Chỉ cho phép manager xem tất cả thông báo
@router.get(
    "/",
    response_model=List[notification_schema.Notification],
    dependencies=[Depends(get_current_manager)]
)
def get_all_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
):
    """
    Lấy danh sách tất cả các thông báo.
    """
    notifications = notification_crud.get_all_notifications(db, skip=skip, limit=limit)
    return notifications

@router.get("/{notification_id}", response_model=notification_schema.Notification)
def get_notification(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_user)
):
    """
    Lấy thông tin của một thông báo cụ thể bằng ID.
    Người dùng chỉ có thể xem thông báo của chính họ. Manager có thể xem tất cả.
    """
    db_notification = notification_crud.get_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông báo không tìm thấy."
        )

    # Kiểm tra quyền: Người dùng hiện tại là người nhận thông báo HOẶC là manager
    if db_notification.receiver_id != current_user.id and not current_user.is_manager:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem thông báo này."
        )

    return db_notification

@router.put("/{notification_id}", response_model=notification_schema.Notification)
def update_existing_notification(
    notification_id: int,
    notification_update: notification_schema.NotificationUpdate,
    db: Session = Depends(deps.get_db),
    current_user: user_crud.User = Depends(get_current_user)
):
    """
    Cập nhật thông tin của một thông báo cụ thể bằng ID.
    Người dùng chỉ có thể cập nhật thông báo của chính họ (ví dụ: đánh dấu đã đọc).
    Manager có thể cập nhật bất kỳ thông báo nào.
    """
    db_notification = notification_crud.get_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông báo không tìm thấy."
        )

    # Kiểm tra quyền: Người dùng hiện tại là người nhận thông báo HOẶC là manager
    if db_notification.receiver_id != current_user.id and not current_user.is_manager:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền cập nhật thông báo này."
        )

    return notification_crud.update_notification(db, notification_id=notification_id, notification_update=notification_update)

@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_current_manager)] # Chỉ cho phép manager xóa thông báo
)
def delete_existing_notification(
    notification_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Xóa một thông báo cụ thể bằng ID.
    """
    db_notification = notification_crud.delete_notification(db, notification_id=notification_id)
    if db_notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thông báo không tìm thấy."
        )
