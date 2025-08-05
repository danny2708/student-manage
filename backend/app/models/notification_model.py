from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.user_id"), nullable=False) # Người gửi thông báo
    receiver_id = Column(Integer, ForeignKey("users.user_id"), nullable=False) # Người nhận thông báo
    content = Column(String, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    type = Column(String, nullable=False) # Ví dụ: "Alert", "Message", "Reminder"

    sender = relationship("User", foreign_keys=[sender_id], backref="sent_notifications")
    receiver = relationship("User", foreign_keys=[receiver_id], backref="received_notifications")

