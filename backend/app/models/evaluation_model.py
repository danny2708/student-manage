from enum import Enum
from sqlalchemy import Column, Integer, Date, ForeignKey, Text
from app.database import Base
from sqlalchemy.orm import relationship

# Enum cho cột evaluation_type
class EvaluationType(str, Enum):
    """
    Định nghĩa các loại đánh giá có thể có.
    """
    initial = "initial"
    study = "study"
    discipline = "discipline"
    
class Evaluation(Base):
    """
    Model cho bảng evaluations.
    """
    __tablename__ = 'evaluations'
    evaluation_id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.student_id'), nullable=False)
    teacher_id = Column(Integer, ForeignKey('teachers.teacher_id'), nullable=False)
    evaluation_type = Column(Text, nullable=False)
    evaluation_date = Column(Date, nullable=False)
    study_point = Column(Integer, nullable=False)
    discipline_point = Column(Integer, nullable=False)
    evaluation_content = Column(Text, nullable=False)
    
    # Mối quan hệ với học sinh và giáo viên (many-to-one)
    student = relationship("Student", back_populates="evaluations")
    teacher = relationship("Teacher", back_populates="evaluations")