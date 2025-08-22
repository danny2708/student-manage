from typing import Optional
from sqlalchemy.orm import Session
from app.models.notification_model import Notification
from app.schemas.notification_schema import NotificationCreate, NotificationUpdate

def get_notification(db: Session, notification_id: int):
    """Lấy thông tin thông báo theo ID."""
    return db.query(Notification).filter(Notification.notification_id == notification_id).first()

def get_notifications_by_sender_id(db: Session, sender_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách thông báo theo sender_id."""
    return db.query(Notification).filter(Notification.sender_id == sender_id).offset(skip).limit(limit).all()

def get_notifications_by_receiver_id(db: Session, receiver_id: int, skip: int = 0, limit: int = 100):
    """Lấy danh sách thông báo theo receiver_id."""
    return db.query(Notification).filter(Notification.receiver_id == receiver_id).offset(skip).limit(limit).all()

def get_all_notifications(db: Session, skip: int = 0, limit: int = 100):
    """Lấy danh sách tất cả thông báo."""
    return db.query(Notification).offset(skip).limit(limit).all()

def create_notification(db: Session, notification: NotificationCreate):
    """Tạo mới một thông báo từ một đối tượng NotificationCreate."""
    db_notification = Notification(**notification.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def update_notification(db: Session, notification_id: int, notification_update: NotificationUpdate):
    """Cập nhật thông tin thông báo."""
    db_notification = db.query(Notification).filter(Notification.notification_id == notification_id).first()
    if db_notification:
        update_data = notification_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_notification, key, value)
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
    return db_notification

def delete_notification(db: Session, notification_id: int):
    """Xóa một thông báo."""
    db_notification = db.query(Notification).filter(Notification.notification_id == notification_id).first()
    if db_notification:
        db.delete(db_notification)
        db.commit()
    return db_notification
