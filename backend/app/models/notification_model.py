from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Notification(Base):
    """
    Model cho bảng notifications.
    """
    __tablename__ = 'notifications'
    notification_id = Column(Integer, primary_key=True)
    sender_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    receiver_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    content = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=func.now())
    type = Column(String(50))

    # Mối quan hệ với người gửi và người nhận (many-to-one)
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

