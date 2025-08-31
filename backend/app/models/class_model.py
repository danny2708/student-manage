from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.association_tables import student_class_association

class Class(Base):
    __tablename__ = 'classes'
    class_id = Column(Integer, primary_key=True)
    class_name = Column(String(50), unique=True, nullable=False)
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    fee = Column(Integer, nullable=False)
    
    subject = relationship("Subject", back_populates="classes")
    teacher = relationship("Teacher", back_populates="classes")

    students = relationship(
        "Student",
        secondary=student_class_association,
        back_populates="classes"
    )
    
    # Mối quan hệ với enrollments và attendances (one-to-many) với cascade delete
    enrollments = relationship(
        "Enrollment",
        back_populates="class_obj",
        cascade="all, delete-orphan"
    )
    attendances = relationship(
        "Attendance",
        back_populates="class_obj",
        cascade="all, delete-orphan"
    )
    schedules = relationship(
        "Schedule",
        back_populates="class_info",
        cascade="all, delete-orphan"
    )
    
    # Mối quan hệ với Test với cascade delete
    tests = relationship(
        "Test",
        back_populates="class_rel",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Class(name='{self.class_name}')>"
