# app/models/class_model.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.association_tables import student_class_association

class Class(Base):
    """
    Model cho bảng classes.
    """
    __tablename__ = 'classes'
    class_id = Column(Integer, primary_key=True)
    class_name = Column(String(50), unique=True, nullable=False)
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'))
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

    def __repr__(self):
        return f"<Class(name='{self.class_name}')>"