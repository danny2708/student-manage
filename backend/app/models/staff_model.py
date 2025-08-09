# app/models/staff_model.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.user_model import User
class Staff(Base):
    """
    Model cho bảng staffs.
    """
    __tablename__ = 'staffs'
    staff_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), unique=True, nullable=False)

    # Mối quan hệ với người dùng (one-to-one)
    user = relationship("User", back_populates="staff")

    def __repr__(self):
        return f"<Staff(user_id='{self.user_id}')>"

