# app/models/parent_model.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

# Import Base và bảng liên kết
from app.database import Base
from app.models.association_tables import student_parent_association

class Parent(Base):
    __tablename__ = "parents"

    parent_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    phone_number = Column(String(15), unique=True, nullable=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True)

    # Sử dụng chuỗi tên lớp để tránh vòng lặp import
    user = relationship("User", back_populates="parent")

    # Mối quan hệ với học sinh thông qua bảng liên kết
    students = relationship(
        "Student",
        secondary=student_parent_association,
        back_populates="parents"
    )
