from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class StudentClass(Base):
    __tablename__ = "studentclass"

    studentclass_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    student = relationship("Student", backref="class_enrollments")
    class_obj = relationship("Class", backref="student_associations") # Đổi tên để tránh xung đột với từ khóa 'class'

