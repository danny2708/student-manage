from sqlalchemy import Column, Integer, ForeignKey, Float, Date
from sqlalchemy.orm import relationship
from app.database import Base

class Score(Base):
    __tablename__ = "scores"

    score_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    score = Column(Float, nullable=False)
    exam_date = Column(Date, nullable=False)

    student = relationship("Student", backref="scores")
    subject = relationship("Subject", backref="scores_for_subject")

