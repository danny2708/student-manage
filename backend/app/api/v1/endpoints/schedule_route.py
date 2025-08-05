from sqlalchemy import Column, Integer, String, Time, ForeignKey
from app.database import Base

class Schedule(Base):
    __tablename__ = "schedules"

    schedule_id = Column(Integer, primary_key=True, index=True)
    class_id = Column(Integer, ForeignKey("classes.class_id"))
    day_of_week = Column(String)
    start_time = Column(Time)
    end_time = Column(Time)
