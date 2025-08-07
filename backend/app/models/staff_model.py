# app/models/staff_model.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Staff(Base):
    __tablename__ = "staffs"

    staff_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)

    # Mối quan hệ ngược lại với bảng users, khớp với thuộc tính `staff` trong User
    user = relationship("User", back_populates="staff")

    def __repr__(self):
        return f"<Staff(staff_id={self.staff_id}, full_name='{self.full_name}')>"
