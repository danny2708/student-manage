# app/models/payroll_model.py
from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Payroll(Base):
    """
    Model cho bảng payroll.
    """
    __tablename__ = 'payroll'
    payroll_id = Column(Integer, primary_key=True)
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'), nullable=False)
    # Thêm khóa ngoại trỏ đến teacher_id
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'), nullable=False)
    month = Column(Integer, nullable=False)
    base_salary = Column(DECIMAL(10, 2), nullable=False)
    reward_bonus = Column(DECIMAL(10, 2), nullable=False)
    total = Column(DECIMAL(10, 2), nullable=False)
    sent_at = Column(DateTime, nullable=False)

    # Mối quan hệ với giáo viên (one-to-one)
    teacher = relationship("Teacher", back_populates="payroll")
