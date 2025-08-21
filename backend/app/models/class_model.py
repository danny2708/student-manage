from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.association_tables import student_class_association
# Import mô hình Test để tạo mối quan hệ
from app.models.test_model import Test

class Class(Base):
    """
    Model cho bảng classes.
    """
    __tablename__ = 'classes'
    class_id = Column(Integer, primary_key=True)
    class_name = Column(String(50), unique=True, nullable=False)
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)

    subject = relationship("Subject", back_populates="classes")

    # Mối quan hệ với giáo viên (one-to-one)
    teacher = relationship("Teacher", back_populates="classes")

    students = relationship(
    "Student",
    secondary=student_class_association,
    back_populates="classes"
)
    
    # Mối quan hệ với enrollments và attendances (one-to-many)
    enrollments = relationship("Enrollment", back_populates="class_obj")
    attendances = relationship("Attendance", back_populates="class_obj")
    schedules = relationship("Schedule", back_populates="class_info")
    # Thêm mối quan hệ mới với bảng Test
    # Điều này cho phép bạn truy cập tất cả các bài kiểm tra của một lớp học
    tests = relationship("Test", back_populates="class_rel")

    def __repr__(self):
        return f"<Class(name='{self.class_name}')>"
