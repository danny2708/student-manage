# app/models/student_model.py
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.association_tables import student_parent_association, student_class_association

class Student(Base):
    __tablename__ = 'students'

    student_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), unique=True, nullable=False)

    # Many-to-many with Parent
    parents = relationship(
        "Parent",
        secondary=student_parent_association,
        back_populates="children"
    )

    # Many-to-many with Class
    classes = relationship(
        "Class",
        secondary=student_class_association,
        back_populates="students"
    )

    # Other one-to-many relationships
    scores = relationship("Score", back_populates="student")
    tuitions = relationship("Tuition", back_populates="student")
    enrollments = relationship("Enrollment", back_populates="student")
    attendances = relationship("Attendance", back_populates="student")
    evaluations = relationship("Evaluation", back_populates="student")

    user = relationship("User", back_populates="student")

    def __repr__(self):
        return f"<Student(user_id='{self.user_id}')>"
