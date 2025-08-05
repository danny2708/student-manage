from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class StudentParent(Base):
    __tablename__ = "studentparent"

    studentparent_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("parents.parent_id"), nullable=False)

    student = relationship("Student", backref="parents_link")
    parent = relationship("Parent", backref="students_link")

