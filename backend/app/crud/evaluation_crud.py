from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    evaluation_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    class_id = Column(Integer, ForeignKey("classes.class_id"))
    type = Column(String)
    description = Column(String)
    score = Column(Integer)
    date_recorded = Column(Date)