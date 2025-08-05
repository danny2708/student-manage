from sqlalchemy import Column, Integer, ForeignKey, Float, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class TeacherPoint(Base):
    __tablename__ = "teacherpoints"

    point_id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"), nullable=False)
    point_value = Column(Float, nullable=False) # Giá trị điểm thưởng/phạt
    reason = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    teacher = relationship("Teacher", backref="points_history")

