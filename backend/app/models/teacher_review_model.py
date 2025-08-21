# app/models/teacher_review_model.py
from sqlalchemy import DECIMAL, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class TeacherReview(Base):
    __tablename__ = "teacher_reviews"

    # Sử dụng tên cột review_id, review_date, review_text để khớp với database
    review_id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, nullable=False)
    student_id = Column(Integer, nullable=False)
    rating = Column(DECIMAL(10, 2), nullable=False)
    review_text = Column(String)
    review_date = Column(DateTime, default=datetime.now)
