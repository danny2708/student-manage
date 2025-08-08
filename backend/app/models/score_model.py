from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Date
from sqlalchemy.orm import relationship
from app.database import Base

class Score(Base):
    """
    Model cho bảng scores.
    """
    __tablename__ = 'scores'
    score_id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.student_id'), nullable=False)
    subject_id = Column(Integer, ForeignKey('subjects.subject_id'), nullable=False)
    score = Column(DECIMAL(5, 2), nullable=False)
    exam_date = Column(Date, nullable=False)

    # Mối quan hệ với học sinh và môn học (many-to-one)
    student = relationship("Student", back_populates="scores")
    subject = relationship("Subject")
