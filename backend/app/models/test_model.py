from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Date
from sqlalchemy.orm import relationship
from app.database import Base


class Test(Base):
    """
    Model cho bảng tests.
    """
    __tablename__ = 'tests'

    test_id = Column(Integer, primary_key=True)
    test_name = Column(String(255), nullable=False)

    # Khóa ngoại đến bảng students (user_id)
    student_user_id = Column(Integer, ForeignKey('students.user_id', ondelete="CASCADE"), nullable=False)

    # Khóa ngoại đến bảng classes
    class_id = Column(Integer, ForeignKey('classes.class_id', ondelete="CASCADE"), nullable=False)

    # Khóa ngoại đến bảng subjects
    subject_id = Column(Integer, ForeignKey('subjects.subject_id', ondelete="CASCADE"), nullable=False)

    # Khóa ngoại đến bảng teachers (user_id)
    teacher_user_id = Column(Integer, ForeignKey('teachers.user_id', ondelete="CASCADE"), nullable=False)

    score = Column(DECIMAL(5, 2), nullable=False)
    exam_date = Column(Date, nullable=False)

    # Thiết lập mối quan hệ với các bảng khác
    student = relationship("Student", back_populates="tests")
    teacher = relationship("Teacher", back_populates="tests")
    subject = relationship("Subject", back_populates="tests")
    class_rel = relationship("Class", back_populates="tests")

    def __repr__(self):
        return f"<Test(test_id={self.test_id}, test_name='{self.test_name}', score={self.score})>"
