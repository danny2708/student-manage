from sqlalchemy import Column, Integer, Date, ForeignKey
from app.database import Base

class Enrollment(Base):
    __tablename__ = "enrollments"

    enrollment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    class_id = Column(Integer, ForeignKey("classes.class_id"))
    enrolled_at = Column(Date)