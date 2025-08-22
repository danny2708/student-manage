from sqlalchemy import Column, Integer, ForeignKey, Date, DECIMAL 
from sqlalchemy.orm import relationship
from app.database import Base

class Tuition(Base):
    """
    Model cho bảng tuition.
    """
    __tablename__ = 'tuition'
    tuition_id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.student_id'), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    payment_date = Column(Date, nullable=False)
    term = Column(Integer, nullable=False)

    # Mối quan hệ với học sinh (many-to-one)
    student = relationship("Student", back_populates="tuitions")

