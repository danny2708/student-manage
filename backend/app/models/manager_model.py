# app/models/manager_model.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Manager(Base):
    __tablename__ = "managers"

    manager_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)

    # Mối quan hệ ngược lại với bảng users, khớp với thuộc tính `manager` trong User
    user = relationship("User", back_populates="manager")

    def __repr__(self):
        return f"<Manager(manager_id={self.manager_id}, full_name='{self.full_name}')>"
