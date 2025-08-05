from sqlachemy import Column, Integer, String, Float, ForeignKey
from app.database import Base

class TuitionFee(Base):
    __tablename__ = ""

    fee_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    amount = Column(Float, nullable=False)
    due_date = Column(String, nullable=False)
    status = Column(String, nullable=False)
