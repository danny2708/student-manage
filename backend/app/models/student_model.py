# app/models/student_model.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

# Import Base và bảng liên kết
from app.database import Base
from app.models.association_tables import StudentParentAssociation, StudentClassAssociation

class Student(Base):
    """
    Model cho bảng students.
    """
    __tablename__ = 'students'
    student_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), unique=True, nullable=False)

    # Mối quan hệ với người dùng (one-to-one)
    user = relationship("User", back_populates="student")

    # Mối quan hệ với phụ huynh (many-to-many)
    parents = relationship("Parent", secondary= StudentParentAssociation, back_populates="children")

    # Mối quan hệ với lớp học (many-to-many)
    classes = relationship("Class", secondary=StudentClassAssociation.__table__, back_populates="students")

    # Mối quan hệ với các bảng khác (one-to-many)
    scores = relationship("Score", back_populates="student")
    tuitions = relationship("Tuition", back_populates="student")
    enrollments = relationship("Enrollment", back_populates="student")
    attendances = relationship("Attendance", back_populates="student")
    evaluations = relationship("Evaluation", back_populates="student")

    def __repr__(self):
        return f"<Student(user_id='{self.user_id}')>"
