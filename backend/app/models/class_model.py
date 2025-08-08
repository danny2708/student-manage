# app/models/class_model.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.association_tables import StudentClassAssociation

class Class(Base):
    """
    Model cho bảng classes.
    """
    __tablename__ = 'classes'
    class_id = Column(Integer, primary_key=True)
    class_name = Column(String(50), unique=True, nullable=False)
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'))

    # Mối quan hệ với giáo viên (one-to-one)
    teacher = relationship("Teacher", back_populates="classes")

    # Mối quan hệ với học sinh (many-to-many)
    students = relationship("Student", secondary=StudentClassAssociation, back_populates="classes")

    # Mối quan hệ với enrollments và attendances (one-to-many)
    enrollments = relationship("Enrollment", back_populates="class_")
    attendances = relationship("Attendance", back_populates="class_")

    def __repr__(self):
        return f"<Class(name='{self.class_name}')>"