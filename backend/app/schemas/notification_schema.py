from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.notification_model import NotificationType # Import Enum từ file model

class NotificationBase(BaseModel):
    """
    Schema cơ sở cho Notification, định nghĩa các trường chung.
    """
    sender_id: Optional[int] = Field(None, example=1)
    receiver_id: int = Field(..., example=2)
    content: str = Field(..., example="Bảng lương của bạn đã được cập nhật.")
    # Sử dụng Enum để đảm bảo kiểu dữ liệu hợp lệ
    type: NotificationType = Field(..., example=NotificationType.payroll)
    
class NotificationCreate(NotificationBase):
    """
    Schema để tạo một bản ghi Notification mới.
    sent_at không cần ở đây vì nó sẽ được tự động tạo trong DB.
    """
    pass

class NotificationUpdate(BaseModel):
    """
    Schema để cập nhật một bản ghi Notification hiện có.
    """
    content: Optional[str] = None
    # Nếu bạn có trường is_read trong model, hãy thêm vào đây
    # is_read: Optional[bool] = None

class NotificationRead(NotificationBase):
    """
    Schema để đọc dữ liệu Notification từ database.
    """
    notification_id: int = Field(..., example=1)
    sent_at: datetime

    class Config:
        from_attributes = True

class Notification(NotificationBase):
    notification_id: int = Field(..., example=1)
    sent_at: datetime

    class Config:
        from_attributes = True

