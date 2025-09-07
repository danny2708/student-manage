from sqlalchemy.orm import relationship
from sqlalchemy import Column, ForeignKey, Integer, Date, Enum, Time
from app.database import Base
import enum


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"


class Attendance(Base):
    __tablename__ = "attendances"

    attendance_id = Column(Integer, primary_key=True, index=True)
    student_user_id = Column(Integer, ForeignKey("students.user_id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.class_id", ondelete="CASCADE"), nullable=False)
    attendance_date = Column(Date)
    status = Column(Enum(AttendanceStatus))
    checkin_time = Column(Time, nullable=True)

    # Mối quan hệ với học sinh và lớp học (many-to-one)
    student = relationship("Student", back_populates="attendances")
    class_obj = relationship("Class", back_populates="attendances")

    def __repr__(self):
        return f"<Attendance(student_user_id={self.student_user_id}, class_id={self.class_id}, date={self.attendance_date})>"
