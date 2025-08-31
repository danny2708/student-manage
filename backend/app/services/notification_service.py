# app/services/notification_service.py
from sqlalchemy.orm import Session
from app.models.notification_model import Notification, NotificationType

def send_notification(
    db: Session,
    sender_id: int | None,
    receiver_id: int,
    content: str,
    notif_type: NotificationType
):
    notification = Notification(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content,
        type=notif_type
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
