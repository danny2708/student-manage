from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    user_id: int = Field(..., example=1)
    message: str = Field(..., example="A new class has been scheduled.")
    is_read: bool = Field(False, example=False)

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(NotificationBase):
    user_id: Optional[int] = None
    message: Optional[str] = None
    is_read: Optional[bool] = None

class Notification(NotificationBase):
    id: int = Field(..., example=1)
    created_at: datetime

    class Config:
        from_attributes = True