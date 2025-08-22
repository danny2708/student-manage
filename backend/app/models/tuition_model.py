import enum
from sqlalchemy import Column, Integer, Float, DateTime, Enum, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class PaymentStatus(str, enum.Enum):
    """
    Enum để đại diện cho trạng thái thanh toán.
    """
    unpaid = "unpaid"
    paid = "paid"
    out_dated = "out_dated"

class Tuition(Base):
    """
    Mô hình database cho bảng `tuition`.
    """
    __tablename__ = "tuitions"

    tuition_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    payment_date = Column(Date, nullable=True) # Có thể là null nếu chưa thanh toán
    term = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Trường mới để lưu hạn thanh toán và trạng thái
    due_date = Column(Date, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.unpaid, nullable=False)

    # Quan hệ với bảng student
    student = relationship("Student", back_populates="tuitions")
