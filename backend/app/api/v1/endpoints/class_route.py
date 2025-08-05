from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class Class(Base):
    __tablename__ = "classes"

    class_id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.teacher_id"))
