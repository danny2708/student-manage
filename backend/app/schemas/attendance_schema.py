from sqlachemy import Column, Integer, Date, String, ForeignKey
from app.database import Base

class Attendance(Base):
    __tablename__ = "attendances"

    attendance_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    class_id = Column(Integer, ForeignKey("classes.class_id"))
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False)

