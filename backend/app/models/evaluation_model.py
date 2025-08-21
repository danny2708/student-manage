from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from app.database import Base
from sqlalchemy.orm import relationship


class Evaluation(Base):
    """
    Model cho bảng evaluations.
    """
    __tablename__ = 'evaluations'
    evaluation_id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.student_id'), nullable=False)
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'), nullable=False)
    evaluation_type = Column(Text)
    evaluation_date = Column(Date, nullable=False)

    # Mối quan hệ với học sinh và giáo viên (many-to-one)
    student = relationship("Student", back_populates="evaluations")
    teacher = relationship("Teacher", back_populates="evaluations")