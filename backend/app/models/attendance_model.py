from sqlalchemy import Column, Integer, Date, String, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship
class Attendance(Base):
    """
    """
    __tablename__ = 'attendances'
    attendance_id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey('students.student_id'), nullable=False)
    class_id = Column(Integer, ForeignKey('classes.class_id'), nullable=False)
    attendance_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)

    # Mối quan hệ với học sinh và lớp học (many-to-one)
    student = relationship("Student", back_populates="attendances")
    class_ = relationship("Class", back_populates="attendances")
