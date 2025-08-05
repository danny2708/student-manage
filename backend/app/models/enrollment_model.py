
from sqlalchemy import Column, Integer, ForeignKey, DateTime # Đã thay đổi Date thành DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime # Thêm import datetime

class Enrollment(Base):
    __tablename__ = "enrollments"

    enrollment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow, nullable=False) # Đã thay đổi thành DateTime và thêm default

    student = relationship("Student", backref="enrollments")
    class_obj = relationship("Class", backref="enrollments_in_class") # Đổi tên để tránh xung đột với từ khóa 'class'

