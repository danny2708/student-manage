# app/models/enrollment_model.py
from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# Cập nhật enum EnrollmentStatus với hai giá trị Active và Inactive
class EnrollmentStatus(enum.Enum):
    Active = "Active"
    Inactive = "Inactive"

class Enrollment(Base):
    __tablename__ = "enrollments"

    enrollment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=False)
    
    # Đã sửa tên thuộc tính và kiểu dữ liệu thành Date để khớp với CSDL
    enrollment_date = Column("enrollment_date", Date, default=lambda: datetime.utcnow().date(), nullable=False)
    
    # Thêm cột enrollment_status với enum đã định nghĩa ở trên
    enrollment_status = Column(Enum(EnrollmentStatus), default=EnrollmentStatus.Active, nullable=False)

    # Đổi tên để tránh xung đột với từ khóa 'class'
    student = relationship("Student", back_populates="enrollments")
    class_obj = relationship("Class", back_populates="enrollments")
