from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    sender_id: int = Field(..., example=2, description="ID người gửi (user_id)")
    receiver_id: int = Field(..., example=7, description="ID người nhận (user_id)")
    content: str = Field(..., example="Bạn có thông báo mới về điểm số.")
    sent_at: datetime = Field(..., example="2023-11-10T14:30:00")
    type: str = Field(..., example="Alert", description="Loại thông báo: Alert, Message, Reminder")

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(NotificationBase):
    sender_id: Optional[int] = None
    receiver_id: Optional[int] = None
    content: Optional[str] = None
    sent_at: Optional[datetime] = None
    type: Optional[str] = None

class Notification(NotificationBase):
    notification_id: int = Field(..., example=1)

    class Config:
        from_attributes = True
