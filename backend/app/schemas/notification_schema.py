from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    sender_id: Optional[int] = Field(None, example=1)
    receiver_id: int = Field(..., example=2)
    content: str = Field(..., example="Bảng lương của bạn đã được cập nhật.")
    type: str = Field(..., example="payroll")
    
class NotificationCreate(NotificationBase):
    sent_at: datetime = Field(..., example=datetime.now())

class NotificationUpdate(BaseModel):
    content: Optional[str] = None
    is_read: Optional[bool] = None

class Notification(NotificationBase):
    notification_id: int = Field(..., example=1)
    sent_at: datetime

    class Config:
        from_attributes = True

