# app/models/teacher_model.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Teacher(Base):
    __tablename__ = "teachers"

    teacher_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)

    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True)
    user = relationship("User", back_populates="teacher")

    classes = relationship("Class", back_populates="teacher")
