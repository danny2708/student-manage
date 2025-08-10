# app/models/teacher_model.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.user_model import User
class Teacher(Base):
    """
    Model cho bảng teachers.
    """
    __tablename__ = 'teachers'
    teacher_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), unique=True, nullable=False)

    # Mối quan hệ với người dùng (one-to-one)
    user = relationship("User", back_populates="teacher")

    # Mối quan hệ với lớp học (one-to-many)
    classes = relationship("Class", back_populates="teacher")

    # Mối quan hệ với đánh giá (one-to-many)
    evaluations = relationship("Evaluation", back_populates="teacher")

    def __repr__(self):
        return f"<Teacher(user_id='{self.user_id}')>"
