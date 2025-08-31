# app/models/student_model.py
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.association_tables import student_class_association
# Import mô hình Test để thiết lập mối quan hệ
from app.models.test_model import Test

class Student(Base):
    """
    Model cho bảng students.
    """
    __tablename__ = 'students'

    student_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), unique=True, nullable=False)

    # One-to-many with Parent
    parent = relationship("Parent", back_populates="children")

    # Many-to-many with Class
    classes = relationship(
        "Class",
        secondary=student_class_association,
        back_populates="students"
    )

    # Các mối quan hệ one-to-many khác
    # Sửa lỗi: Thay đổi mối quan hệ với bảng Test
    # Bây giờ, mối quan hệ được thiết lập chính xác giữa Student.student_id và Test.student_id
    tests = relationship("Test", back_populates="student", primaryjoin="Student.student_id == Test.student_id")
    tuitions = relationship("Tuition", back_populates="student")
    enrollments = relationship("Enrollment", back_populates="student")
    attendances = relationship("Attendance", back_populates="student")
    evaluations = relationship("Evaluation", back_populates="student")
    attendances = relationship("Attendance", back_populates="student")
    user = relationship("User", back_populates="student")

    def __repr__(self):
        return f"<Student(user_id='{self.user_id}')>"
